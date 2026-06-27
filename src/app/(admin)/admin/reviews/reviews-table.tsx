"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminUpdateReviewStatusAction, adminDeleteReviewAction } from "@/actions/review.actions";
import type { ReviewWithDetails } from "@/repositories/reviews.repository";

const STATUS_MAP = {
  PENDING: { label: "در انتظار", cls: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "تأیید شده", cls: "bg-green-100 text-green-700" },
  REJECTED: { label: "رد شده", cls: "bg-red-100 text-red-700" },
} as const;

interface Props {
  reviews: ReviewWithDetails[];
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 12 12" fill={s <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M6 1l1.2 2.5 2.8.4-2 2 .5 2.8L6 7.4l-2.5 1.3.5-2.8-2-2 2.8-.4L6 1z" />
        </svg>
      ))}
    </span>
  );
}

interface ModalState {
  type: "approve" | "reject" | "delete" | "view";
  review: ReviewWithDetails;
}

export function ReviewsTable({ reviews }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [pending, startTransition] = useTransition();

  function openModal(type: ModalState["type"], review: ReviewWithDetails) {
    setAdminNote(review.adminNote ?? "");
    setModal({ type, review });
  }

  function handleStatusUpdate(status: "APPROVED" | "REJECTED") {
    if (!modal) return;
    startTransition(async () => {
      const res = await adminUpdateReviewStatusAction(modal.review.id, status, adminNote);
      if (res.success) {
        toast.success(status === "APPROVED" ? "نظر تأیید شد" : "نظر رد شد");
        setModal(null);
        router.refresh();
      } else {
        toast.error(!res.success ? res.error : "خطا");
      }
    });
  }

  function handleDelete() {
    if (!modal) return;
    startTransition(async () => {
      const res = await adminDeleteReviewAction(modal.review.id);
      if (res.success) {
        toast.success("نظر حذف شد");
        setModal(null);
        router.refresh();
      } else {
        toast.error(!res.success ? res.error : "خطا");
      }
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">کتاب</th>
                <th className="px-4 py-3 text-start font-medium">کاربر</th>
                <th className="px-4 py-3 text-start font-medium">امتیاز</th>
                <th className="px-4 py-3 text-start font-medium">محتوا</th>
                <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th className="px-4 py-3 text-start font-medium">تاریخ</th>
                <th className="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">نظری یافت نشد</td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const s = STATUS_MAP[review.status];
                  return (
                    <tr key={review.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="max-w-[140px] truncate font-medium text-foreground" title={review.book.title}>
                          {review.book.title}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <p>{review.user.name ?? "—"}</p>
                        <p className="text-muted-foreground/70">{(review.user as { email?: string }).email ?? ""}</p>
                      </td>
                      <td className="px-4 py-3"><StarDisplay rating={review.rating} /></td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openModal("view", review)}
                          className="max-w-[180px] truncate text-start text-xs text-muted-foreground hover:text-foreground"
                          title={review.content}
                        >
                          {review.title ? <span className="font-medium text-foreground">{review.title} — </span> : null}
                          {review.content}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("fa-IR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {review.status !== "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => openModal("approve", review)}
                              className="rounded-lg bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                            >
                              تأیید
                            </button>
                          )}
                          {review.status !== "REJECTED" && (
                            <button
                              type="button"
                              onClick={() => openModal("reject", review)}
                              className="rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                            >
                              رد
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openModal("delete", review)}
                            className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            {modal.type === "view" && (
              <>
                <h3 className="mb-4 text-base font-bold text-foreground">متن کامل نظر</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <StarDisplay rating={modal.review.rating} />
                    <span className="text-sm font-semibold text-foreground">{modal.review.user.name}</span>
                  </div>
                  {modal.review.title && <p className="text-sm font-semibold text-foreground">{modal.review.title}</p>}
                  <p className="text-sm leading-relaxed text-foreground/80">{modal.review.content}</p>
                  {modal.review.adminNote && (
                    <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                      یادداشت ادمین: {modal.review.adminNote}
                    </div>
                  )}
                </div>
                <button onClick={() => setModal(null)} className="mt-5 w-full rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-muted">
                  بستن
                </button>
              </>
            )}

            {(modal.type === "approve" || modal.type === "reject") && (
              <>
                <h3 className="mb-4 text-base font-bold text-foreground">
                  {modal.type === "approve" ? "تأیید نظر" : "رد نظر"}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {modal.type === "approve"
                    ? "این نظر پس از تأیید در صفحه کتاب نمایش داده می‌شود."
                    : "این نظر رد خواهد شد و به کاربر نمایش داده نمی‌شود."}
                </p>
                <div className="mb-4 space-y-1.5">
                  <label className="text-sm font-medium text-foreground">یادداشت داخلی (اختیاری)</label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="دلیل رد یا توضیح..."
                    className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(modal.type === "approve" ? "APPROVED" : "REJECTED")}
                    disabled={pending}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60 ${modal.type === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  >
                    {pending ? "در حال ذخیره..." : modal.type === "approve" ? "تأیید کن" : "رد کن"}
                  </button>
                  <button onClick={() => setModal(null)} className="rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">
                    انصراف
                  </button>
                </div>
              </>
            )}

            {modal.type === "delete" && (
              <>
                <h3 className="mb-2 text-base font-bold text-foreground">حذف نظر</h3>
                <p className="mb-5 text-sm text-muted-foreground">آیا مطمئنید که می‌خواهید این نظر را حذف کنید؟ این عمل غیرقابل بازگشت است.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={pending}
                    className="flex-1 rounded-xl bg-destructive py-2.5 text-sm font-bold text-white hover:bg-destructive/90 disabled:opacity-60"
                  >
                    {pending ? "در حال حذف..." : "حذف کن"}
                  </button>
                  <button onClick={() => setModal(null)} className="rounded-xl border border-border px-4 text-sm font-medium hover:bg-muted">
                    انصراف
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
