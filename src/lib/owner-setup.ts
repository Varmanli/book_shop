import crypto from "crypto";

export const OWNER_SETUP_COOKIE = "owner-setup";
const SETUP_TTL_SECONDS = 10 * 60;

function timingSafeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function isValidSetupToken(token: string | null): boolean {
  const secret = process.env.OWNER_SETUP_TOKEN;
  return !!secret && !!token && timingSafeEqual(token, secret);
}

export function createSetupCookieValue(): string | null {
  const secret = process.env.OWNER_SETUP_TOKEN;
  if (!secret) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + SETUP_TTL_SECONDS;
  const nonce = crypto.randomBytes(24).toString("base64url");
  const payload = `${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isValidSetupCookie(value: string | undefined): boolean {
  const secret = process.env.OWNER_SETUP_TOKEN;
  if (!secret || !value) return false;

  const [expiresAt, nonce, signature] = value.split(".");
  if (!expiresAt || !nonce || !signature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;

  const payload = `${expiresAt}.${nonce}`;
  return timingSafeEqual(signature, sign(payload, secret));
}

export const ownerSetupCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/setup/owner",
  maxAge: SETUP_TTL_SECONDS,
};
