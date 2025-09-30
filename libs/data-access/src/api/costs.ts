/**
 * Cost API Client
 *
 * Following SOLID principles:
 * - Single Responsibility: Handles only cost API operations
 * - Open/Closed: Extensible for new cost endpoints
 * - Interface Segregation: Focused API interface
 * - Dependency Inversion: Depends on abstract HTTP client
 */

import { PaginatedResponse } from '../types/common';

export interface CostEntry {
  id: string;
  store_id: string;
  category: string;
  payer: string;
  amount: number;
  allocation_rule_id?: string;
  description?: string;
  entry_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateCostEntryDto {
  store_id: string;
  category: string;
  payer: string;
  amount: number;
  allocation_rule_id?: string;
  description?: string;
  entry_date: string;
}

export interface UpdateCostEntryDto {
  category?: string;
  payer?: string;
  amount?: number;
  allocation_rule_id?: string;
  description?: string;
  entry_date?: string;
}

export interface CostFilter {
  store_id: string;
  category?: string;
  payer?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  cursor?: string;
}

export interface CostSummary {
  totalCosts: number;
  costsByCategory: Record<string, number>;
  costsByPayer: Record<string, number>;
  averageDailyCost: number;
}

/**
 * Cost API client class
 * Implements clean API contract with proper error handling
 */
export class CostAPI {
  private baseUrl: string;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get paginated cost entries with filtering
   */
  async getCosts(filter: CostFilter): Promise<PaginatedResponse<CostEntry>> {
    const params = new URLSearchParams();

    // Required parameter
    params.append('store_id', filter.store_id);

    // Optional parameters
    if (filter.category) params.append('category', filter.category);
    if (filter.payer) params.append('payer', filter.payer);
    if (filter.date_from) params.append('date_from', filter.date_from);
    if (filter.date_to) params.append('date_to', filter.date_to);
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.cursor) params.append('cursor', filter.cursor);

    const response = await fetch(`${this.baseUrl}/costs?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch costs: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new cost entry
   */
  async createCost(data: CreateCostEntryDto): Promise<CostEntry> {
    const response = await fetch(`${this.baseUrl}/costs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create cost: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update an existing cost entry
   */
  async updateCost(id: string, data: UpdateCostEntryDto): Promise<CostEntry> {
    const response = await fetch(`${this.baseUrl}/costs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update cost: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get single cost entry by ID
   */
  async getCostById(id: string): Promise<CostEntry> {
    const response = await fetch(`${this.baseUrl}/costs/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch cost: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Soft delete a cost entry
   */
  async deleteCost(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/costs/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete cost: ${response.statusText}`);
    }
  }

  /**
   * Get cost summary statistics
   */
  async getCostSummary(
    storeId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<CostSummary> {
    const params = new URLSearchParams();
    params.append('store_id', storeId);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const response = await fetch(`${this.baseUrl}/costs/summary?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch cost summary: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get cost categories for the store
   */
  async getCostCategories(storeId: string): Promise<string[]> {
    const response = await fetch(
      `${this.baseUrl}/costs/categories?store_id=${storeId}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch cost categories: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.categories || [];
  }

  /**
   * Get cost payers for the store
   */
  async getCostPayers(storeId: string): Promise<string[]> {
    const response = await fetch(
      `${this.baseUrl}/costs/payers?store_id=${storeId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch cost payers: ${response.statusText}`);
    }

    const result = await response.json();
    return result.payers || [];
  }
}

// Default instance (KISS principle - simple to use)
export const costAPI = new CostAPI();
