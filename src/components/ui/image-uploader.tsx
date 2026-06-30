"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon, RefreshCw } from "lucide-react";
import type { UploadContext } from "@/app/api/uploads/route";

export type { UploadContext };

export type UploadedFile = {
  url: string;
  key?: string;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  width?: number | null;
  height?: number | null;
};

export interface ImageUploaderProps {
  value?: UploadedFile | string | null;
  onChange: (file: UploadedFile | null) => void;
  context?: UploadContext;
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  required?: boolean;
  aspectRatio?: "square" | "cover" | "banner" | "free";
  previewClassName?: string;
  className?: string;
  name?: string;
}

const ASPECT_CLASSES: Record<string, string> = {
  square: "aspect-square",
  cover: "aspect-[3/4]",
  banner: "aspect-[16/6]",
  free: "aspect-auto min-h-[140px]",
};

function getUrl(
  value: UploadedFile | string | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value || null;
  return value.url || null;
}


export function ImageUploader({
  value,
  onChange,
  context = "general",
  label,
  description,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  maxSizeMB = 10,
  disabled = false,
  required = false,
  aspectRatio = "free",
  previewClassName,
  className,
  name,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const currentUrl = previewUrl ?? getUrl(value);

  const validateAndUpload = useCallback(
    async (file: File) => {
      setError(null);

      const allowedTypes = accept.split(",").map((t) => t.trim());
      if (!allowedTypes.includes(file.type)) {
        setError(
          "نوع فایل مجاز نیست. فقط JPEG، PNG، WebP و GIF پشتیبانی می‌شوند.",
        );
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`حجم فایل از ${maxSizeMB} مگابایت بیشتر است`);
        return;
      }

      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      setUploading(true);
      setProgress(0);

      // Simulate progress until real response
      const interval = setInterval(() => {
        setProgress((p) => (p < 85 ? p + Math.random() * 15 : p));
      }, 200);

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("context", context);
        fd.append("maxSizeMB", String(maxSizeMB));

        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const data = await res.json();

        clearInterval(interval);

        if (!res.ok || !data.success) {
          setError(data.error ?? "خطا در آپلود فایل");
          setPreviewUrl(null);
          onChange(null);
          return;
        }

        setProgress(100);
        setPreviewUrl(data.file.url);
        onChange(data.file as UploadedFile);
      } catch {
        clearInterval(interval);
        setError("خطا در ارتباط با سرور");
        setPreviewUrl(null);
      } finally {
        setUploading(false);
      }
    },
    [accept, context, maxSizeMB, onChange],
  );

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    void validateAndUpload(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || uploading) return;
      handleFile(e.dataTransfer.files[0]);
    },
    [disabled, uploading, handleFile],
  );

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const aspectCls = ASPECT_CLASSES[aspectRatio] ?? ASPECT_CLASSES.free;

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      {description && (
        <p className="mb-2 text-xs text-muted-foreground">{description}</p>
      )}

      {/* Hidden input to carry URL into the form */}
      {name && <input type="hidden" name={name} value={currentUrl ?? ""} />}

      {currentUrl ? (
        /* Preview card */
        <div
          className={`group relative overflow-hidden rounded-2xl border border-border bg-muted/30 ${aspectCls} ${previewClassName ?? ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="پیش‌نمایش"
            className="h-full w-full object-cover"
          />

          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
              <p className="text-sm font-medium text-white">
                در حال آپلود... {Math.round(progress)}٪
              </p>
              <div className="w-3/4 overflow-hidden rounded-full bg-white/20 h-1.5">
                <div
                  className="h-full rounded-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {!uploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => !disabled && inputRef.current?.click()}
                disabled={disabled}
                className="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-foreground shadow hover:bg-white disabled:opacity-50"
              >
                <RefreshCw size={13} />
                تغییر
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-2 text-xs font-semibold text-white shadow hover:bg-destructive/90 disabled:opacity-50"
              >
                <X size={13} />
                حذف
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled && !uploading)
              inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${aspectCls} ${
            disabled
              ? "cursor-not-allowed border-border/50 bg-muted/20 opacity-60"
              : isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          {uploading ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Upload size={22} className="animate-bounce text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                در حال آپلود... {Math.round(progress)}٪
              </p>
              <div className="w-full max-w-45 overflow-hidden rounded-full bg-border h-1.5">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${isDragging ? "bg-primary/20" : "bg-muted"}`}
              >
                <ImageIcon
                  size={22}
                  className={
                    isDragging ? "text-primary" : "text-muted-foreground"
                  }
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isDragging ? "اینجا رها کنید" : "کلیک کنید یا فایل را بکشید"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  JPEG، PNG، WebP، GIF — حداکثر {maxSizeMB} مگابایت
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
