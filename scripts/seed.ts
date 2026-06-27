import { loadEnvConfig } from "@next/env";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/password";

loadEnvConfig(process.cwd());

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL environment variable is required");

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

/* ── helpers ──────────────────────────────────────────────── */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/\-\-+/g, "-")
    .trim();
}

function fakeIsbn(seed: number): string {
  const n = (seed * 9301 + 49297) % 233280;
  return `978${String(n).padStart(10, "0").slice(0, 10)}`;
}

async function seed() {
  console.log("🌱 Starting seed...\n");

  // ── Categories ──────────────────────────────────────────────────────────────
  console.log("  📚 Upserting categories...");
  const [fiction, nonFiction, mystery, sciFi, poetry, children, philosophy, history] = await db
    .insert(schema.categories)
    .values([
      { name: "داستانی", slug: "fiction", description: "رمان‌ها و داستان‌های خیالی", image: "https://picsum.photos/seed/fiction/400/300" },
      { name: "غیرداستانی", slug: "non-fiction", description: "کتاب‌های واقعی و اطلاعاتی", image: "https://picsum.photos/seed/nonfiction/400/300" },
      { name: "معمایی", slug: "mystery", description: "داستان‌های جنایی و معما", image: "https://picsum.photos/seed/mystery/400/300" },
      { name: "علمی‌تخیلی", slug: "sci-fi", description: "داستان‌های علمی‌تخیلی", image: "https://picsum.photos/seed/scifi/400/300" },
      { name: "شعر", slug: "poetry", description: "دیوان‌ها و مجموعه‌های شعر", image: "https://picsum.photos/seed/poetry/400/300" },
      { name: "کودک و نوجوان", slug: "children", description: "کتاب‌های ویژه کودکان", image: "https://picsum.photos/seed/children/400/300" },
      { name: "فلسفه", slug: "philosophy", description: "کتاب‌های فلسفی و اندیشه", image: "https://picsum.photos/seed/philosophy/400/300" },
      { name: "تاریخ", slug: "history", description: "تاریخ ایران و جهان", image: "https://picsum.photos/seed/history/400/300" },
    ])
    .onConflictDoNothing()
    .returning();

  // Resolve existing categories if insert was no-op
  const allCategories = await db.query.categories.findMany();
  const cat = {
    fiction:     allCategories.find(c => c.slug === "fiction")!,
    nonFiction:  allCategories.find(c => c.slug === "non-fiction")!,
    mystery:     allCategories.find(c => c.slug === "mystery")!,
    sciFi:       allCategories.find(c => c.slug === "sci-fi")!,
    poetry:      allCategories.find(c => c.slug === "poetry")!,
    children:    allCategories.find(c => c.slug === "children")!,
    philosophy:  allCategories.find(c => c.slug === "philosophy")!,
    history:     allCategories.find(c => c.slug === "history")!,
  };

  // ── Genres ──────────────────────────────────────────────────────────────────
  console.log("  🏷️  Upserting genres...");
  await db
    .insert(schema.genres)
    .values([
      { name: "عاشقانه", slug: "romance" },
      { name: "هیجانی", slug: "thriller" },
      { name: "بیوگرافی", slug: "biography" },
      { name: "تاریخی", slug: "history-genre" },
      { name: "فضایی", slug: "space" },
      { name: "دیستوپیا", slug: "dystopia" },
      { name: "ماجراجویی", slug: "adventure" },
      { name: "روانشناسی", slug: "psychology" },
      { name: "کلاسیک", slug: "classic" },
      { name: "فانتزی", slug: "fantasy" },
    ])
    .onConflictDoNothing();

  const allGenres = await db.query.genres.findMany();
  const g = {
    romance:    allGenres.find(g => g.slug === "romance")!,
    thriller:   allGenres.find(g => g.slug === "thriller")!,
    biography:  allGenres.find(g => g.slug === "biography")!,
    history:    allGenres.find(g => g.slug === "history-genre")!,
    space:      allGenres.find(g => g.slug === "space")!,
    dystopia:   allGenres.find(g => g.slug === "dystopia")!,
    adventure:  allGenres.find(g => g.slug === "adventure")!,
    psychology: allGenres.find(g => g.slug === "psychology")!,
    classic:    allGenres.find(g => g.slug === "classic")!,
    fantasy:    allGenres.find(g => g.slug === "fantasy")!,
  };

  // ── Users — always upsert admin with required credentials ──────────────────
  console.log("  👤 Upserting users...");

  // Hash the required admin password
  const requiredAdminPassword = await hashPassword("Amir09016828270");
  const fallbackAdminPassword = await hashPassword("Admin123!");
  const userPassword = await hashPassword("User1234!");

  // Primary admin — upsert by email (update password + role even if exists)
  await db
    .insert(schema.users)
    .values({
      name: "امیرحسین ورمانلی",
      email: "varmanliamirhosein@gmail.com",
      password: requiredAdminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        password: requiredAdminPassword,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

  // Fallback admin
  await db
    .insert(schema.users)
    .values({
      name: "مدیر سیستم",
      email: "admin@bookshop.com",
      password: fallbackAdminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { password: fallbackAdminPassword, role: "ADMIN" },
    });

  // Regular test users
  await db
    .insert(schema.users)
    .values([
      { name: "علی احمدی", email: "ali@example.com", password: userPassword, role: "USER", emailVerified: new Date() },
      { name: "مریم رضایی", email: "maryam@example.com", password: userPassword, role: "USER", emailVerified: new Date() },
    ])
    .onConflictDoNothing();

  // Fetch admin for foreign-key references
  const admin = await db.query.users.findFirst({
    where: eq(schema.users.email, "varmanliamirhosein@gmail.com"),
  });
  if (!admin) throw new Error("Admin user not found after upsert");
  console.log(`     ✓ Admin: ${admin.email} (role: ${admin.role})`);

  // ── Books — original 16 + 50 new ────────────────────────────────────────────
  console.log("  📖 Inserting books...");

  type BookInput = {
    title: string; slug: string; author: string; translator?: string;
    publisher: string; description: string; categoryId: string;
    qualityGrade: "Like New" | "Very Good" | "Good" | "Acceptable";
    stock: number; price: number; images: string[]; publishedYear?: number;
    pageCount?: number; language: string; isFeatured: boolean; isbn?: string;
    genreIds: string[];
  };

  const publishers = [
    "نشر چشمه", "نیلوفر", "امیرکبیر", "فرهنگ معاصر", "ققنوس",
    "نشر نی", "هرمس", "افق", "روزگار", "خوارزمی",
  ];
  const qualities: ("Like New" | "Very Good" | "Good" | "Acceptable")[] =
    ["Like New", "Very Good", "Good", "Acceptable"];

  const booksData: BookInput[] = [
    /* ── Original 16 books ─────────────────────────────── */
    {
      title: "کلیدر", slug: "klidar", author: "محمود دولت‌آبادی",
      publisher: "فرهنگ معاصر",
      description: "کلیدر رمانی حماسی از محمود دولت‌آبادی است که به زندگی روستاییان خراسان می‌پردازد. این اثر ماندگار ادبیات فارسی معاصر از نظر وسعت و عمق بی‌نظیر است.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 5, price: 850000,
      images: ["https://picsum.photos/seed/klidar/300/450"], publishedYear: 1978, pageCount: 3000, language: "Persian", isFeatured: true, genreIds: [g.classic.id],
    },
    {
      title: "بوف کور", slug: "buf-kur", author: "صادق هدایت", publisher: "امیرکبیر",
      description: "بوف کور رمانی از صادق هدایت است که در سال ۱۳۱۵ نوشته شده و از برجسته‌ترین آثار ادبیات مدرن ایران به شمار می‌رود.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 3, price: 450000,
      images: ["https://picsum.photos/seed/bufkur/300/450"], publishedYear: 1936, pageCount: 120, language: "Persian", isFeatured: true, genreIds: [g.classic.id],
    },
    {
      title: "سمفونی مردگان", slug: "symphony-mardegan", author: "عباس معروفی", publisher: "ققنوس",
      description: "سمفونی مردگان یکی از برجسته‌ترین رمان‌های ادبیات معاصر ایران است که با زبانی شاعرانه روایت می‌شود.",
      categoryId: cat.fiction.id, qualityGrade: "Like New", stock: 7, price: 620000,
      images: ["https://picsum.photos/seed/symphony/300/450"], publishedYear: 1989, pageCount: 350, language: "Persian", isFeatured: false, genreIds: [],
    },
    {
      title: "شازده احتجاب", slug: "shazde-ehtejab", author: "هوشنگ گلشیری", publisher: "نیلوفر",
      description: "شازده احتجاب رمانی از هوشنگ گلشیری درباره آخرین بازمانده یک خانواده اشرافی ایرانی است.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 4, price: 380000,
      images: ["https://picsum.photos/seed/shazde/300/450"], publishedYear: 1968, pageCount: 180, language: "Persian", isFeatured: false, genreIds: [g.history.id],
    },
    {
      title: "نام من سرخ", slug: "name-man-sorkh", author: "اورهان پاموک", translator: "عرفان قانعی‌فرد",
      publisher: "نشر نی",
      description: "رمان برنده جایزه نوبل اثر اورهان پاموک که داستانی جنایی در قرن شانزدهم استانبول روایت می‌کند.",
      categoryId: cat.mystery.id, qualityGrade: "Very Good", stock: 6, price: 790000,
      images: ["https://picsum.photos/seed/namesorkh/300/450"], publishedYear: 1998, pageCount: 600, language: "Persian", isFeatured: true, genreIds: [g.thriller.id, g.history.id],
    },
    {
      title: "صد سال تنهایی", slug: "sad-sal-tanhayi", author: "گابریل گارسیا مارکز", translator: "بهمن فرزانه",
      publisher: "روزگار",
      description: "شاهکار ادبیات آمریکای لاتین اثر گارسیا مارکز که داستان خاندان بوئندیا را روایت می‌کند.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 8, price: 950000,
      images: ["https://picsum.photos/seed/hundredyears/300/450"], publishedYear: 1967, pageCount: 480, language: "Persian", isFeatured: true, genreIds: [g.classic.id],
    },
    {
      title: "تاریخ ایران باستان", slug: "tarikh-iran-bastan", author: "حسن پیرنیا", publisher: "دنیای کتاب",
      description: "پژوهشی جامع درباره تاریخ ایران از آغاز تا پایان دوره هخامنشیان.",
      categoryId: cat.nonFiction.id, qualityGrade: "Acceptable", stock: 2, price: 550000,
      images: ["https://picsum.photos/seed/iranhistory/300/450"], publishedYear: 1920, pageCount: 800, language: "Persian", isFeatured: false, genreIds: [g.history.id, g.biography.id],
    },
    {
      title: "ناتور دشت", slug: "nator-dasht", author: "جی دی سالینجر", translator: "احمد کریمی حکاک",
      publisher: "نشر علمی",
      description: "رمان کلاسیک ادبیات آمریکا که داستان نوجوانی سرکش در نیویورک را روایت می‌کند.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 5, price: 480000,
      images: ["https://picsum.photos/seed/catcher/300/450"], publishedYear: 1951, pageCount: 280, language: "Persian", isFeatured: false, genreIds: [g.classic.id],
    },
    {
      title: "1984", slug: "1984-orwell", author: "جورج اورول", translator: "صالح حسینی",
      publisher: "نشر چشمه",
      description: "دیستوپیای اورول که تصویری هشداردهنده از جامعه‌ای توتالیتر ارائه می‌دهد.",
      categoryId: cat.sciFi.id, qualityGrade: "Very Good", stock: 9, price: 560000,
      images: ["https://picsum.photos/seed/1984/300/450"], publishedYear: 1949, pageCount: 340, language: "Persian", isFeatured: true, genreIds: [g.dystopia.id],
    },
    {
      title: "خداحافظ گاری کوپر", slug: "khodahafez-gary-cooper", author: "رومن گاری", translator: "ابوالحسن نجفی",
      publisher: "نیلوفر",
      description: "رمانی درباره پایان دوران بزرگسالی و تنهایی انسان مدرن.",
      categoryId: cat.fiction.id, qualityGrade: "Like New", stock: 3, price: 420000,
      images: ["https://picsum.photos/seed/gary/300/450"], publishedYear: 1969, pageCount: 260, language: "Persian", isFeatured: false, genreIds: [g.romance.id],
    },
    {
      title: "پدر و پسر", slug: "pedar-va-pesar", author: "ایوان تورگنیف", translator: "مهدی افشار",
      publisher: "خوارزمی",
      description: "رمان کلاسیک روسی که تضاد نسل‌ها و ایده‌های مختلف را به تصویر می‌کشد.",
      categoryId: cat.fiction.id, qualityGrade: "Acceptable", stock: 2, price: 320000,
      images: ["https://picsum.photos/seed/fathersson/300/450"], publishedYear: 1862, pageCount: 300, language: "Persian", isFeatured: false, genreIds: [g.classic.id],
    },
    {
      title: "زندگی پیش رو", slug: "zendegi-pish-ro", author: "رومن گاری", translator: "لیلی گلستان",
      publisher: "نشر چشمه",
      description: "رمانی درباره دوستی پیرزنی یهودی و پسری عرب در پاریس.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 4, price: 490000,
      images: ["https://picsum.photos/seed/lifebefore/300/450"], publishedYear: 1975, pageCount: 280, language: "Persian", isFeatured: true, genreIds: [g.romance.id],
    },
    {
      title: "بینوایان", slug: "miserables", author: "ویکتور هوگو", translator: "حسین رضازاده",
      publisher: "افق",
      description: "شاهکار ادبیات فرانسه درباره عدالت، رحمت و بازخرید انسانی.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 4, price: 1200000,
      images: ["https://picsum.photos/seed/miserables/300/450"], publishedYear: 1862, pageCount: 1200, language: "Persian", isFeatured: true, genreIds: [g.thriller.id, g.classic.id],
    },
    {
      title: "دن آرام", slug: "don-quiet", author: "میخائیل شولوخوف", translator: "محمد قاضی",
      publisher: "نیلوفر",
      description: "حماسه روسی برنده نوبل که زندگی قزاق‌های دون را روایت می‌کند.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 3, price: 980000,
      images: ["https://picsum.photos/seed/donquiet/300/450"], publishedYear: 1928, pageCount: 1600, language: "Persian", isFeatured: false, genreIds: [g.history.id],
    },
    {
      title: "درخشش ابدی یک ذهن پاک", slug: "eternal-sunshine", author: "چارلی کوفمن", translator: "نیلوفر علیزاده",
      publisher: "نشر ثالث",
      description: "اقتباس ادبی از فیلمنامه نمادین چارلی کوفمن.",
      categoryId: cat.sciFi.id, qualityGrade: "Like New", stock: 6, price: 390000,
      images: ["https://picsum.photos/seed/sunshine/300/450"], publishedYear: 2004, pageCount: 190, language: "Persian", isFeatured: false, genreIds: [g.romance.id, g.space.id],
    },
    {
      title: "قصه‌های هزار و یک شب", slug: "thousand-nights", author: "ناشناس", translator: "عبداللطیف طسوجی",
      publisher: "هرمس",
      description: "مجموعه‌ای از افسانه‌های کهن شرقی که برای قرن‌ها مردم را مسحور کرده.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 5, price: 750000,
      images: ["https://picsum.photos/seed/arabiannights/300/450"], publishedYear: 800, pageCount: 900, language: "Persian", isFeatured: false, genreIds: [g.fantasy.id, g.adventure.id],
    },

    /* ── 50 New books ────────────────────────────────────── */
    {
      title: "بریده‌های باد", slug: "boreide-bad", author: "خالد حسینی", translator: "زیبا گنجی",
      publisher: "نشر چشمه", isbn: fakeIsbn(101),
      description: "رمانی تأثیرگذار از خالد حسینی درباره دوستی، خیانت و رستگاری در افغانستان.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 12, price: 720000,
      images: ["https://picsum.photos/seed/book-101/300/450"], publishedYear: 2003, pageCount: 371, language: "Persian", isFeatured: true, genreIds: [g.romance.id, g.thriller.id],
    },
    {
      title: "هزار خورشید تابان", slug: "hezar-khorshid", author: "خالد حسینی", translator: "مریم رضایی",
      publisher: "نشر چشمه", isbn: fakeIsbn(102),
      description: "داستان دو زن افغان در دوران جنگ که پیوند عمیقی با یکدیگر می‌یابند.",
      categoryId: cat.fiction.id, qualityGrade: "Like New", stock: 8, price: 680000,
      images: ["https://picsum.photos/seed/book-102/300/450"], publishedYear: 2007, pageCount: 372, language: "Persian", isFeatured: false, genreIds: [g.romance.id],
    },
    {
      title: "جنایت و مکافات", slug: "jenayat-va-mekafat", author: "فئودور داستایوفسکی", translator: "مهری آهی",
      publisher: "خوارزمی", isbn: fakeIsbn(103),
      description: "شاهکار داستایوفسکی درباره دانشجوی فقیری که مرتکب قتل می‌شود و با وجدانش دست و پنجه نرم می‌کند.",
      categoryId: cat.mystery.id, qualityGrade: "Good", stock: 7, price: 840000,
      images: ["https://picsum.photos/seed/book-103/300/450"], publishedYear: 1866, pageCount: 550, language: "Persian", isFeatured: true, genreIds: [g.thriller.id, g.psychology.id],
    },
    {
      title: "برادران کارامازوف", slug: "baradaran-karamazov", author: "فئودور داستایوفسکی", translator: "صالح حسینی",
      publisher: "نیلوفر", isbn: fakeIsbn(104),
      description: "آخرین و بزرگ‌ترین رمان داستایوفسکی که به مسائل فلسفی، اخلاقی و دینی می‌پردازد.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 4, price: 1100000,
      images: ["https://picsum.photos/seed/book-104/300/450"], publishedYear: 1880, pageCount: 824, language: "Persian", isFeatured: false, genreIds: [g.psychology.id, g.classic.id],
    },
    {
      title: "سرزمین آفتاب", slug: "sarzamin-aftab", author: "ناصر مکارم شیرازی",
      publisher: "هرمس", isbn: fakeIsbn(105),
      description: "روایتی از تاریخ اسلام و تمدن ایرانی در قرون اولیه.",
      categoryId: cat.history.id, qualityGrade: "Acceptable", stock: 3, price: 340000,
      images: ["https://picsum.photos/seed/book-105/300/450"], publishedYear: 1990, pageCount: 400, language: "Persian", isFeatured: false, genreIds: [g.history.id],
    },
    {
      title: "شیطان در بهشت", slug: "sheitan-dar-behesht", author: "محمدرضا بایرامی",
      publisher: "افق", isbn: fakeIsbn(106),
      description: "رمانی درباره دوران جنگ ایران و عراق و انسان‌هایی که در آتش آزموده می‌شوند.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 6, price: 580000,
      images: ["https://picsum.photos/seed/book-106/300/450"], publishedYear: 2005, pageCount: 320, language: "Persian", isFeatured: false, genreIds: [g.thriller.id, g.history.id],
    },
    {
      title: "ارباب حلقه‌ها", slug: "arbab-halqeha", author: "جی آر آر تالکین", translator: "رضا علیزاده",
      publisher: "روزگار", isbn: fakeIsbn(107),
      description: "حماسه فانتزی کلاسیک تالکین؛ نبرد خیر و شر در سرزمین میانه.",
      categoryId: cat.fiction.id, qualityGrade: "Like New", stock: 10, price: 1500000,
      images: ["https://picsum.photos/seed/book-107/300/450"], publishedYear: 1954, pageCount: 1216, language: "Persian", isFeatured: true, genreIds: [g.fantasy.id, g.adventure.id],
    },
    {
      title: "هری پاتر و سنگ جادو", slug: "harry-potter-1", author: "جی کی رولینگ", translator: "ویدا اسلامیه",
      publisher: "فرهنگ معاصر", isbn: fakeIsbn(108),
      description: "اولین کتاب از سری هری پاتر — داستان پسری که کشف می‌کند جادوگر است.",
      categoryId: cat.children.id, qualityGrade: "Very Good", stock: 15, price: 650000,
      images: ["https://picsum.photos/seed/book-108/300/450"], publishedYear: 1997, pageCount: 332, language: "Persian", isFeatured: true, genreIds: [g.fantasy.id, g.adventure.id],
    },
    {
      title: "هری پاتر و تالار اسرار", slug: "harry-potter-2", author: "جی کی رولینگ", translator: "ویدا اسلامیه",
      publisher: "فرهنگ معاصر", isbn: fakeIsbn(109),
      description: "دومین کتاب هری پاتر؛ رازی خطرناک در هاگوارتز.",
      categoryId: cat.children.id, qualityGrade: "Good", stock: 12, price: 630000,
      images: ["https://picsum.photos/seed/book-109/300/450"], publishedYear: 1998, pageCount: 364, language: "Persian", isFeatured: false, genreIds: [g.fantasy.id],
    },
    {
      title: "ستایش فلسفه", slug: "setayesh-falsafe", author: "آلن دو باتن", translator: "گلی امامی",
      publisher: "نشر نی", isbn: fakeIsbn(110),
      description: "نگاهی تازه به فلسفه کلاسیک و ربط آن با زندگی روزمره.",
      categoryId: cat.philosophy.id, qualityGrade: "Very Good", stock: 5, price: 480000,
      images: ["https://picsum.photos/seed/book-110/300/450"], publishedYear: 2000, pageCount: 310, language: "Persian", isFeatured: false, genreIds: [g.psychology.id],
    },
    {
      title: "دنیای سوفی", slug: "donyaye-sofi", author: "یوستاین گاردر", translator: "حسن افشار",
      publisher: "نشر مرکز", isbn: fakeIsbn(111),
      description: "رمانی فلسفی برای همه سنین که تاریخ فلسفه را به شکلی داستانی روایت می‌کند.",
      categoryId: cat.philosophy.id, qualityGrade: "Like New", stock: 8, price: 720000,
      images: ["https://picsum.photos/seed/book-111/300/450"], publishedYear: 1991, pageCount: 512, language: "Persian", isFeatured: true, genreIds: [g.classic.id],
    },
    {
      title: "تفسیر رویا", slug: "tafsir-roya", author: "زیگموند فروید", translator: "ایرج پورباقر",
      publisher: "نشر پیک", isbn: fakeIsbn(112),
      description: "کتاب انقلابی فروید که پایه‌های روانکاوی را بنا نهاد.",
      categoryId: cat.nonFiction.id, qualityGrade: "Acceptable", stock: 3, price: 290000,
      images: ["https://picsum.photos/seed/book-112/300/450"], publishedYear: 1899, pageCount: 630, language: "Persian", isFeatured: false, genreIds: [g.psychology.id],
    },
    {
      title: "انسان خردمند", slug: "ensan-kherdmand", author: "یووال نوح هراری", translator: "نیک گرگین",
      publisher: "فرهنگ معاصر", isbn: fakeIsbn(113),
      description: "تاریخ مختصر نژاد بشر از آغاز تا پیدایش امپراتوری‌ها.",
      categoryId: cat.nonFiction.id, qualityGrade: "Very Good", stock: 14, price: 890000,
      images: ["https://picsum.photos/seed/book-113/300/450"], publishedYear: 2011, pageCount: 443, language: "Persian", isFeatured: true, genreIds: [g.history.id, g.biography.id],
    },
    {
      title: "انسان در جستجوی معنا", slug: "ensan-dar-jostojoy-mana", author: "ویکتور فرانکل", translator: "نهضت صالحیان",
      publisher: "دارین", isbn: fakeIsbn(114),
      description: "خاطرات یک روانپزشک از اردوگاه‌های نازی و یافتن معنا در رنج.",
      categoryId: cat.nonFiction.id, qualityGrade: "Good", stock: 11, price: 380000,
      images: ["https://picsum.photos/seed/book-114/300/450"], publishedYear: 1946, pageCount: 198, language: "Persian", isFeatured: true, genreIds: [g.psychology.id, g.biography.id],
    },
    {
      title: "ثروتمندترین مرد بابل", slug: "sarvatmandtarin-mard-babil", author: "جورج کلاسون", translator: "علی دادبان",
      publisher: "نشر آذرخش", isbn: fakeIsbn(115),
      description: "رازهای موفقیت مالی به شکل داستان‌های کهن بابلی.",
      categoryId: cat.nonFiction.id, qualityGrade: "Like New", stock: 20, price: 320000,
      images: ["https://picsum.photos/seed/book-115/300/450"], publishedYear: 1926, pageCount: 192, language: "Persian", isFeatured: false, genreIds: [],
    },
    {
      title: "قدرت حال", slug: "qodrat-hal", author: "اکهارت تله", translator: "محمد گذرآبادی",
      publisher: "نشر پیک", isbn: fakeIsbn(116),
      description: "راهنمای بیداری معنوی — کتابی که میلیون‌ها نفر را تغییر داد.",
      categoryId: cat.nonFiction.id, qualityGrade: "Very Good", stock: 9, price: 420000,
      images: ["https://picsum.photos/seed/book-116/300/450"], publishedYear: 1997, pageCount: 236, language: "Persian", isFeatured: false, genreIds: [g.psychology.id],
    },
    {
      title: "شاهزاده کوچولو", slug: "shahzade-koochooloo", author: "آنتوان دو سنت اگزوپری", translator: "احمد شاملو",
      publisher: "امیرکبیر", isbn: fakeIsbn(117),
      description: "کلاسیک جاودانه‌ای که برای هر سنی پیامی دارد.",
      categoryId: cat.children.id, qualityGrade: "Like New", stock: 18, price: 290000,
      images: ["https://picsum.photos/seed/book-117/300/450"], publishedYear: 1943, pageCount: 96, language: "Persian", isFeatured: true, genreIds: [g.classic.id, g.fantasy.id],
    },
    {
      title: "گودو را منتظر می‌مانیم", slug: "godot-ra-montazer", author: "ساموئل بکت", translator: "بهمن فرزانه",
      publisher: "نیلوفر", isbn: fakeIsbn(118),
      description: "نمایشنامه پوچ‌گرای شاخص بکت — دو نفر برای شخصی که نمی‌آید انتظار می‌کشند.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 4, price: 250000,
      images: ["https://picsum.photos/seed/book-118/300/450"], publishedYear: 1952, pageCount: 148, language: "Persian", isFeatured: false, genreIds: [g.classic.id],
    },
    {
      title: "آناکارنینا", slug: "anna-karenina", author: "لئو تولستوی", translator: "رضا رضایی",
      publisher: "نشر ثالث", isbn: fakeIsbn(119),
      description: "رمان عاشقانه تراژیک تولستوی که تابلویی از جامعه روسیه قرن نوزدهم است.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 6, price: 1050000,
      images: ["https://picsum.photos/seed/book-119/300/450"], publishedYear: 1878, pageCount: 864, language: "Persian", isFeatured: false, genreIds: [g.romance.id, g.classic.id],
    },
    {
      title: "جنگ و صلح", slug: "jang-va-solh", author: "لئو تولستوی", translator: "کریم کشاورز",
      publisher: "امیرکبیر", isbn: fakeIsbn(120),
      description: "حماسه بزرگ ادبیات روسیه — تصویر جامعه روسیه در دوران جنگ‌های ناپلئونی.",
      categoryId: cat.fiction.id, qualityGrade: "Acceptable", stock: 2, price: 1800000,
      images: ["https://picsum.photos/seed/book-120/300/450"], publishedYear: 1869, pageCount: 1440, language: "Persian", isFeatured: false, genreIds: [g.history.id, g.classic.id],
    },
    {
      title: "تبار شناسی اخلاق", slug: "tabar-shenasi-akhlaq", author: "فریدریش نیچه", translator: "داریوش آشوری",
      publisher: "آگه", isbn: fakeIsbn(121),
      description: "اثر مهم نیچه در نقد اخلاق مسیحی و اروپایی.",
      categoryId: cat.philosophy.id, qualityGrade: "Good", stock: 3, price: 380000,
      images: ["https://picsum.photos/seed/book-121/300/450"], publishedYear: 1887, pageCount: 235, language: "Persian", isFeatured: false, genreIds: [],
    },
    {
      title: "کتاب مقدس هوش مصنوعی", slug: "ketab-moqaddas-hush-mosanooi", author: "ماکس تگ مارک", translator: "امیر محمدی",
      publisher: "نشر گمان", isbn: fakeIsbn(122),
      description: "آینده هوش مصنوعی و پیامدهای آن برای بشریت از دیدگاه فیزیکدانی برجسته.",
      categoryId: cat.nonFiction.id, qualityGrade: "Like New", stock: 10, price: 620000,
      images: ["https://picsum.photos/seed/book-122/300/450"], publishedYear: 2017, pageCount: 364, language: "Persian", isFeatured: false, genreIds: [],
    },
    {
      title: "فارنهایت ۴۵۱", slug: "fahrenheit-451", author: "ری برادبری", translator: "پریسا سلیمانی",
      publisher: "نشر بازتاب نگار", isbn: fakeIsbn(123),
      description: "دیستوپیایی که در آن کتاب‌ها ممنوع و سوزانده می‌شوند.",
      categoryId: cat.sciFi.id, qualityGrade: "Very Good", stock: 8, price: 430000,
      images: ["https://picsum.photos/seed/book-123/300/450"], publishedYear: 1953, pageCount: 241, language: "Persian", isFeatured: true, genreIds: [g.dystopia.id],
    },
    {
      title: "دنیای قشنگ نو", slug: "donyaye-qashnag-no", author: "آلدوس هاکسلی", translator: "سعید حمیدیان",
      publisher: "ققنوس", isbn: fakeIsbn(124),
      description: "آرمانشهر وارونه‌ای که علم را بر انسانیت ترجیح می‌دهد.",
      categoryId: cat.sciFi.id, qualityGrade: "Good", stock: 5, price: 460000,
      images: ["https://picsum.photos/seed/book-124/300/450"], publishedYear: 1932, pageCount: 311, language: "Persian", isFeatured: false, genreIds: [g.dystopia.id, g.classic.id],
    },
    {
      title: "اتاق", slug: "otaq", author: "امّا دونوهیو", translator: "لیلا خوئینی",
      publisher: "نشر نی", isbn: fakeIsbn(125),
      description: "روایتی تکان‌دهنده از مادر و پسری که سال‌ها در اتاقی کوچک زندانی بوده‌اند.",
      categoryId: cat.mystery.id, qualityGrade: "Like New", stock: 7, price: 550000,
      images: ["https://picsum.photos/seed/book-125/300/450"], publishedYear: 2010, pageCount: 401, language: "Persian", isFeatured: false, genreIds: [g.thriller.id, g.psychology.id],
    },
    {
      title: "مردی به نام اووه", slug: "mard-ove", author: "فردریک باکمن", translator: "سارا سعادتی",
      publisher: "روزگار", isbn: fakeIsbn(126),
      description: "داستان پیرمرد بدخلقی که بر اثر همسایگان جدید تغییر می‌کند.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 9, price: 520000,
      images: ["https://picsum.photos/seed/book-126/300/450"], publishedYear: 2012, pageCount: 337, language: "Persian", isFeatured: false, genreIds: [g.romance.id],
    },
    {
      title: "کشتن مرغ مقلد", slug: "koshtan-morgh-moqallad", author: "هارپر لی", translator: "شهرزاد رضایی",
      publisher: "نشر چشمه", isbn: fakeIsbn(127),
      description: "داستانی درباره نژادپرستی در آمریکای جنوبی از دیدگاه کودکی معصوم.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 6, price: 580000,
      images: ["https://picsum.photos/seed/book-127/300/450"], publishedYear: 1960, pageCount: 336, language: "Persian", isFeatured: true, genreIds: [g.classic.id, g.thriller.id],
    },
    {
      title: "ابله", slug: "ablah", author: "فئودور داستایوفسکی", translator: "سروش حبیبی",
      publisher: "نیلوفر", isbn: fakeIsbn(128),
      description: "رمانی درباره انسانی پاک‌نهاد که به دنبال خیر است اما در جهانی شرور زندگی می‌کند.",
      categoryId: cat.fiction.id, qualityGrade: "Acceptable", stock: 4, price: 890000,
      images: ["https://picsum.photos/seed/book-128/300/450"], publishedYear: 1869, pageCount: 656, language: "Persian", isFeatured: false, genreIds: [g.classic.id, g.psychology.id],
    },
    {
      title: "نوروز سرخ", slug: "noruz-sorkh", author: "احمد محمود",
      publisher: "معین", isbn: fakeIsbn(129),
      description: "رمان واقع‌گرایانه احمد محمود درباره زندگی مردم جنوب ایران.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 3, price: 440000,
      images: ["https://picsum.photos/seed/book-129/300/450"], publishedYear: 1975, pageCount: 270, language: "Persian", isFeatured: false, genreIds: [g.history.id],
    },
    {
      title: "سووشون", slug: "suvashun", author: "سیمین دانشور",
      publisher: "خوارزمی", isbn: fakeIsbn(130),
      description: "اولین رمان موفق یک زن ایرانی؛ داستانی از دوران اشغال ایران در جنگ جهانی دوم.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 5, price: 510000,
      images: ["https://picsum.photos/seed/book-130/300/450"], publishedYear: 1969, pageCount: 296, language: "Persian", isFeatured: true, genreIds: [g.romance.id, g.history.id],
    },
    {
      title: "تاریخ مختصر زمان", slug: "tarikh-mokhtasar-zaman", author: "استیون هاوکینگ", translator: "محمد تقدیسی",
      publisher: "فرهنگ معاصر", isbn: fakeIsbn(131),
      description: "توضیح اسرار کیهان از بیگ بنگ تا سیاهچاله‌ها به زبانی ساده.",
      categoryId: cat.nonFiction.id, qualityGrade: "Good", stock: 7, price: 490000,
      images: ["https://picsum.photos/seed/book-131/300/450"], publishedYear: 1988, pageCount: 278, language: "Persian", isFeatured: false, genreIds: [g.space.id],
    },
    {
      title: "یک عمر جوان بودن", slug: "yek-omr-javan", author: "برنار وربر", translator: "عطیه سجادی",
      publisher: "نشر ثالث", isbn: fakeIsbn(132),
      description: "رمان علمی‌تخیلی درباره مردی که راه زندگی جاودانه را می‌یابد.",
      categoryId: cat.sciFi.id, qualityGrade: "Like New", stock: 6, price: 560000,
      images: ["https://picsum.photos/seed/book-132/300/450"], publishedYear: 2019, pageCount: 315, language: "Persian", isFeatured: false, genreIds: [g.adventure.id, g.space.id],
    },
    {
      title: "موریانه‌ها", slug: "morianeha", author: "عباس معروفی",
      publisher: "ققنوس", isbn: fakeIsbn(133),
      description: "داستانی درباره یک خانواده که در بحران هویت دست و پا می‌زند.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 4, price: 470000,
      images: ["https://picsum.photos/seed/book-133/300/450"], publishedYear: 1995, pageCount: 210, language: "Persian", isFeatured: false, genreIds: [g.psychology.id],
    },
    {
      title: "کیمیاگر", slug: "kimiyagar", author: "پائولو کوئیلو", translator: "آرش حجازی",
      publisher: "نشر کاروان", isbn: fakeIsbn(134),
      description: "داستان جوانی که در پی سرنوشتش به مصر می‌رود — کتابی که زندگی را تغییر می‌دهد.",
      categoryId: cat.fiction.id, qualityGrade: "Very Good", stock: 16, price: 390000,
      images: ["https://picsum.photos/seed/book-134/300/450"], publishedYear: 1988, pageCount: 208, language: "Persian", isFeatured: true, genreIds: [g.fantasy.id, g.adventure.id],
    },
    {
      title: "یازده دقیقه", slug: "yazdah-daqiqe", author: "پائولو کوئیلو", translator: "آرش حجازی",
      publisher: "نشر کاروان", isbn: fakeIsbn(135),
      description: "رمانی جسورانه درباره زنی برزیلی که دنبال معنای عشق می‌گردد.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 9, price: 360000,
      images: ["https://picsum.photos/seed/book-135/300/450"], publishedYear: 2003, pageCount: 290, language: "Persian", isFeatured: false, genreIds: [g.romance.id],
    },
    {
      title: "نرگس و پژمان", slug: "narges-va-pejman", author: "حمیدرضا شاه‌آبادی",
      publisher: "افق", isbn: fakeIsbn(136),
      description: "رمان نوجوان درباره دوستی، رویا و آینده.",
      categoryId: cat.children.id, qualityGrade: "Like New", stock: 11, price: 280000,
      images: ["https://picsum.photos/seed/book-136/300/450"], publishedYear: 2018, pageCount: 196, language: "Persian", isFeatured: false, genreIds: [g.romance.id],
    },
    {
      title: "گودال", slug: "godal", author: "احمد محمود",
      publisher: "معین", isbn: fakeIsbn(137),
      description: "رمانی درباره زندگی کارگران حاشیه‌نشین یک شهر بزرگ.",
      categoryId: cat.fiction.id, qualityGrade: "Acceptable", stock: 2, price: 390000,
      images: ["https://picsum.photos/seed/book-137/300/450"], publishedYear: 1970, pageCount: 340, language: "Persian", isFeatured: false, genreIds: [],
    },
    {
      title: "مارتین ایدن", slug: "martin-iden", author: "جک لندن", translator: "آرمان اکبری",
      publisher: "نشر مرکز", isbn: fakeIsbn(138),
      description: "داستان خودساخته‌ای که با قدرت اراده به قله موفقیت می‌رسد.",
      categoryId: cat.fiction.id, qualityGrade: "Good", stock: 5, price: 540000,
      images: ["https://picsum.photos/seed/book-138/300/450"], publishedYear: 1909, pageCount: 432, language: "Persian", isFeatured: false, genreIds: [g.biography.id, g.classic.id],
    },
    {
      title: "دیوان حافظ", slug: "divan-hafez", author: "خواجه شمس‌الدین حافظ",
      publisher: "خوارزمی", isbn: fakeIsbn(139),
      description: "دیوان کامل اشعار لسان‌الغیب حافظ شیرازی.",
      categoryId: cat.poetry.id, qualityGrade: "Like New", stock: 20, price: 640000,
      images: ["https://picsum.photos/seed/book-139/300/450"], publishedYear: 1390, pageCount: 510, language: "Persian", isFeatured: true, genreIds: [g.classic.id],
    },
    {
      title: "گلستان سعدی", slug: "golestan-saadi", author: "شیخ مصلح‌الدین سعدی شیرازی",
      publisher: "امیرکبیر", isbn: fakeIsbn(140),
      description: "مجموعه حکایات و اندرزهای گوهرین سعدی در نثر مسجع.",
      categoryId: cat.poetry.id, qualityGrade: "Very Good", stock: 14, price: 560000,
      images: ["https://picsum.photos/seed/book-140/300/450"], publishedYear: 1258, pageCount: 320, language: "Persian", isFeatured: false, genreIds: [g.classic.id],
    },
    {
      title: "مثنوی معنوی", slug: "masnavi-manavi", author: "جلال‌الدین محمد مولوی",
      publisher: "هرمس", isbn: fakeIsbn(141),
      description: "دریایی از معنا و عرفان در قالب نظم — شش دفتر از مولانا.",
      categoryId: cat.poetry.id, qualityGrade: "Good", stock: 8, price: 1200000,
      images: ["https://picsum.photos/seed/book-141/300/450"], publishedYear: 1258, pageCount: 1000, language: "Persian", isFeatured: true, genreIds: [g.classic.id],
    },
    {
      title: "شاهنامه فردوسی", slug: "shahname-ferdosi", author: "ابوالقاسم فردوسی",
      publisher: "فرهنگ معاصر", isbn: fakeIsbn(142),
      description: "حماسه ملی ایران — شاهنامه در یک جلد مصور.",
      categoryId: cat.poetry.id, qualityGrade: "Like New", stock: 10, price: 980000,
      images: ["https://picsum.photos/seed/book-142/300/450"], publishedYear: 977, pageCount: 1200, language: "Persian", isFeatured: true, genreIds: [g.classic.id, g.adventure.id],
    },
    {
      title: "روباه کوچک", slug: "rubah-koochak", author: "آنتوان دو سنت اگزوپری", translator: "شهلا حائری",
      publisher: "روزگار", isbn: fakeIsbn(143),
      description: "داستان کوتاه کلاسیک فرانسوی با تصاویر اصلی نویسنده.",
      categoryId: cat.children.id, qualityGrade: "Very Good", stock: 17, price: 210000,
      images: ["https://picsum.photos/seed/book-143/300/450"], publishedYear: 1943, pageCount: 92, language: "Persian", isFeatured: false, genreIds: [g.fantasy.id],
    },
    {
      title: "صخره سفید", slug: "sakhre-sefid", author: "میچل اسنو",
      publisher: "نشر ثالث", isbn: fakeIsbn(144),
      description: "رمان معمایی هیجان‌انگیز در کوهستان‌های سوئیس.",
      categoryId: cat.mystery.id, qualityGrade: "Good", stock: 6, price: 490000,
      images: ["https://picsum.photos/seed/book-144/300/450"], publishedYear: 2015, pageCount: 356, language: "Persian", isFeatured: false, genreIds: [g.thriller.id, g.adventure.id],
    },
    {
      title: "اتاق عقب", slug: "otaq-aqab", author: "آگاتا کریستی", translator: "بیژن اشتری",
      publisher: "افق", isbn: fakeIsbn(145),
      description: "یکی از بهترین داستان‌های جنایی آگاتا کریستی — رازی در میان گل‌های باغ.",
      categoryId: cat.mystery.id, qualityGrade: "Very Good", stock: 7, price: 440000,
      images: ["https://picsum.photos/seed/book-145/300/450"], publishedYear: 1950, pageCount: 311, language: "Persian", isFeatured: false, genreIds: [g.thriller.id],
    },
    {
      title: "رویای آمریکایی", slug: "royaye-amrikayee", author: "جیمز آدامز",
      publisher: "نشر پیک", isbn: fakeIsbn(146),
      description: "تاریخ ایده‌ای که آمریکا را ساخت.",
      categoryId: cat.history.id, qualityGrade: "Acceptable", stock: 3, price: 310000,
      images: ["https://picsum.photos/seed/book-146/300/450"], publishedYear: 1931, pageCount: 474, language: "Persian", isFeatured: false, genreIds: [g.history.id],
    },
    {
      title: "ایران زمین", slug: "iran-zamin", author: "مهرداد بهار",
      publisher: "آگه", isbn: fakeIsbn(147),
      description: "پژوهشی درباره اسطوره‌ها و باورهای ایران باستان.",
      categoryId: cat.history.id, qualityGrade: "Good", stock: 4, price: 560000,
      images: ["https://picsum.photos/seed/book-147/300/450"], publishedYear: 1977, pageCount: 410, language: "Persian", isFeatured: false, genreIds: [g.history.id],
    },
    {
      title: "تاریخ تمدن", slug: "tarikh-tamaddon", author: "ویل دورانت", translator: "احمد آرام",
      publisher: "علمی و فرهنگی", isbn: fakeIsbn(148),
      description: "سفری عظیم در تاریخ تمدن بشر از مشرق تا مغرب.",
      categoryId: cat.history.id, qualityGrade: "Good", stock: 2, price: 2200000,
      images: ["https://picsum.photos/seed/book-148/300/450"], publishedYear: 1935, pageCount: 4500, language: "Persian", isFeatured: false, genreIds: [g.history.id, g.biography.id],
    },
    {
      title: "انتقام دریا", slug: "entegham-darya", author: "احمدرضا احمدی",
      publisher: "ققنوس", isbn: fakeIsbn(149),
      description: "مجموعه شعر مدرن فارسی از یکی از پیشگامان شعر نو ایران.",
      categoryId: cat.poetry.id, qualityGrade: "Like New", stock: 5, price: 180000,
      images: ["https://picsum.photos/seed/book-149/300/450"], publishedYear: 2018, pageCount: 128, language: "Persian", isFeatured: false, genreIds: [],
    },
    {
      title: "ذهن آگاهی", slug: "zehn-agahi", author: "مارک ویلیامز", translator: "فاطمه امینی",
      publisher: "نشر آذرخش", isbn: fakeIsbn(150),
      description: "هشت هفته برای رهایی از افسردگی، اضطراب و فشار روانی.",
      categoryId: cat.nonFiction.id, qualityGrade: "Very Good", stock: 13, price: 490000,
      images: ["https://picsum.photos/seed/book-150/300/450"], publishedYear: 2011, pageCount: 284, language: "Persian", isFeatured: false, genreIds: [g.psychology.id],
    },
  ];

  let insertedCount = 0;
  let featuredCount = 0;
  for (const bookData of booksData) {
    const { genreIds, ...bookFields } = bookData;
    const [book] = await db
      .insert(schema.books)
      .values(bookFields)
      .onConflictDoNothing()
      .returning();

    if (book) {
      insertedCount++;
      if (book.isFeatured) featuredCount++;
      if (genreIds.length > 0) {
        await db
          .insert(schema.bookGenres)
          .values(genreIds.map(genreId => ({ bookId: book.id, genreId })))
          .onConflictDoNothing();
      }
    }
  }
  console.log(`     ✓ ${insertedCount} books inserted (${featuredCount} featured)`);

  // ── Blog Posts ───────────────────────────────────────────────────────────────
  console.log("  📝 Inserting blog posts...");
  await db
    .insert(schema.posts)
    .values([
      {
        title: "راهنمای خرید کتاب دست دوم",
        slug: "guide-buy-second-hand-books",
        excerpt: "خرید کتاب دست دوم می‌تواند گزینه‌ای اقتصادی و هوشمندانه باشد. در این مقاله نکاتی کلیدی برای خرید بهتر ارائه می‌دهیم.",
        content: `# راهنمای خرید کتاب دست دوم\n\nخرید کتاب دست دوم نه تنها به صرفه‌جویی در هزینه کمک می‌کند، بلکه اقدامی مسئولانه در قبال محیط زیست است.\n\n## نکات مهم\n\n### ۱. بررسی وضعیت کتاب\nقبل از خرید، وضعیت کتاب را با دقت بررسی کنید.\n\n### ۲. بررسی صفحات\nمطمئن شوید که تمام صفحات کتاب موجود و خوانا هستند.\n\n### ۳. قیمت‌گذاری منصفانه\nکتاب‌های دست دوم باید با قیمتی مناسب‌تر از نسخه نو ارائه شوند.`,
        coverImage: "https://picsum.photos/seed/guide-books/800/450",
        authorId: admin.id, category: "راهنما", status: "PUBLISHED" as const, publishedAt: new Date(),
      },
      {
        title: "۱۰ کتاب کلاسیک که باید بخوانید",
        slug: "10-classic-books-to-read",
        excerpt: "فهرستی از کتاب‌های کلاسیک جهان که هر کتابخوانی باید آن‌ها را بخواند.",
        content: `# ۱۰ کتاب کلاسیک که باید بخوانید\n\nادبیات کلاسیک گنجینه‌ای از خرد انسانی است. در این مقاله ۱۰ اثر برجسته را معرفی می‌کنیم.\n\n## ۱. جنایت و مکافات\nداستایوفسکی در این رمان به کالبدشکافی روح انسانی می‌پردازد.\n\n## ۲. صد سال تنهایی\nگارسیا مارکز با این رمان واقعیت جادویی را به ادبیات جهان معرفی کرد.\n\n## ۳. ۱۹۸۴\nاورول با این رمان هشداری جاودانه درباره توتالیتاریسم نوشت.`,
        coverImage: "https://picsum.photos/seed/classic-lit/800/450",
        authorId: admin.id, category: "معرفی کتاب", status: "PUBLISHED" as const,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: "اهمیت مطالعه در دنیای دیجیتال",
        slug: "importance-of-reading-digital-world",
        excerpt: "در عصر دیجیتال، مطالعه کتاب‌های فیزیکی اهمیت خود را حفظ کرده است.",
        content: `# اهمیت مطالعه در دنیای دیجیتال\n\nبا وجود همه تغییرات تکنولوژیک، مطالعه کتاب همچنان یکی از ارزشمندترین فعالیت‌های انسانی است.\n\n## مزایای مطالعه کتاب فیزیکی\n\n- تمرکز بیشتر\n- خستگی کمتر چشم\n- لذت لمس کاغذ و بوی کتاب`,
        coverImage: "https://picsum.photos/seed/digital-reading/800/450",
        authorId: admin.id, category: "عمومی", status: "PUBLISHED" as const,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: "بهترین رمان‌های ایرانی معاصر",
        slug: "best-contemporary-iranian-novels",
        excerpt: "نگاهی به برترین رمان‌های نویسندگان ایرانی در دهه‌های اخیر.",
        content: `# بهترین رمان‌های ایرانی معاصر\n\nادبیات داستانی ایران در دهه‌های اخیر شاهد رشد چشمگیری بوده است.\n\n## سووشون — سیمین دانشور\nاولین رمان موفق زنانه ایران.\n\n## بوف کور — صادق هدایت\nاثری سوررئالیستی با جایگاهی ویژه در ادبیات فارسی.`,
        coverImage: "https://picsum.photos/seed/iranian-lit/800/450",
        authorId: admin.id, category: "معرفی کتاب", status: "PUBLISHED" as const,
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      },
      {
        title: "مصاحبه با یک کتابفروش قدیمی",
        slug: "interview-old-bookshop-owner",
        excerpt: "گفتگویی با آقای رضایی، صاحب یکی از قدیمی‌ترین کتابفروشی‌های تهران.",
        content: `# مصاحبه با یک کتابفروش قدیمی\n\nآقای رضایی بیش از چهل سال است که کتابفروشی می‌کند.\n\n## چه تغییراتی در بازار کتاب دیده‌اید؟\n\nروزگاری مردم ساعت‌ها در کتابفروشی می‌نشستند. امروز بیشتر دیجیتالی خرید می‌کنند.`,
        coverImage: "https://picsum.photos/seed/bookshop-interview/800/450",
        authorId: admin.id, category: "مصاحبه", status: "PUBLISHED" as const,
        publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      },
      {
        title: "نقد و بررسی: کتاب «ارباب حلقه‌ها»",
        slug: "review-lord-of-the-rings",
        excerpt: "مروری بر حماسه فانتزی تالکین و دلایل ماندگاری آن در ادبیات جهان.",
        content: `# نقد و بررسی: ارباب حلقه‌ها\n\nتالکین با خلق دنیای میانه یکی از بزرگ‌ترین حماسه‌های فانتزی تاریخ را نگاشت.\n\n## داستان\nفرودو باید حلقه قدرت را نابود کند.\n\n## نکات مثبت\n- ساخت دنیایی کامل\n- شخصیت‌پردازی عمیق`,
        coverImage: "https://picsum.photos/seed/lotr-review/800/450",
        authorId: admin.id, category: "نقد و بررسی", status: "PUBLISHED" as const,
        publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      },
      {
        title: "اخبار: نمایشگاه کتاب تهران ۱۴۰۴",
        slug: "tehran-book-fair-1404",
        excerpt: "گزارشی از سی و پنجمین نمایشگاه بین‌المللی کتاب تهران.",
        content: `# نمایشگاه کتاب تهران ۱۴۰۴\n\nسی و پنجمین نمایشگاه بین‌المللی کتاب تهران با حضور بیش از هزار ناشر برگزار شد.\n\n## آمار\n- تعداد ناشر: ۱۲۰۰\n- بازدیدکننده: ۴ میلیون\n- عناوین جدید: ۵۰۰۰`,
        coverImage: "https://picsum.photos/seed/book-fair/800/450",
        authorId: admin.id, category: "اخبار", status: "PUBLISHED" as const,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ])
    .onConflictDoNothing();

  // ── Team Members ─────────────────────────────────────────────────────────────
  console.log("  👥 Inserting team members...");
  await db
    .insert(schema.teamMembers)
    .values([
      { name: "سارا محمدی", role: "مدیر فروشگاه", bio: "سارا بیش از ۱۰ سال تجربه در حوزه کتاب و نشر دارد.", image: "https://picsum.photos/seed/sara/300/300", order: 1 },
      { name: "رضا کریمی", role: "کارشناس ادبیات", bio: "رضا فارغ‌التحصیل ادبیات فارسی از دانشگاه تهران است.", image: "https://picsum.photos/seed/reza/300/300", order: 2 },
      { name: "نیلوفر احمدی", role: "پشتیبانی مشتریان", bio: "نیلوفر با روحیه‌ای گرم و صبور تجربه خرید دلپذیری فراهم می‌کند.", image: "https://picsum.photos/seed/niloofar/300/300", order: 3 },
    ])
    .onConflictDoNothing();

  // ── Home Slides ───────────────────────────────────────────────────────────────
  console.log("  🖼️  Inserting home slides...");
  await db
    .insert(schema.homeSlides)
    .values([
      { title: "تخفیف ویژه کتاب‌های پرفروش", subtitle: "تا ۵۰٪ تخفیف برای اعضای جدید — همین حالا ثبت‌نام کنید", ctaText: "مشاهده تخفیف‌ها", ctaLink: "/books?featured=true", imageUrl: "https://picsum.photos/seed/bookshop-hero1/1200/620", order: 1, isActive: true },
      { title: "هزاران کتاب دست دوم با کیفیت", subtitle: "بزرگ‌ترین مجموعه کتاب‌های کلاسیک ایرانی و خارجی", ctaText: "جستجوی کتاب", ctaLink: "/books", imageUrl: "https://picsum.photos/seed/bookshop-hero2/1200/620", order: 2, isActive: true },
      { title: "ارسال رایگان به سراسر ایران", subtitle: "برای سفارش‌های بالای ۵۰۰ هزار تومان ارسال رایگان است", ctaText: "خرید کنید", ctaLink: "/books", imageUrl: "https://picsum.photos/seed/bookshop-hero3/1200/620", order: 3, isActive: true },
    ])
    .onConflictDoNothing();

  // ── Settings ─────────────────────────────────────────────────────────────────
  console.log("  ⚙️  Inserting settings...");
  await db
    .insert(schema.settings)
    .values([
      { key: "storeName", value: "کتابخانه" },
      { key: "contactEmail", value: "info@bookshop.com" },
      { key: "contactPhone", value: "021-12345678" },
      { key: "contactAddress", value: "تهران، خیابان انقلاب، پلاک ۱۲۳" },
      { key: "socialLinks", value: { instagram: "https://instagram.com/bookshop", telegram: "https://t.me/bookshop", twitter: "" } },
    ])
    .onConflictDoNothing();

  // ── Sample Reviews ───────────────────────────────────────────────────────────
  console.log("  ⭐ Inserting sample reviews...");

  // Fetch test users and first 15 books
  const [allUsers, allBooks] = await Promise.all([
    db.query.users.findMany({ where: (u, { inArray }) => inArray(u.email, ["ali@example.com", "maryam@example.com"]) }),
    db.query.books.findMany({ limit: 15, orderBy: (b, { asc }) => asc(b.createdAt) }),
  ]);

  const ali = allUsers.find(u => u.email === "ali@example.com");
  const maryam = allUsers.find(u => u.email === "maryam@example.com");

  if (ali && maryam && allBooks.length >= 10) {
    const sampleReviews = [
      { bookId: allBooks[0].id, userId: ali.id, rating: 5, title: "شاهکار ادبیات فارسی", content: "این کتاب یکی از بهترین آثاری بود که تاکنون خوانده‌ام. نوشتار روان و داستان جذاب نویسنده واقعاً تحت تأثیر قرار داد.", status: "APPROVED" as const },
      { bookId: allBooks[0].id, userId: maryam.id, rating: 4, title: "ارزش خواندن دارد", content: "کتاب بسیار خوبی است و داستانش انسان را به فکر وا می‌دارد. ترجمه هم روان بود.", status: "APPROVED" as const },
      { bookId: allBooks[1].id, userId: ali.id, rating: 5, title: "بی‌نظیر", content: "یکی از معدود کتاب‌هایی که نمی‌توانستم زمین بگذارمش. هر فصل از قبلی بهتر می‌شد.", status: "APPROVED" as const },
      { bookId: allBooks[1].id, userId: maryam.id, rating: 3, title: "متوسط", content: "انتظار بیشتری داشتم. شروع قوی داشت اما در میانه داستان کمی کند شد. در کل خواندنش ارزش دارد.", status: "APPROVED" as const },
      { bookId: allBooks[2].id, userId: maryam.id, rating: 5, title: "تجربه‌ای ماندگار", content: "این کتاب دیدگاه من نسبت به زندگی را عوض کرد. پیشنهاد می‌کنم همه آن را بخوانند.", status: "APPROVED" as const },
      { bookId: allBooks[3].id, userId: ali.id, rating: 4, title: "عالی برای مطالعه", content: "کتاب جامعی است که مطالب مفیدی دارد. اگرچه بعضی بخش‌ها کمی سنگین بود، کلاً ارزشمند است.", status: "APPROVED" as const },
      { bookId: allBooks[4].id, userId: maryam.id, rating: 5, title: "از دست ندهید", content: "واقعاً عالی! این کتاب سال‌هاست در کتابخانه‌ام جای خاصی دارد و بارها آن را خوانده‌ام.", status: "APPROVED" as const },
      { bookId: allBooks[5].id, userId: ali.id, rating: 2, title: "ناامیدکننده", content: "متأسفانه کتاب انتظارات مرا برآورده نکرد. محتوا سطحی بود و نویسنده عمق کافی نداشت.", status: "APPROVED" as const },
      { bookId: allBooks[6].id, userId: maryam.id, rating: 4, title: "خوب بود", content: "کتاب خوبی بود، روایت جذاب داشت و شخصیت‌پردازی قوی بود.", status: "APPROVED" as const },
      { bookId: allBooks[7].id, userId: ali.id, rating: 5, title: "مشتاقانه توصیه می‌کنم", content: "یکی از بهترین کتاب‌هایی که خوانده‌ام. داستان گیراست و نوشتار عالی.", status: "APPROVED" as const },
      { bookId: allBooks[8].id, userId: maryam.id, rating: 3, title: "نه بد نه خوب", content: "کتاب معمولی بود. نه خاطرات بدی از آن دارم نه لحظات فوق‌العاده‌ای.", status: "APPROVED" as const },
      { bookId: allBooks[9].id, userId: ali.id, rating: 4, title: "برای علاقه‌مندان این حوزه", content: "اگر در این حوزه علاقه‌مند هستید قطعاً این کتاب را بخوانید. اطلاعات مفید و ارائه خوب.", status: "APPROVED" as const },
      // Pending reviews for admin testing
      { bookId: allBooks[10].id, userId: ali.id, rating: 5, title: "بسیار عالی", content: "این کتاب فوق‌العاده بود. صبر کنید تا بعد از بررسی نظرم نمایش داده شود.", status: "PENDING" as const },
      { bookId: allBooks[11].id, userId: maryam.id, rating: 1, title: "اصلاً خوب نبود", content: "خیلی ناامید شدم. وقت و پولم را هدر دادم.", status: "PENDING" as const },
      { bookId: allBooks[12].id, userId: ali.id, rating: 4, title: "پیشنهاد می‌دهم", content: "در کل کتاب مفیدی بود، مطالعه آن توصیه می‌شود.", status: "PENDING" as const },
    ];

    for (const rv of sampleReviews) {
      await db.insert(schema.reviews).values(rv).onConflictDoNothing();
    }
    console.log(`     ✓ ${sampleReviews.length} sample reviews inserted`);
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Admin login: varmanliamirhosein@gmail.com / Amir09016828270`);
  console.log(`   Fallback admin: admin@bookshop.com / Admin123!`);
  console.log(`   Test user: ali@example.com / User1234!`);

  await client.end();
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
