const LOCAL_ORIGIN = "http://localhost";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getSafeRedirectTo(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return fallback;
  }

  try {
    const url = new URL(value, LOCAL_ORIGIN);
    if (url.origin !== LOCAL_ORIGIN) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function getAuthErrorFromResult(result: unknown): string | null {
  if (typeof result !== "string") {
    return null;
  }

  try {
    return new URL(result, LOCAL_ORIGIN).searchParams.get("error");
  } catch {
    return null;
  }
}
