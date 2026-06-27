export const CACHE_TAGS = {
  books: "books",
  booksList: "books-list",
  booksFeatured: "books-featured",
  booksNew: "books-new",
  book: (slug: string) => `book-${slug}`,
  bookById: (id: string) => `book-id-${id}`,

  categories: "categories",
  category: (slug: string) => `category-${slug}`,

  genres: "genres",
  genre: (id: string) => `genre-${id}`,

  posts: "posts",
  post: (slug: string) => `post-${slug}`,

  settings: "settings",
  settingKey: (key: string) => `setting-${key}`,

  orders: "orders",
  order: (id: string) => `order-${id}`,
  userOrders: (userId: string) => `user-orders-${userId}`,

  contactMessages: "contact-messages",
  contactMessage: (id: string) => `contact-message-${id}`,

  newsletterSubscribers: "newsletter-subscribers",

  teamMembers: "team-members",

  homeSlides: "home-slides",

  reviews: "reviews",
  reviewsAdmin: "reviews-admin",
  reviewsByBook: (bookId: string) => `reviews-book-${bookId}`,
} as const;
