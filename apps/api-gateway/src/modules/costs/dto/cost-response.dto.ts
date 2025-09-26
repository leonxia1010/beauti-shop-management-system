export interface CostSummaryDto {
  totalCosts: number;
  costsByCategory: Record<string, number>;
  costsByPayer: Record<string, number>;
  count: number;
}

export interface CostListResponseDto {
  data: any[]; // CostEntry[] from Prisma
  pagination: {
    total: number;
    limit: number;
    cursor: string | null;
    hasMore: boolean;
  };
  summary: CostSummaryDto;
}
