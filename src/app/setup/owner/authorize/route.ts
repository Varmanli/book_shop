import { NextRequest, NextResponse } from "next/server";
import {
  createSetupCookieValue,
  isValidSetupToken,
  OWNER_SETUP_COOKIE,
  ownerSetupCookieOptions,
} from "@/lib/owner-setup";
import { ownerExists } from "@/services/role.service";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: NextRequest): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

export async function GET(request: NextRequest) {
  if (isRateLimited(request) || (await ownerExists())) {
    return NextResponse.redirect(new URL("/setup/owner", request.url));
  }

  if (!isValidSetupToken(request.nextUrl.searchParams.get("token"))) {
    return NextResponse.redirect(new URL("/setup/owner", request.url));
  }

  const value = createSetupCookieValue();
  if (!value) return new NextResponse(null, { status: 404 });

  const response = NextResponse.redirect(new URL("/setup/owner", request.url));
  response.cookies.set(OWNER_SETUP_COOKIE, value, ownerSetupCookieOptions);
  return response;
}
