import React, { useState, useMemo } from 'react';
import { Plus, Upload, Download, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  KPIDashboard,
  NetRevenueCard,
  CashHandoverCard,
  ExceptionCard,
  BeauticianCard,
} from '../../components/ui/kpi-summary-card';
import {
  StatusTabs,
  StatusFilter,
  StatusIndicator,
  useStatusCounts,
  classifyRevenueStatus,
  StatusType,
} from '../../components/ui/status-tabs';
import { EditableTable, Column } from '../../components/ui/editable-table';

interface RevenueRecord {
  id: string;
  store_id: string;
  beautician_id: string;
  beautician_name: string;
  service_date: string;
  gross_revenue: number;
  beautician_share: number;
  net_revenue: number;
  payment_method: 'cash' | 'transfer' | 'other';
  exception_flag?: boolean;
  confirmed?: boolean;
  created_at: string;
}

// Mock data
const mockRevenueData: RevenueRecord[] = [
  {
    id: '1',
    store_id: 'store-001',
    beautician_id: 'beautician-001',
    beautician_name: '小美',
    service_date: '2024-01-15',
    gross_revenue: 280.0,
    beautician_share: 168.0,
    net_revenue: 112.0,
    payment_method: 'cash',
    exception_flag: false,
    confirmed: true,
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    store_id: 'store-001',
    beautician_id: 'beautician-002',
    beautician_name: '小雅',
    service_date: '2024-01-15',
    gross_revenue: 450.0,
    beautician_share: 270.0,
    net_revenue: 180.0,
    payment_method: 'transfer',
    exception_flag: true,
    confirmed: false,
    created_at: '2024-01-15T14:20:00Z',
  },
  {
    id: '3',
    store_id: 'store-001',
    beautician_id: 'beautician-001',
    beautician_name: '小美',
    service_date: '2024-01-16',
    gross_revenue: 320.0,
    beautician_share: 192.0,
    net_revenue: 128.0,
    payment_method: 'cash',
    exception_flag: false,
    confirmed: false,
    created_at: '2024-01-16T09:15:00Z',
  },
];

export function RevenueListPage() {
  const [activeStatus, setActiveStatus] = useState<StatusType>('all');
  const [revenueData, setRevenueData] = useState(mockRevenueData);
  const [loading, setLoading] = useState(false);

  // Calculate status counts
  const statusCounts = useStatusCounts(revenueData, classifyRevenueStatus);

  // KPI calculations
  const kpiData = useMemo(() => {
    const totalRevenue = revenueData.reduce(
      (sum, record) => sum + record.net_revenue,
      0
    );
    const pendingCash = revenueData
      .filter((r) => r.payment_method === 'cash' && !r.confirmed)
      .reduce((sum, record) => sum + record.gross_revenue, 0);
    const exceptionCount = revenueData.filter((r) => r.exception_flag).length;
    const beauticianCount = new Set(revenueData.map((r) => r.beautician_id))
      .size;
    const activeBeauticians = new Set(
      revenueData
        .filter((r) => new Date(r.service_date) >= new Date('2024-01-15'))
        .map((r) => r.beautician_id)
    ).size;

    return {
      totalRevenue,
      pendingCash,
      cashBatchCount: 3,
      exceptionCount,
      beauticianCount,
      activeBeauticians,
    };
  }, [revenueData]);

  const columns: Column<RevenueRecord>[] = [
    {
      key: 'service_date',
      title: '日期',
      width: '120px',
      editable: true,
      editType: 'date',
    },
    {
      key: 'beautician_name',
      title: '美容师',
      width: '100px',
      editable: true,
      editType: 'select',
      editOptions: [
        { label: '小美', value: '小美' },
        { label: '小雅', value: '小雅' },
        { label: '小琳', value: '小琳' },
      ],
    },
    {
      key: 'gross_revenue',
      title: '总金额',
      width: '120px',
      editable: true,
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      key: 'beautician_share',
      title: '美容师分成',
      width: '120px',
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      key: 'net_revenue',
      title: '净收入',
      width: '120px',
      render: (value) => `¥${value.toFixed(2)}`,
    },
    {
      key: 'payment_method',
      title: '支付方式',
      width: '100px',
      editable: true,
      editType: 'select',
      editOptions: [
        { label: '现金', value: 'cash' },
        { label: '转账', value: 'transfer' },
        { label: '其他', value: 'other' },
      ],
      render: (value) => {
        const labels = { cash: '现金', transfer: '转账', other: '其他' };
        return labels[value as keyof typeof labels] || value;
      },
    },
    {
      key: 'confirmed',
      title: '状态',
      width: '100px',
      render: (_, record) => (
        <StatusIndicator status={classifyRevenueStatus(record)} />
      ),
    },
  ];

  const handleEdit = async (
    record: RevenueRecord,
    field: keyof RevenueRecord,
    newValue: any
  ) => {
    // Simulate API call
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update local state
      setRevenueData((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, [field]: newValue } : item
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (selectedIds: string[], action: string) => {
    console.log('Bulk action:', action, 'for items:', selectedIds);

    if (action === 'confirm') {
      setRevenueData((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, confirmed: true } : item
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">收入管理</h1>
            <p className="text-gray-600 mt-1">管理和查看门店收入记录</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button
              onClick={() => (window.location.href = '/revenue/bulk-import')}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              批量导入
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              新增记录
            </Button>
          </div>
        </div>

        {/* KPI Dashboard */}
        <KPIDashboard className="mb-8">
          <NetRevenueCard
            netRevenue={kpiData.totalRevenue}
            previousNetRevenue={kpiData.totalRevenue * 0.9}
          />
          <CashHandoverCard
            pendingCash={kpiData.pendingCash}
            batchCount={kpiData.cashBatchCount}
          />
          <ExceptionCard exceptionCount={kpiData.exceptionCount} />
          <BeauticianCard
            beauticianCount={kpiData.beauticianCount}
            activeCount={kpiData.activeBeauticians}
          />
        </KPIDashboard>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <StatusTabs
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            counts={statusCounts}
          />

          {/* Table */}
          <div className="p-6">
            <StatusFilter
              activeStatus={activeStatus}
              data={revenueData}
              getItemStatus={classifyRevenueStatus}
            >
              {(filteredData) => (
                <EditableTable
                  data={filteredData}
                  columns={columns}
                  onEdit={handleEdit}
                  onBulkAction={handleBulkAction}
                  selectable={true}
                  loading={loading}
                />
              )}
            </StatusFilter>
          </div>
        </div>
      </div>
    </div>
  );
}
