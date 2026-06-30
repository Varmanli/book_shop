import { env } from "@/lib/env";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface StorageUploadResult {
  url: string;
  key: string;
}

interface StorageDriver {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult>;
  delete(key: string): Promise<void>;
}

class LocalDriver implements StorageDriver {
  async upload(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult> {
    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    const url = `/${key}`;
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    const { unlink } = await import("fs/promises");
    const filePath = path.join(process.cwd(), "public", key);
    await unlink(filePath).catch(() => {});
  }
}

class S3Driver implements StorageDriver {
  private getClient() {
    const { S3Client } = require("@aws-sdk/client-s3");
    if (!env.S3_ENDPOINT || !env.S3_REGION || !env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw new Error("S3 configuration is incomplete. Check S3_* environment variables.");
    }
    return new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<StorageUploadResult> {
    const { PutObjectCommand } = require("@aws-sdk/client-s3");
    const client = this.getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: "public-read",
      })
    );
    const baseUrl = env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? `${env.S3_ENDPOINT}/${env.S3_BUCKET}`;
    const url = `${baseUrl}/${key}`;
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
    const client = this.getClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
      })
    ).catch(() => {});
  }
}

function getDriver(): StorageDriver {
  if (env.STORAGE_DRIVER === "s3") return new S3Driver();
  return new LocalDriver();
}

export const storageService = {
  upload: (key: string, buffer: Buffer, mimeType: string) =>
    getDriver().upload(key, buffer, mimeType),

  delete: (key: string) => getDriver().delete(key),
};
