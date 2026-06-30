import * as txRepo from "@/repositories/transaction.repository";
import type { FinanceStats } from "@/repositories/transaction.repository";

export type { FinanceStats };

export async function getFinanceSummary(): Promise<FinanceStats> {
  return txRepo.getFinanceStats();
}

export async function getDailyRevenueTrend(
  days = 7
): Promise<{ date: string; revenue: number }[]> {
  return txRepo.getDailyRevenue(days);
}

export async function getMonthlyRevenueTrend(
  months = 6
): Promise<{ month: string; revenue: number }[]> {
  return txRepo.getMonthlyRevenue(months);
}
