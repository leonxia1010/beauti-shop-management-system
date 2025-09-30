/**
 * Revenue API Client
 *
 * Following SOLID principles:
 * - Single Responsibility: Handles only revenue API operations
 * - Open/Closed: Extensible for new revenue endpoints
 * - Interface Segregation: Focused API interface
 * - Dependency Inversion: Depends on abstract HTTP client
 */

import { PaginatedResponse } from '../types/common';

export interface ServiceSession {
  id: string;
  store_id: string;
  beautician_id: string;
  service_date: string;
  gross_revenue: number;
  beautician_share: number;
  subsidy: number;
  net_revenue: number;
  payment_method: 'cash' | 'transfer' | 'other';
  entry_channel: string;
  exception_flag?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceSessionDto {
  store_id: string;
  beautician_id: string;
  service_date: string;
  gross_revenue: number;
  payment_method: 'cash' | 'transfer' | 'other';
  subsidy?: number;
}

export interface UpdateServiceSessionDto {
  beautician_id?: string;
  service_date?: string;
  gross_revenue?: number;
  payment_method?: 'cash' | 'transfer' | 'other';
  subsidy?: number;
}

export interface ServiceSessionFilter {
  store_id: string;
  date_from?: string;
  date_to?: string;
  beautician_id?: string;
  limit?: number;
  cursor?: string;
}

export interface BulkImportResponse {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
    data: Record<string, unknown>;
  }>;
}

/**
 * Revenue API client class
 * Implements clean API contract with proper error handling
 */
export class RevenueAPI {
  private baseUrl: string;

  constructor(baseUrl = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get paginated service sessions with filtering
   */
  async getSessions(
    filter: ServiceSessionFilter
  ): Promise<PaginatedResponse<ServiceSession>> {
    const params = new URLSearchParams();

    // Required parameter
    params.append('store_id', filter.store_id);

    // Optional parameters
    if (filter.date_from) params.append('date_from', filter.date_from);
    if (filter.date_to) params.append('date_to', filter.date_to);
    if (filter.beautician_id)
      params.append('beautician_id', filter.beautician_id);
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.cursor) params.append('cursor', filter.cursor);

    const response = await fetch(`${this.baseUrl}/revenue/sessions?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a single service session
   */
  async createSession(data: CreateServiceSessionDto): Promise<ServiceSession> {
    const response = await fetch(`${this.baseUrl}/revenue/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update an existing service session
   */
  async updateSession(
    id: string,
    data: UpdateServiceSessionDto
  ): Promise<ServiceSession> {
    const response = await fetch(`${this.baseUrl}/revenue/sessions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get single service session by ID
   */
  async getSessionById(id: string): Promise<ServiceSession> {
    const response = await fetch(`${this.baseUrl}/revenue/sessions/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch session: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Bulk import service sessions via file upload
   */
  async bulkImportSessions(
    file: File,
    storeId: string
  ): Promise<BulkImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('store_id', storeId);

    const response = await fetch(`${this.baseUrl}/revenue/bulk-import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to import sessions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Validate session data
   */
  async validateSession(data: CreateServiceSessionDto): Promise<{
    isValid: boolean;
    exceptions: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/revenue/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate session: ${response.statusText}`);
    }

    return response.json();
  }
}

// Default instance (KISS principle - simple to use)
export const revenueAPI = new RevenueAPI();
