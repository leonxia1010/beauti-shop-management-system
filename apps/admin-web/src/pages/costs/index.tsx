/**
 * Cost Management Main Page
 *
 * Following SOLID principles:
 * - Single Responsibility: Orchestrates cost management views
 * - Open/Closed: Extensible for new cost-related features
 * - Dependency Inversion: Depends on abstract components
 */

import React from 'react';
import { CostList } from './CostList';

export function CostsPage() {
  // TODO: Get store ID from auth context
  const storeId = 'current-store';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">成本数据管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            管理门店成本记录、分类统计、成本控制
          </p>
        </div>

        {/* Cost Management Content */}
        <CostList storeId={storeId} />
      </div>
    </div>
  );
}

export default CostsPage;
