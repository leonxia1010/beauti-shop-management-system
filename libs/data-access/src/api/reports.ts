/**
 * Reports API Client
 *
 * Following SOLID principles:
 * - Single Responsibility: Handles only report API operations
 * - Open/Closed: Extensible for new report endpoints
 * - Interface Segregation: Focused on reporting operations
 */

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

export interface ReportResponse {
  success: boolean;
  data: DailyReport;
  generated_at: string;
}

export interface ExportReportResponse {
  success: boolean;
  data?: Record<string, unknown>;
  format: 'excel' | 'pdf' | 'csv';
  download_url?: string;
  filename?: string;
  expires_at?: string;
}

/**
 * Reports API client class
 * Implements clean API contract for report operations
 */
export class ReportsAPI {
  private baseUrl: string;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate comprehensive daily report
   */
  async getDailyReport(filter: DailyReportFilter): Promise<ReportResponse> {
    const params = new URLSearchParams();
    params.append('store_id', filter.store_id);
    params.append('date_from', filter.date_from);
    params.append('date_to', filter.date_to);

    const response = await fetch(`${this.baseUrl}/reports/daily?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch daily report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get quick report summary
   */
  async getReportSummary(filter: DailyReportFilter): Promise<{
    success: boolean;
    data: {
      period: DailyReport['period'];
      summary: DailyReportData;
      top_performers: BeauticianPerformance[];
    };
    generated_at: string;
  }> {
    const params = new URLSearchParams();
    params.append('store_id', filter.store_id);
    params.append('date_from', filter.date_from);
    params.append('date_to', filter.date_to);

    const response = await fetch(`${this.baseUrl}/reports/summary?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch report summary: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Export daily report in specified format
   */
  async exportDailyReport(
    filter: DailyReportFilter,
    format: 'excel' | 'pdf' | 'csv' = 'excel'
  ): Promise<ExportReportResponse> {
    const params = new URLSearchParams();
    params.append('store_id', filter.store_id);
    params.append('date_from', filter.date_from);
    params.append('date_to', filter.date_to);
    params.append('format', format);

    const response = await fetch(
      `${this.baseUrl}/reports/daily/export?${params}`
    );

    if (!response.ok) {
      throw new Error(`Failed to export daily report: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download exported report file
   */
  async downloadReport(downloadUrl: string): Promise<Blob> {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Generate report for specific date range with caching
   */
  async getReportWithCache(
    filter: DailyReportFilter,
    cacheKey?: string
  ): Promise<ReportResponse> {
    // Simple cache implementation (can be enhanced with proper cache store)
    const key =
      cacheKey ||
      `report-${filter.store_id}-${filter.date_from}-${filter.date_to}`;
    const cached = sessionStorage.getItem(key);

    if (cached) {
      const cachedData = JSON.parse(cached);
      const cacheAge = Date.now() - cachedData.timestamp;

      // Cache for 5 minutes
      if (cacheAge < 5 * 60 * 1000) {
        return cachedData.data;
      }
    }

    const report = await this.getDailyReport(filter);

    // Store in cache
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data: report,
        timestamp: Date.now(),
      })
    );

    return report;
  }
}

// Default instance (KISS principle - simple to use)
export const reportsAPI = new ReportsAPI();
