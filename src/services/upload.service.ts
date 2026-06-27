export type UploadedFile = {
  url: string;
  name: string;
  size: number;
};

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/images/placeholder-book.png";
  return url;
}

export function extractFileKey(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1] ?? url;
}
