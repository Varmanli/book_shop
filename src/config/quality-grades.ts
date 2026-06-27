import type { QualityGrade } from "@/types/domain";

type GradeConfig = {
  label: string;
  labelFa: string;
  description: string;
  color: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
};

export const QUALITY_GRADES: Record<QualityGrade, GradeConfig> = {
  "Like New": {
    label: "Like New",
    labelFa: "مثل نو",
    description: "در حد نو، بدون هیچ نقصی",
    color: "text-green-600",
    badgeVariant: "default",
  },
  "Very Good": {
    label: "Very Good",
    labelFa: "خیلی خوب",
    description: "دارای نشانه‌های استفاده جزئی",
    color: "text-blue-600",
    badgeVariant: "secondary",
  },
  Good: {
    label: "Good",
    labelFa: "خوب",
    description: "دارای نشانه‌های استفاده واضح اما سالم",
    color: "text-yellow-600",
    badgeVariant: "outline",
  },
  Acceptable: {
    label: "Acceptable",
    labelFa: "قابل قبول",
    description: "دارای نشانه‌های استفاده قابل توجه",
    color: "text-orange-600",
    badgeVariant: "outline",
  },
};

export const QUALITY_GRADE_OPTIONS: { value: QualityGrade; label: string }[] =
  Object.entries(QUALITY_GRADES).map(([value, config]) => ({
    value: value as QualityGrade,
    label: config.labelFa,
  }));
