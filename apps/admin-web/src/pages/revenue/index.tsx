import React, { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { RevenueListPage } from './RevenueList';
import { BulkImportPage } from './BulkImport';

/**
 * Revenue Management Main Page
 *
 * Following SOLID principles:
 * - Single Responsibility: Orchestrates revenue management views
 * - Open/Closed: Extensible for new revenue-related tabs
 * - Dependency Inversion: Depends on abstract tab interface
 */
export function RevenuePage() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">收入数据管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            管理每日收入记录、批量导入数据、查看收入统计
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <span>收入记录</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <span>批量导入</span>
            </TabsTrigger>
          </TabsList>

          {/* Revenue List Tab */}
          <TabsContent value="list" className="mt-6">
            <RevenueListPage />
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="import" className="mt-6">
            <BulkImportPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default RevenuePage;
