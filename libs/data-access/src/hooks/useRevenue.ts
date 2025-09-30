/**
 * Revenue React Query Hooks
 *
 * Following SOLID principles:
 * - Single Responsibility: Each hook handles one API operation
 * - Open/Closed: Easy to extend with new revenue operations
 * - Dependency Inversion: Depends on abstract query client
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  revenueAPI,
  ServiceSession,
  CreateServiceSessionDto,
  UpdateServiceSessionDto,
  ServiceSessionFilter,
  BulkImportResponse,
} from '../api/revenue';
import { PaginatedResponse } from '../types/common';

// Query keys for consistent caching (DRY principle)
export const revenueKeys = {
  all: ['revenue'] as const,
  sessions: () => [...revenueKeys.all, 'sessions'] as const,
  session: (id: string) => [...revenueKeys.sessions(), id] as const,
  filteredSessions: (filter: ServiceSessionFilter) =>
    [...revenueKeys.sessions(), 'filtered', filter] as const,
};

/**
 * Hook to fetch paginated service sessions
 */
export function useRevenueSessions(
  filter: ServiceSessionFilter,
  options?: UseQueryOptions<PaginatedResponse<ServiceSession>>
) {
  return useQuery({
    queryKey: revenueKeys.filteredSessions(filter),
    queryFn: () => revenueAPI.getSessions(filter),
    ...options,
  });
}

/**
 * Hook to fetch single service session
 */
export function useRevenueSession(
  id: string,
  options?: UseQueryOptions<ServiceSession>
) {
  return useQuery({
    queryKey: revenueKeys.session(id),
    queryFn: () => revenueAPI.getSessionById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create new service session
 */
export function useCreateRevenueSession(
  options?: UseMutationOptions<ServiceSession, Error, CreateServiceSessionDto>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revenueAPI.createSession,
    onSuccess: (data) => {
      // Invalidate sessions list to refresh data
      queryClient.invalidateQueries({ queryKey: revenueKeys.sessions() });

      // Add new session to cache
      queryClient.setQueryData(revenueKeys.session(data.id), data);
    },
    ...options,
  });
}

/**
 * Hook to update existing service session
 */
export function useUpdateRevenueSession(
  options?: UseMutationOptions<
    ServiceSession,
    Error,
    { id: string; data: UpdateServiceSessionDto }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => revenueAPI.updateSession(id, data),
    onSuccess: (data) => {
      // Update specific session in cache
      queryClient.setQueryData(revenueKeys.session(data.id), data);

      // Invalidate sessions list to refresh aggregations
      queryClient.invalidateQueries({ queryKey: revenueKeys.sessions() });
    },
    ...options,
  });
}

/**
 * Hook to bulk import service sessions
 */
export function useBulkImportRevenue(
  options?: UseMutationOptions<
    BulkImportResponse,
    Error,
    { file: File; storeId: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, storeId }) =>
      revenueAPI.bulkImportSessions(file, storeId),
    onSuccess: () => {
      // Invalidate all revenue sessions to refresh after bulk import
      queryClient.invalidateQueries({ queryKey: revenueKeys.sessions() });
    },
    ...options,
  });
}

/**
 * Hook to validate service session data
 */
export function useValidateRevenueSession(
  options?: UseMutationOptions<
    { isValid: boolean; exceptions: string[] },
    Error,
    CreateServiceSessionDto
  >
) {
  return useMutation({
    mutationFn: revenueAPI.validateSession,
    ...options,
  });
}

/**
 * Utility hook to prefetch revenue sessions
 * Useful for optimistic loading scenarios
 */
export function usePrefetchRevenueSessions() {
  const queryClient = useQueryClient();

  return (filter: ServiceSessionFilter) => {
    queryClient.prefetchQuery({
      queryKey: revenueKeys.filteredSessions(filter),
      queryFn: () => revenueAPI.getSessions(filter),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
}
