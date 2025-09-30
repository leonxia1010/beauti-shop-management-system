/**
 * Cost React Query Hooks
 *
 * Following SOLID principles:
 * - Single Responsibility: Each hook handles one API operation
 * - Open/Closed: Easy to extend with new cost operations
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
  costAPI,
  CostEntry,
  CreateCostEntryDto,
  UpdateCostEntryDto,
  CostFilter,
  CostSummary,
} from '../api/costs';
import { PaginatedResponse } from '../types/common';

// Query keys for consistent caching (DRY principle)
export const costKeys = {
  all: ['costs'] as const,
  entries: () => [...costKeys.all, 'entries'] as const,
  entry: (id: string) => [...costKeys.entries(), id] as const,
  filteredEntries: (filter: CostFilter) =>
    [...costKeys.entries(), 'filtered', filter] as const,
  summary: (storeId: string, dateFrom?: string, dateTo?: string) =>
    [...costKeys.all, 'summary', storeId, dateFrom, dateTo] as const,
  categories: (storeId: string) =>
    [...costKeys.all, 'categories', storeId] as const,
  payers: (storeId: string) => [...costKeys.all, 'payers', storeId] as const,
};

/**
 * Hook to fetch paginated cost entries
 */
export function useCosts(
  filter: CostFilter,
  options?: UseQueryOptions<PaginatedResponse<CostEntry>>
) {
  return useQuery({
    queryKey: costKeys.filteredEntries(filter),
    queryFn: () => costAPI.getCosts(filter),
    ...options,
  });
}

/**
 * Hook to fetch single cost entry
 */
export function useCost(id: string, options?: UseQueryOptions<CostEntry>) {
  return useQuery({
    queryKey: costKeys.entry(id),
    queryFn: () => costAPI.getCostById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create new cost entry
 */
export function useCreateCost(
  options?: UseMutationOptions<CostEntry, Error, CreateCostEntryDto>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: costAPI.createCost,
    onSuccess: (data) => {
      // Invalidate costs list to refresh data
      queryClient.invalidateQueries({ queryKey: costKeys.entries() });

      // Add new cost to cache
      queryClient.setQueryData(costKeys.entry(data.id), data);

      // Invalidate summary to refresh statistics
      queryClient.invalidateQueries({
        queryKey: costKeys.summary(data.store_id),
      });
    },
    ...options,
  });
}

/**
 * Hook to update existing cost entry
 */
export function useUpdateCost(
  options?: UseMutationOptions<
    CostEntry,
    Error,
    { id: string; data: UpdateCostEntryDto }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => costAPI.updateCost(id, data),
    onSuccess: (data) => {
      // Update specific cost in cache
      queryClient.setQueryData(costKeys.entry(data.id), data);

      // Invalidate costs list to refresh aggregations
      queryClient.invalidateQueries({ queryKey: costKeys.entries() });

      // Invalidate summary to refresh statistics
      queryClient.invalidateQueries({
        queryKey: costKeys.summary(data.store_id),
      });
    },
    ...options,
  });
}

/**
 * Hook to delete cost entry
 */
export function useDeleteCost(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: costAPI.deleteCost,
    onSuccess: (_, deletedId) => {
      // Remove cost from cache
      queryClient.removeQueries({ queryKey: costKeys.entry(deletedId) });

      // Invalidate costs list to refresh data
      queryClient.invalidateQueries({ queryKey: costKeys.entries() });

      // Invalidate summary to refresh statistics
      queryClient.invalidateQueries({ queryKey: [...costKeys.all, 'summary'] });
    },
    ...options,
  });
}

/**
 * Hook to fetch cost summary statistics
 */
export function useCostSummary(
  storeId: string,
  dateFrom?: string,
  dateTo?: string,
  options?: UseQueryOptions<CostSummary>
) {
  return useQuery({
    queryKey: costKeys.summary(storeId, dateFrom, dateTo),
    queryFn: () => costAPI.getCostSummary(storeId, dateFrom, dateTo),
    enabled: !!storeId,
    ...options,
  });
}

/**
 * Hook to fetch cost categories
 */
export function useCostCategories(
  storeId: string,
  options?: UseQueryOptions<string[]>
) {
  return useQuery({
    queryKey: costKeys.categories(storeId),
    queryFn: () => costAPI.getCostCategories(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 10, // Categories change infrequently
    ...options,
  });
}

/**
 * Hook to fetch cost payers
 */
export function useCostPayers(
  storeId: string,
  options?: UseQueryOptions<string[]>
) {
  return useQuery({
    queryKey: costKeys.payers(storeId),
    queryFn: () => costAPI.getCostPayers(storeId),
    enabled: !!storeId,
    staleTime: 1000 * 60 * 10, // Payers change infrequently
    ...options,
  });
}

/**
 * Utility hook to prefetch cost data
 * Useful for optimistic loading scenarios
 */
export function usePrefetchCosts() {
  const queryClient = useQueryClient();

  return (filter: CostFilter) => {
    queryClient.prefetchQuery({
      queryKey: costKeys.filteredEntries(filter),
      queryFn: () => costAPI.getCosts(filter),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
}
