/**
 * Reports React Query Hooks
 *
 * Following SOLID principles:
 * - Single Responsibility: Each hook handles one report operation
 * - Open/Closed: Easy to extend with new report types
 * - Dependency Inversion: Depends on abstract query client
 */

import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  reportsAPI,
  DailyReport,
  DailyReportFilter,
  ReportResponse,
  ExportReportResponse,
} from '../api/reports';

// Query keys for consistent caching (DRY principle)
export const reportKeys = {
  all: ['reports'] as const,
  daily: () => [...reportKeys.all, 'daily'] as const,
  dailyReport: (filter: DailyReportFilter) =>
    [...reportKeys.daily(), filter] as const,
  summary: (filter: DailyReportFilter) =>
    [...reportKeys.all, 'summary', filter] as const,
};

/**
 * Hook to fetch daily report
 */
export function useDailyReport(
  filter: DailyReportFilter,
  options?: UseQueryOptions<ReportResponse>
) {
  return useQuery({
    queryKey: reportKeys.dailyReport(filter),
    queryFn: () => reportsAPI.getDailyReport(filter),
    enabled: !!(filter.store_id && filter.date_from && filter.date_to),
    staleTime: 1000 * 60 * 5, // Reports are relatively stable for 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch report summary (lighter weight)
 */
export function useReportSummary(
  filter: DailyReportFilter,
  options?: UseQueryOptions<{
    success: boolean;
    data: {
      period: DailyReport['period'];
      summary: DailyReport['summary'];
      top_performers: DailyReport['beautician_performance'];
    };
    generated_at: string;
  }>
) {
  return useQuery({
    queryKey: reportKeys.summary(filter),
    queryFn: () => reportsAPI.getReportSummary(filter),
    enabled: !!(filter.store_id && filter.date_from && filter.date_to),
    staleTime: 1000 * 60 * 10, // Summary can be cached longer
    ...options,
  });
}

/**
 * Hook to export daily report
 */
export function useExportDailyReport(
  options?: UseMutationOptions<
    ExportReportResponse,
    Error,
    { filter: DailyReportFilter; format: 'excel' | 'pdf' | 'csv' }
  >
) {
  return useMutation({
    mutationFn: ({ filter, format }) =>
      reportsAPI.exportDailyReport(filter, format),
    ...options,
  });
}

/**
 * Hook to download report file
 */
export function useDownloadReport(
  options?: UseMutationOptions<Blob, Error, string>
) {
  return useMutation({
    mutationFn: reportsAPI.downloadReport,
    ...options,
  });
}

/**
 * Custom hook for common report date ranges
 */
export function useReportDateRanges() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return {
    today: {
      label: '今日',
      date_from: formatDate(today),
      date_to: formatDate(today),
    },
    yesterday: {
      label: '昨日',
      date_from: formatDate(yesterday),
      date_to: formatDate(yesterday),
    },
    lastWeek: {
      label: '过去7天',
      date_from: formatDate(lastWeek),
      date_to: formatDate(today),
    },
    lastMonth: {
      label: '过去30天',
      date_from: formatDate(lastMonth),
      date_to: formatDate(today),
    },
    custom: {
      label: '自定义',
      date_from: '',
      date_to: '',
    },
  };
}

/**
 * Hook to prefetch reports for common date ranges
 */
export function usePrefetchReports(storeId: string) {
  const dateRanges = useReportDateRanges();

  return () => {
    // Prefetch common reports
    Object.values(dateRanges).forEach((range) => {
      if (range.date_from && range.date_to) {
        reportsAPI.getReportWithCache({
          store_id: storeId,
          date_from: range.date_from,
          date_to: range.date_to,
        });
      }
    });
  };
}
