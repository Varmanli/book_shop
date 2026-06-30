import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { storageService } from "@/services/storage.service";
import { auth } from "@/lib/auth";
import sharp from "sharp";

export type UploadContext = "book" | "blog" | "logo" | "avatar" | "page" | "general" | "category" | "genre" | "hero";

export interface UploadedFileResponse {
  success: true;
  file: {
    url: string;
    key: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
  };
}

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB default

const CONTEXT_FOLDERS: Record<UploadContext, string> = {
  book: "uploads/books",
  blog: "uploads/blog",
  logo: "uploads/logos",
  avatar: "uploads/avatars",
  page: "uploads/pages",
  general: "uploads/general",
  category: "uploads/categories",
  genre: "uploads/genres",
  hero: "uploads/hero",
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const context = (formData.get("context") as UploadContext | null) ?? "general";
    const maxSizeMB = Number(formData.get("maxSizeMB") ?? 10);
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "فایلی ارسال نشده است" }, { status: 400 });
    }

    const mimeType = file.type;
    const ext = ALLOWED_MIME_TYPES[mimeType];
    if (!ext) {
      return NextResponse.json(
        { success: false, error: "نوع فایل مجاز نیست. فقط JPEG، PNG، WebP و GIF پشتیبانی می‌شوند." },
        { status: 400 }
      );
    }

    if (file.size > Math.min(maxBytes, MAX_SIZE_BYTES)) {
      return NextResponse.json(
        { success: false, error: `حجم فایل از ${maxSizeMB} مگابایت بیشتر است` },
        { status: 400 }
      );
    }

    const folder = CONTEXT_FOLDERS[context] ?? CONTEXT_FOLDERS.general;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uuid = randomUUID();
    const filename = `${uuid}${ext}`;
    const key = `${folder}/${year}/${month}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    let width: number | null = null;
    let height: number | null = null;
    try {
      const meta = await sharp(buffer).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {}

    const { url } = await storageService.upload(key, buffer, mimeType);

    return NextResponse.json({
      success: true,
      file: {
        url,
        key,
        filename,
        originalName: file.name,
        mimeType,
        size: file.size,
        width,
        height,
      },
    } satisfies UploadedFileResponse);
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json({ success: false, error: "خطا در آپلود فایل" }, { status: 500 });
  }
}
