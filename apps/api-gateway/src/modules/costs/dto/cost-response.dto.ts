export interface CostSummaryDto {
  totalCosts: number;
  costsByCategory: Record<string, number>;
  costsByPayer: Record<string, number>;
  count: number;
}

import { CostEntry } from '@prisma/client';

export interface CostListResponseDto {
  data: CostEntry[];
  pagination: {
    total: number;
    limit: number;
    cursor: string | null;
    hasMore: boolean;
  };
  summary: CostSummaryDto;
}
