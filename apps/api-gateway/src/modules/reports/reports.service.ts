/**
 * Reports Service
 *
 * Following SOLID principles:
 * - Single Responsibility: Handles only report generation logic
 * - Open/Closed: Extensible for new report types
 * - Interface Segregation: Focused on reporting operations
 * - Dependency Inversion: Depends on abstract data access
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DailyReportFilter {
  store_id: string;
  date_from: string;
  date_to: string;
}

export interface DailyReportData {
  date: string;
  revenue: {
    total_gross: number;
    total_net: number;
    total_beautician_share: number;
    session_count: number;
    average_per_session: number;
  };
  costs: {
    total_amount: number;
    cost_count: number;
    average_per_day: number;
    by_category: Record<string, number>;
  };
  profit: {
    gross_profit: number;
    net_profit: number;
    profit_margin: number;
  };
}

export interface BeauticianPerformance {
  beautician_id: string;
  beautician_name: string;
  total_revenue: number;
  session_count: number;
  average_per_session: number;
  total_share: number;
}

export interface DailyReport {
  period: {
    start_date: string;
    end_date: string;
    total_days: number;
  };
  summary: DailyReportData;
  daily_breakdown: DailyReportData[];
  beautician_performance: BeauticianPerformance[];
  top_revenue_days: Array<{
    date: string;
    total_revenue: number;
  }>;
  cost_trends: Array<{
    category: string;
    total_amount: number;
    percentage: number;
  }>;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate comprehensive daily report
   */
  async generateDailyReport(filter: DailyReportFilter): Promise<DailyReport> {
    const { store_id, date_from, date_to } = filter;
    const startDate = new Date(date_from);
    const endDate = new Date(date_to);

    this.logger.log(
      `Generating daily report for store ${store_id} from ${date_from} to ${date_to}`
    );

    // Get revenue data
    const revenueData = await this.getRevenueData(store_id, startDate, endDate);

    // Get cost data
    const costData = await this.getCostData(store_id, startDate, endDate);

    // Get beautician performance
    const beauticianPerformance = await this.getBeauticianPerformance(
      store_id,
      startDate,
      endDate
    );

    // Calculate daily breakdown
    const dailyBreakdown = await this.getDailyBreakdown(
      store_id,
      startDate,
      endDate
    );

    // Calculate summary totals
    const summary = this.calculateSummary(revenueData, costData);

    // Get top revenue days
    const topRevenueDays = await this.getTopRevenueDays(
      store_id,
      startDate,
      endDate
    );

    // Get cost trends
    const costTrends = await this.getCostTrends(store_id, startDate, endDate);

    const report: DailyReport = {
      period: {
        start_date: date_from,
        end_date: date_to,
        total_days: Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
      summary,
      daily_breakdown: dailyBreakdown,
      beautician_performance: beauticianPerformance,
      top_revenue_days: topRevenueDays,
      cost_trends: costTrends,
    };

    this.logger.log(
      `Daily report generated successfully for store ${store_id}`
    );

    return report;
  }

  /**
   * Get aggregated revenue data
   */
  private async getRevenueData(
    storeId: string,
    startDate: Date,
    endDate: Date
  ) {
    const result = await this.prisma.serviceSession.aggregate({
      where: {
        store_id: storeId,
        service_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        gross_revenue: true,
        net_revenue: true,
        beautician_share: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        gross_revenue: true,
      },
    });

    return {
      total_gross: Number(result._sum.gross_revenue || 0),
      total_net: Number(result._sum.net_revenue || 0),
      total_beautician_share: Number(result._sum.beautician_share || 0),
      session_count: result._count.id || 0,
      average_per_session: Number(result._avg.gross_revenue || 0),
    };
  }

  /**
   * Get aggregated cost data
   */
  private async getCostData(storeId: string, startDate: Date, endDate: Date) {
    const [totalResult, categoryResult] = await Promise.all([
      this.prisma.costEntry.aggregate({
        where: {
          store_id: storeId,
          entry_date: {
            gte: startDate,
            lte: endDate,
          },
          deleted_at: null,
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        _avg: {
          amount: true,
        },
      }),
      this.prisma.costEntry.groupBy({
        by: ['category'],
        where: {
          store_id: storeId,
          entry_date: {
            gte: startDate,
            lte: endDate,
          },
          deleted_at: null,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const byCategory = categoryResult.reduce((acc, item) => {
      acc[item.category] = Number(item._sum.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      total_amount: Number(totalResult._sum.amount || 0),
      cost_count: totalResult._count.id || 0,
      average_per_day: Number(totalResult._avg.amount || 0),
      by_category: byCategory,
    };
  }

  /**
   * Get beautician performance data
   */
  private async getBeauticianPerformance(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BeauticianPerformance[]> {
    const performanceData = await this.prisma.serviceSession.groupBy({
      by: ['beautician_id'],
      where: {
        store_id: storeId,
        service_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        gross_revenue: true,
        beautician_share: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        gross_revenue: true,
      },
    });

    return performanceData.map((item) => ({
      beautician_id: item.beautician_id,
      // NOTE: Beautician name lookup deferred to Story 1.4 when User/Beautician tables are implemented
      // Current workaround: Display ID suffix for MVP phase
      beautician_name: `美容师-${item.beautician_id.slice(-4)}`,
      total_revenue: Number(item._sum.gross_revenue || 0),
      session_count: item._count.id || 0,
      average_per_session: Number(item._avg.gross_revenue || 0),
      total_share: Number(item._sum.beautician_share || 0),
    }));
  }

  /**
   * Calculate summary totals (KISS principle - simple calculation)
   */
  private calculateSummary(revenueData: any, costData: any): DailyReportData {
    const grossProfit = revenueData.total_gross - costData.total_amount;
    const netProfit = revenueData.total_net - costData.total_amount;
    const profitMargin =
      revenueData.total_gross > 0
        ? (netProfit / revenueData.total_gross) * 100
        : 0;

    return {
      date: 'summary',
      revenue: revenueData,
      costs: costData,
      profit: {
        gross_profit: grossProfit,
        net_profit: netProfit,
        profit_margin: profitMargin,
      },
    };
  }

  /**
   * Get daily breakdown data
   */
  private async getDailyBreakdown(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyReportData[]> {
    // This is a simplified version - in production, you'd want proper daily aggregation
    const revenueByDay = await this.prisma.serviceSession.groupBy({
      by: ['service_date'],
      where: {
        store_id: storeId,
        service_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        gross_revenue: true,
        net_revenue: true,
        beautician_share: true,
      },
      _count: {
        id: true,
      },
    });

    return revenueByDay.map((day) => ({
      date: day.service_date.toISOString().split('T')[0],
      revenue: {
        total_gross: Number(day._sum.gross_revenue || 0),
        total_net: Number(day._sum.net_revenue || 0),
        total_beautician_share: Number(day._sum.beautician_share || 0),
        session_count: day._count.id || 0,
        average_per_session:
          day._count.id > 0
            ? Number(day._sum.gross_revenue || 0) / day._count.id
            : 0,
      },
      costs: {
        // NOTE: Daily cost breakdown deferred - requires join with cost_entries by entry_date
        // MVP shows only aggregate costs in summary section. Full daily integration planned for Story 1.5
        total_amount: 0,
        cost_count: 0,
        average_per_day: 0,
        by_category: {},
      },
      profit: {
        gross_profit: Number(day._sum.gross_revenue || 0),
        net_profit: Number(day._sum.net_revenue || 0),
        profit_margin: 0,
      },
    }));
  }

  /**
   * Get top revenue days
   */
  private async getTopRevenueDays(
    storeId: string,
    startDate: Date,
    endDate: Date
  ) {
    const topDays = await this.prisma.serviceSession.groupBy({
      by: ['service_date'],
      where: {
        store_id: storeId,
        service_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        gross_revenue: true,
      },
      orderBy: {
        _sum: {
          gross_revenue: 'desc',
        },
      },
      take: 5,
    });

    return topDays.map((day) => ({
      date: day.service_date.toISOString().split('T')[0],
      total_revenue: Number(day._sum.gross_revenue || 0),
    }));
  }

  /**
   * Get cost trends by category
   */
  private async getCostTrends(storeId: string, startDate: Date, endDate: Date) {
    const costsByCategory = await this.prisma.costEntry.groupBy({
      by: ['category'],
      where: {
        store_id: storeId,
        entry_date: {
          gte: startDate,
          lte: endDate,
        },
        deleted_at: null,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    const totalCosts = costsByCategory.reduce(
      (sum, item) => sum + Number(item._sum.amount || 0),
      0
    );

    return costsByCategory.map((item) => ({
      category: item.category,
      total_amount: Number(item._sum.amount || 0),
      percentage:
        totalCosts > 0 ? (Number(item._sum.amount || 0) / totalCosts) * 100 : 0,
    }));
  }
}
