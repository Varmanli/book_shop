/**
 * Lightweight allowlist-based HTML sanitizer for blog post content.
 *
 * Allows only the subset of tags produced by the TipTap editor.
 * Strips everything else, including all event handlers, javascript:/data: URLs,
 * and any tag not on the allowlist (script, style, iframe, img, svg, form, …).
 *
 * Book embed divs are extracted BEFORE this function is called (in parseSegments),
 * so `<div data-book-embed="…">` never reaches the sanitizer.
 */

// Tags allowed in rendered post content
const ALLOWED_TAGS = new Set([
  "p", "h2", "h3", "h4",
  "strong", "em", "u", "s", "code", "pre",
  "blockquote",
  "ul", "ol", "li",
  "a",
  "br", "hr",
  "span",
]);

// Per-tag attribute allowlist
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a:    new Set(["href", "target", "rel"]),
  span: new Set(["class"]),
  code: new Set(["class"]),
  pre:  new Set(["class"]),
};

// href must start with one of these schemes
const SAFE_HREF_RE = /^(https?:\/\/|\/|#|mailto:)/i;

// Escape special characters inside attribute values
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Parse and rebuild a single opening tag's attributes, keeping only safe ones
function sanitizeAttrs(tagName: string, rawAttrs: string): string {
  const allowed = ALLOWED_ATTRS[tagName];
  if (!allowed) return "";

  const parts: string[] = [];

  // Match name="value", name='value', or bare name=value
  const attrRe = /\s+([a-zA-Z][a-zA-Z0-9\-:_]*)\s*=\s*(?:"([^"]*?)"|'([^']*?)'|(\S+?)(?=\s|\/?>|$))/g;
  let m: RegExpExecArray | null;

  while ((m = attrRe.exec(rawAttrs)) !== null) {
    const name  = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? "";

    // Skip anything not on the allowlist
    if (!allowed.has(name)) continue;

    // Block event handlers (on*) — belt-and-suspenders
    if (/^on/i.test(name)) continue;

    // Validate href
    if (name === "href") {
      if (!SAFE_HREF_RE.test(value.trim())) continue;
      // Force external links to open safely
      parts.push(`href="${escapeAttr(value)}" rel="noopener noreferrer"`);
      continue;
    }

    parts.push(`${name}="${escapeAttr(value)}"`);
  }

  return parts.length > 0 ? " " + parts.join(" ") : "";
}

/**
 * Strip all HTML tags and attributes not on the allowlist.
 * Returns sanitized HTML safe for `dangerouslySetInnerHTML`.
 */
export function sanitizePostHtml(html: string): string {
  if (!html) return "";

  return html.replace(
    // Match any HTML tag: opening, closing, or self-closing
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?(\/?)>/g,
    (_, closing: string, rawTag: string, rawAttrs: string | undefined, selfClose: string) => {
      const tag = rawTag.toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) return ""; // strip disallowed tag entirely

      if (closing) return `</${tag}>`;

      const safeAttrs = sanitizeAttrs(tag, rawAttrs ?? "");
      return `<${tag}${safeAttrs}${selfClose ? " /" : ""}>`;
    }
  );
}
