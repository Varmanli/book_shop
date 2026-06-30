import { findRelatedBooks } from "@/repositories/book.repository";
import { ListingBookCard } from "./listing-book-card";

interface Props {
  bookId: string;
  categoryId: string;
  limit?: number;
}

export async function RelatedBooks({ bookId, categoryId, limit = 6 }: Props) {
  const related = await findRelatedBooks(bookId, categoryId, limit);

  if (related.length === 0) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-extrabold text-foreground">کتاب‌های مشابه</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {related.map((book) => (
          <ListingBookCard key={book.id} book={book} isLoggedIn={false} />
        ))}
      </div>
    </section>
  );
}
