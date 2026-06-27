import Image from "next/image";
import Link from "next/link";

interface CategoryMeta {
  icon: string;
  seed: string;
  gradient: string;
  accentColor: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  fiction: {
    icon: "📖",
    seed: "fiction-books",
    gradient: "from-violet-900/85 via-purple-800/60 to-transparent",
    accentColor: "bg-violet-500",
  },
  "non-fiction": {
    icon: "🔬",
    seed: "science-library",
    gradient: "from-sky-900/85 via-blue-800/60 to-transparent",
    accentColor: "bg-sky-500",
  },
  mystery: {
    icon: "🔍",
    seed: "mystery-dark",
    gradient: "from-gray-900/90 via-slate-800/65 to-transparent",
    accentColor: "bg-slate-500",
  },
  "sci-fi": {
    icon: "🚀",
    seed: "space-galaxy",
    gradient: "from-cyan-900/85 via-teal-800/60 to-transparent",
    accentColor: "bg-cyan-500",
  },
  romance: {
    icon: "❤️",
    seed: "romance-flowers",
    gradient: "from-rose-900/85 via-pink-800/60 to-transparent",
    accentColor: "bg-rose-500",
  },
  biography: {
    icon: "👤",
    seed: "biography-portrait",
    gradient: "from-amber-900/85 via-orange-800/60 to-transparent",
    accentColor: "bg-amber-500",
  },
  history: {
    icon: "🏛️",
    seed: "ancient-history",
    gradient: "from-stone-900/85 via-stone-700/60 to-transparent",
    accentColor: "bg-stone-500",
  },
  poetry: {
    icon: "🌸",
    seed: "poetry-nature",
    gradient: "from-fuchsia-900/85 via-pink-800/60 to-transparent",
    accentColor: "bg-fuchsia-500",
  },
  children: {
    icon: "🧒",
    seed: "children-colorful",
    gradient: "from-green-900/85 via-emerald-800/60 to-transparent",
    accentColor: "bg-green-500",
  },
  philosophy: {
    icon: "💭",
    seed: "philosophy-mind",
    gradient: "from-indigo-900/85 via-blue-900/60 to-transparent",
    accentColor: "bg-indigo-500",
  },
};

const DEFAULT_META: CategoryMeta = {
  icon: "📚",
  seed: "bookshelf-warm",
  gradient: "from-primary/85 via-primary/50 to-transparent",
  accentColor: "bg-primary",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  bookCount: number;
}

interface Props {
  categories: Category[];
}

export function CategoryGrid({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 py-20 text-center">
          <span className="text-5xl">📚</span>
          <p className="text-lg font-semibold text-muted-foreground">
            هنوز دسته‌بندی‌ای اضافه نشده است
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/30 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
            کشف کنید
          </span>
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            دسته‌بندی‌ها
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            از میان دسته‌بندی‌های متنوع، کتاب‌های مورد علاقه خود را بیابید
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, i) => {
            const meta = CATEGORY_META[category.slug] ?? DEFAULT_META;
            const image =
              category.image ??
              `https://picsum.photos/seed/${meta.seed}/600/400`;

            return (
              <CategoryCard
                key={category.id}
                category={category}
                meta={meta}
                image={image}
                index={i}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface CardProps {
  category: Category;
  meta: CategoryMeta;
  image: string;
  index: number;
}

function CategoryCard({ category, meta, image, index }: CardProps) {
  return (
    <Link
      href={`/books?category=${category.slug}`}
      className="group relative flex h-52 overflow-hidden rounded-2xl bg-card shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/10 sm:h-56"
      style={{
        animationFillMode: "both",
        animationDelay: `${index * 75}ms`,
      }}
    >
      {/* Background image */}
      <Image
        src={image}
        alt={category.name}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      />

      {/* Gradient overlay — always dark at bottom, darker on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${meta.gradient} transition-opacity duration-300 group-hover:opacity-95`}
      />

      {/* Top-right icon badge */}
      <div className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-xl shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        {meta.icon}
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        {/* Book count pill */}
        {category.bookCount > 0 && (
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            <span
              className={`h-1.5 w-1.5 rounded-full ${meta.accentColor}`}
            />
            {category.bookCount} کتاب
          </span>
        )}

        <h3 className="text-lg font-extrabold leading-tight text-white drop-shadow-sm">
          {category.name}
        </h3>

        {category.description && (
          <p className="mt-1 line-clamp-1 text-xs text-white/70">
            {category.description}
          </p>
        )}

        {/* "View" CTA — slides up on hover */}
        <div className="mt-2 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            مشاهده کتاب‌ها
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M7.5 3L4.5 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Subtle border glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-white/20 transition-all duration-300 group-hover:ring-2" />
    </Link>
  );
}
