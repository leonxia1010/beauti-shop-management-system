/**
 * Reports Main Page
 *
 * Following SOLID principles:
 * - Single Responsibility: Orchestrates daily report display
 * - Open/Closed: Extensible for new report types
 * - Dependency Inversion: Uses abstract data hooks
 */

import React, { useState } from 'react';
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { KPICard, KPIDashboard } from '../../components/ui/SimpleKpiCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { SimpleTable } from '../../components/ui/SimpleTable';
import { Badge } from '../../components/ui/badge';
import {
  useDailyReport,
  useReportSummary,
  useExportDailyReport,
  useReportDateRanges,
  DailyReportFilter,
} from '@beauty-shop/data-access';
import { TableColumn } from '../../lib/table';

export function ReportsPage() {
  // TODO: Get store ID from auth context
  const storeId = 'current-store';

  const dateRanges = useReportDateRanges();
  const [selectedRange, setSelectedRange] = useState('lastWeek');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  // Build filter based on selection
  const filter: DailyReportFilter = React.useMemo(() => {
    if (selectedRange === 'custom') {
      return {
        store_id: storeId,
        date_from: customDateFrom,
        date_to: customDateTo,
      };
    }

    const range = dateRanges[selectedRange as keyof typeof dateRanges];
    return {
      store_id: storeId,
      date_from: range.date_from,
      date_to: range.date_to,
    };
  }, [storeId, selectedRange, customDateFrom, customDateTo, dateRanges]);

  // Data hooks
  const {
    data: reportData,
    isLoading: reportLoading,
    error: reportError,
  } = useDailyReport(filter, {
    enabled: !!(filter.date_from && filter.date_to),
  });

  const { data: summaryData } = useReportSummary(filter, {
    enabled: !!(filter.date_from && filter.date_to),
  });

  const exportMutation = useExportDailyReport();

  // KPI calculations
  const kpiData = React.useMemo(() => {
    if (!summaryData?.data) return null;

    const summary = summaryData.data.summary;
    return [
      {
        title: '总收入',
        value: `¥${summary.revenue.total_gross.toLocaleString()}`,
        change: '+8.2%',
        trend: 'up' as const,
        icon: DollarSign,
      },
      {
        title: '净利润',
        value: `¥${summary.profit.net_profit.toLocaleString()}`,
        change: `${summary.profit.profit_margin.toFixed(1)}% 利润率`,
        trend: summary.profit.net_profit > 0 ? 'up' : ('down' as const),
        icon: TrendingUp,
      },
      {
        title: '服务次数',
        value: summary.revenue.session_count.toString(),
        change: `平均 ¥${summary.revenue.average_per_session.toLocaleString()}/次`,
        trend: 'neutral' as const,
        icon: Users,
      },
      {
        title: '总成本',
        value: `¥${summary.costs.total_amount.toLocaleString()}`,
        change: `${summary.costs.cost_count} 项成本`,
        trend: 'neutral' as const,
        icon: BarChart3,
      },
    ];
  }, [summaryData]);

  // Table columns for daily breakdown
  const dailyColumns: TableColumn<any>[] = [
    {
      key: 'date',
      title: '日期',
      render: (_, day) => new Date(day.date).toLocaleDateString('zh-CN'),
    },
    {
      key: 'revenue',
      title: '收入',
      render: (_, day) => `¥${day.revenue.total_gross.toLocaleString()}`,
    },
    {
      key: 'sessions',
      title: '服务次数',
      render: (_, day) => day.revenue.session_count,
    },
    {
      key: 'costs',
      title: '成本',
      render: (_, day) => `¥${day.costs.total_amount.toLocaleString()}`,
    },
    {
      key: 'profit',
      title: '净利润',
      render: (_, day) => (
        <span
          className={
            day.profit.net_profit > 0 ? 'text-green-600' : 'text-red-600'
          }
        >
          ¥{day.profit.net_profit.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'margin',
      title: '利润率',
      render: (_, day) => (
        <Badge
          variant={day.profit.profit_margin > 20 ? 'default' : 'secondary'}
        >
          {day.profit.profit_margin.toFixed(1)}%
        </Badge>
      ),
    },
  ];

  // Table columns for beautician performance
  const beauticianColumns: TableColumn<any>[] = [
    {
      key: 'name',
      title: '美容师',
      render: (_, beautician) => beautician.beautician_name,
    },
    {
      key: 'revenue',
      title: '总收入',
      render: (_, beautician) =>
        `¥${beautician.total_revenue.toLocaleString()}`,
    },
    {
      key: 'sessions',
      title: '服务次数',
      render: (_, beautician) => beautician.session_count,
    },
    {
      key: 'average',
      title: '平均单价',
      render: (_, beautician) =>
        `¥${beautician.average_per_session.toLocaleString()}`,
    },
    {
      key: 'share',
      title: '美容师分成',
      render: (_, beautician) => `¥${beautician.total_share.toLocaleString()}`,
    },
  ];

  // Event handlers
  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      const result = await exportMutation.mutateAsync({ filter, format });

      if (result.download_url) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.download_url;
        link.download = result.filename || `report.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (result.data && format === 'csv') {
        // Handle CSV data directly
        const csvContent = Object.values(result.data).flat().join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || 'report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (reportError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-8">
          <p className="text-red-600">加载报表数据失败</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">日常报表</h1>
          <p className="text-sm text-gray-600 mt-1">
            查看门店收入、成本和利润统计数据
          </p>
        </div>

        {/* Date Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              报表时间范围
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium mb-2">
                  时间范围
                </label>
                <Select value={selectedRange} onValueChange={setSelectedRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dateRanges).map(([key, range]) => (
                      <SelectItem key={key} value={key}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRange === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      开始日期
                    </label>
                    <Input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      结束日期
                    </label>
                    <Input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExport('excel')}
                  disabled={exportMutation.isPending || !reportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('pdf')}
                  disabled={exportMutation.isPending || !reportData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Dashboard */}
        {kpiData && (
          <KPIDashboard>
            {kpiData.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </KPIDashboard>
        )}

        {/* Daily Breakdown */}
        {reportData?.data && (
          <Card>
            <CardHeader>
              <CardTitle>每日收支明细</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={reportData.data.daily_breakdown}
                columns={dailyColumns}
                loading={reportLoading}
              />
            </CardContent>
          </Card>
        )}

        {/* Beautician Performance */}
        {reportData?.data && (
          <Card>
            <CardHeader>
              <CardTitle>美容师业绩</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleTable
                data={reportData.data.beautician_performance}
                columns={beauticianColumns}
                loading={reportLoading}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
