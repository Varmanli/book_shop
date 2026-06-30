export type UserRole = "USER" | "ADMIN";

export type QualityGrade = "Like New" | "Very Good" | "Good" | "Acceptable";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PostStatus = "DRAFT" | "PUBLISHED";

export type SortOrder = "asc" | "desc";

export type BookSortField =
  | "createdAt"
  | "price"
  | "title"
  | "updatedAt";

export type BookFilters = {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  genreId?: string;
  genreSlug?: string;
  qualityGrade?: QualityGrade;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  /** true = only available (not sold) copies */
  available?: boolean;
};

export type OrderFilters = {
  status?: OrderStatus;
  userId?: string;
  search?: string;
};
