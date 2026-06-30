"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Node, mergeAttributes } from "@tiptap/core";
import { cn } from "@/lib/utils";

// ─── BookEmbed custom node ────────────────────────────────────────────────────

interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  slug: string;
  coverImage: string | null;
  price: number;
}

const BookEmbedNode = Node.create({
  name: "bookEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      bookId: { default: null, parseHTML: (el) => el.getAttribute("data-book-embed") },
      bookTitle: { default: null, parseHTML: (el) => el.getAttribute("data-book-title") },
      bookAuthor: { default: null, parseHTML: (el) => el.getAttribute("data-book-author") },
      bookImage: { default: null, parseHTML: (el) => el.getAttribute("data-book-image") },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-book-embed]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs: Record<string, string> = {
      "data-book-embed": HTMLAttributes.bookId ?? "",
    };
    if (HTMLAttributes.bookTitle) attrs["data-book-title"] = HTMLAttributes.bookTitle;
    if (HTMLAttributes.bookAuthor) attrs["data-book-author"] = HTMLAttributes.bookAuthor;
    if (HTMLAttributes.bookImage) attrs["data-book-image"] = HTMLAttributes.bookImage;
    return ["div", mergeAttributes(attrs)];
  },

  addNodeView() {
    return ({ node, getPos, editor: _ed }) => {
      const dom = document.createElement("div");
      dom.className =
        "book-embed-preview my-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 cursor-default select-none";
      dom.contentEditable = "false";

      const img = document.createElement("div");
      img.className =
        "h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center text-2xl";
      if (node.attrs.bookImage) {
        const i = document.createElement("img");
        i.src = node.attrs.bookImage;
        i.alt = node.attrs.bookTitle ?? "";
        i.className = "h-full w-full object-cover";
        img.appendChild(i);
      } else {
        img.textContent = "📖";
      }

      const info = document.createElement("div");
      info.className = "min-w-0 flex-1";
      const titleEl = document.createElement("p");
      titleEl.className = "text-sm font-semibold text-foreground truncate";
      titleEl.textContent = node.attrs.bookTitle ?? node.attrs.bookId ?? "کتاب";
      const authorEl = document.createElement("p");
      authorEl.className = "text-xs text-muted-foreground mt-0.5";
      authorEl.textContent = node.attrs.bookAuthor ? `نویسنده: ${node.attrs.bookAuthor}` : "";

      const badge = document.createElement("span");
      badge.className =
        "shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary";
      badge.textContent = "کتاب";

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className =
        "shrink-0 rounded-lg p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors";
      removeBtn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
      removeBtn.addEventListener("click", () => {
        const pos = typeof getPos === "function" ? getPos() : null;
        if (pos !== null && pos !== undefined) {
          _ed.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
        }
      });

      info.appendChild(titleEl);
      info.appendChild(authorEl);
      dom.appendChild(img);
      dom.appendChild(info);
      dom.appendChild(badge);
      dom.appendChild(removeBtn);

      return { dom };
    };
  },
});

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-muted",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />;
}

// ─── Book picker modal ────────────────────────────────────────────────────────

function BookPickerModal({
  onInsert,
  onClose,
}: {
  onInsert: (book: BookSearchResult) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/books/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.books ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    search("");
  }, [search]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-bold text-foreground">درج کتاب</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-muted"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border px-3 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی کتاب..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              در حال جستجو...
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <span className="text-3xl">📚</span>
              {query ? "کتابی یافت نشد" : "برای جستجو تایپ کنید"}
            </div>
          ) : (
            results.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => { onInsert(book); onClose(); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50"
              >
                <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center text-xl">
                  {book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "📖"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                  {book.price > 0 && (
                    <p className="mt-0.5 text-xs font-medium text-primary">
                      {book.price.toLocaleString("fa-IR")} تومان
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function EditorToolbar({
  editor,
  onOpenBookPicker,
}: {
  editor: Editor;
  onOpenBookPicker: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
      {/* Headings */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="عنوان ۲"
      >
        <span className="text-xs font-bold">H2</span>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="عنوان ۳"
      >
        <span className="text-xs font-bold">H3</span>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive("paragraph")}
        title="پاراگراف"
      >
        <span className="text-xs">¶</span>
      </ToolbarBtn>

      <Divider />

      {/* Inline formatting */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="بولد"
      >
        <strong className="text-xs">B</strong>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="ایتالیک"
      >
        <em className="text-xs">I</em>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="زیرخط"
      >
        <span className="text-xs underline">U</span>
      </ToolbarBtn>

      <Divider />

      {/* Blocks */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="نقل‌قول"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 4h4v5H2zM8 4h4v5H8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M6 9l-2 2M12 9l-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="لیست بولت‌دار"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="2.5" cy="4" r="1" fill="currentColor" />
          <circle cx="2.5" cy="7.5" r="1" fill="currentColor" />
          <circle cx="2.5" cy="11" r="1" fill="currentColor" />
          <path d="M5 4h7M5 7.5h7M5 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="لیست شماره‌دار"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M1.5 3h1.5v3M1.5 6h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 4h6M6 8h6M6 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M1.5 9.5c0-.5.5-1 1-.8.5.2.5.8 0 1l-1 1.3h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarBtn>

      <Divider />

      {/* Clear formatting */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        title="پاک‌سازی فرمت"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 12l4-4m0 0L2 3h8l-3 5m-1 0l3 4h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </ToolbarBtn>

      <Divider />

      {/* Insert book */}
      <button
        type="button"
        onClick={onOpenBookPicker}
        title="درج کتاب"
        className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 4v6M4 7h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        درج کتاب
      </button>
    </div>
  );
}

// ─── Main RichTextEditor ──────────────────────────────────────────────────────

export interface RichTextEditorProps {
  value?: string | null;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  name?: string;
}

export function RichTextEditor({
  value,
  onChange,
  error,
  placeholder = "محتوای مقاله را اینجا بنویسید...",
  disabled = false,
  minHeight = 320,
  name,
}: RichTextEditorProps) {
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [html, setHtml] = useState(value ?? "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      BookEmbedNode,
    ],
    content: value ?? "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "outline-none min-h-[inherit] px-4 py-4 text-sm leading-relaxed",
        dir: "rtl",
        "data-placeholder": placeholder,
      },
    },
    onUpdate({ editor: e }) {
      const content = e.getHTML();
      setHtml(content);
      onChange?.(content);
    },
    immediatelyRender: false,
  });

  // Sync external value changes (edit mode initial load)
  useEffect(() => {
    if (!editor) return;
    if (value && editor.isEmpty) {
      editor.commands.setContent(value);
      setHtml(value);
    }
  }, [editor, value]);

  function insertBook(book: BookSearchResult) {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "bookEmbed",
        attrs: {
          bookId: book.id,
          bookTitle: book.title,
          bookAuthor: book.author,
          bookImage: book.coverImage ?? null,
        },
      })
      .run();
  }

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-background transition",
          error
            ? "border-destructive/50 focus-within:border-destructive/40 focus-within:ring-4 focus-within:ring-destructive/10"
            : "border-border/70 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10"
        )}
      >
        {editor && (
          <EditorToolbar editor={editor} onOpenBookPicker={() => setBookPickerOpen(true)} />
        )}

        <div style={{ minHeight }}>
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none rtl [&_.book-embed-preview]:!m-0"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs font-medium text-destructive">{error}</p>
      )}

      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={html} />}

      {/* Book picker modal */}
      {bookPickerOpen && (
        <BookPickerModal
          onInsert={insertBook}
          onClose={() => setBookPickerOpen(false)}
        />
      )}
    </div>
  );
}
