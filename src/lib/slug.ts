/**
 * Generates a URL-safe slug from Persian or English text.
 *
 * Preserves Persian/Arabic letters and digits, lowercases Latin letters,
 * normalizes common Arabic variants to Persian, strips diacritics and
 * punctuation, converts whitespace/ZWNJ to hyphens.
 *
 * Examples:
 *   "چرا دوباره باید کتاب کاغذی بخوانیم؟" → "چرا-دوباره-باید-کتاب-کاغذی-بخوانیم"
 *   "A Simple English Blog Title"            → "a-simple-english-blog-title"
 *   "کتاب‌های دست‌دوم؛ انتخابی اقتصادی"   → "کتاب-های-دست-دوم-انتخابی-اقتصادی"
 */
export function slugify(text: string): string {
  return (
    text
      .trim()
      // Normalize common Arabic character variants to Persian
      .replace(/ي/g, "ی") // ي → ی
      .replace(/ك/g, "ک") // ك → ک
      .replace(/ة/g, "ه") // ة → ه
      // Remove Arabic diacritics (harakat, shadda, sukun …)
      .replace(/[ً-ٰٟ]/g, "")
      // Convert Zero Width Non-Joiner (‌) to hyphen
      .replace(/‌/g, "-")
      // Convert whitespace and underscores to hyphen
      .replace(/[\s_]+/g, "-")
      // Remove anything that is NOT:
      //   U+0621-U+06FF  Persian/Arabic letters & digits (starting after Arabic punctuation block)
      //   a-z A-Z 0-9    Latin letters and digits
      //   -              hyphen separator
      .replace(/[^ء-ۿݐ-ݿa-zA-Z0-9-]/g, "")
      // Collapse multiple consecutive hyphens
      .replace(/-{2,}/g, "-")
      // Strip leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
      // Lowercase Latin letters
      .toLowerCase()
  );
}

/** Generates a slug with a short timestamp suffix — always unique. */
export function uniqueSlug(base: string): string {
  const timestamp = Date.now().toString(36);
  const slug = slugify(base);
  return slug ? `${slug}-${timestamp}` : timestamp;
}
