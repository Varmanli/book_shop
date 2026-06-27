import { Suspense } from "react";
import type { Metadata } from "next";
import { findCategoriesWithCount } from "@/repositories/category.repository";
import { CategoriesClient } from "./categories-client";

export const metadata: Metadata = { title: "مدیریت دسته‌بندی‌ها" };

async function CategoriesContent() {
  const categories = await findCategoriesWithCount();
  return <CategoriesClient categories={categories} />;
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <CategoriesContent />
    </Suspense>
  );
}
