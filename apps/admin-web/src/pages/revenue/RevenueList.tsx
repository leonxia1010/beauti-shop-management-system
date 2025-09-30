import React, { useState, useMemo } from 'react';
import {
  Plus,
  Upload,
  Download,
  Filter,
  DollarSign,
  HandCoins,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { KPICard, KPIDashboard } from '../../components/ui/SimpleKpiCard';
import {
  StatusTabs,
  StatusFilter,
  StatusIndicator,
} from '../../components/ui/SimpleStatus';
import { SimpleTable } from '../../components/ui/SimpleTable';
import { EditableCell } from '../../components/ui/CellEditor';
import { BulkActions } from '../../components/ui/BulkActions';
import { useTableSelection } from '../../hooks/useTableSelection';
import {
  StatusType,
  classifyRevenueStatus,
  calculateStatusCounts,
} from '../../lib/status';
import { TableColumn } from '../../lib/table';

interface RevenueRecord extends Record<string, unknown> {
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

  // Table selection
  const {
    selectedRows,
    handleSelectAll,
    handleSelectRow,
    clearSelection,
    selectedCount,
    selectedKeys,
  } = useTableSelection(revenueData);

  // Calculate status counts
  const statusCounts = calculateStatusCounts(
    revenueData,
    classifyRevenueStatus
  );

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

  const columns: TableColumn<RevenueRecord>[] = [
    {
      key: 'service_date',
      title: '日期',
      width: '120px',
      render: (value, record) => (
        <EditableCell
          value={value}
          record={record}
          config={{ field: 'service_date', type: 'date' }}
          onEdit={handleEdit}
        />
      ),
    },
    {
      key: 'beautician_name',
      title: '美容师',
      width: '100px',
      render: (value, record) => (
        <EditableCell
          value={value}
          record={record}
          config={{
            field: 'beautician_name',
            type: 'select',
            options: [
              { label: '小美', value: '小美' },
              { label: '小雅', value: '小雅' },
              { label: '小琳', value: '小琳' },
            ],
          }}
          onEdit={handleEdit}
        />
      ),
    },
    {
      key: 'gross_revenue',
      title: '总金额',
      width: '120px',
      render: (value, record) => (
        <EditableCell
          value={value}
          record={record}
          config={{ field: 'gross_revenue', type: 'input' }}
          onEdit={handleEdit}
          render={(value) => `¥${(value as number).toFixed(2)}`}
        />
      ),
    },
    {
      key: 'beautician_share',
      title: '美容师分成',
      width: '120px',
      render: (value) => `¥${(value as number).toFixed(2)}`,
    },
    {
      key: 'net_revenue',
      title: '净收入',
      width: '120px',
      render: (value) => `¥${(value as number).toFixed(2)}`,
    },
    {
      key: 'payment_method',
      title: '支付方式',
      width: '100px',
      render: (value, record) => {
        const labels = { cash: '现金', transfer: '转账', other: '其他' };
        return (
          <EditableCell
            value={value}
            record={record}
            config={{
              field: 'payment_method',
              type: 'select',
              options: [
                { label: '现金', value: 'cash' },
                { label: '转账', value: 'transfer' },
                { label: '其他', value: 'other' },
              ],
            }}
            onEdit={handleEdit}
            render={(value) =>
              labels[value as keyof typeof labels] || String(value)
            }
          />
        );
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
    newValue: unknown
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

  const handleBulkAction = async (action: string) => {
    console.log('Bulk action:', action, 'for items:', selectedKeys);

    if (action === 'confirm') {
      setRevenueData((prev) =>
        prev.map((item) =>
          selectedKeys.includes(item.id) ? { ...item, confirmed: true } : item
        )
      );
      clearSelection();
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
          <KPICard
            title="今日净收入"
            value={`¥${kpiData.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            colorScheme="teal"
          />
          <KPICard
            title="未交接现金"
            value={`¥${kpiData.pendingCash.toFixed(2)}`}
            subtitle={`${kpiData.cashBatchCount} 个批次`}
            icon={HandCoins}
            colorScheme="amber"
          />
          <KPICard
            title="异常待处理"
            value={kpiData.exceptionCount.toString()}
            subtitle={kpiData.exceptionCount > 0 ? '需要处理' : '无异常'}
            icon={AlertTriangle}
            colorScheme="red"
          />
          <KPICard
            title="美容师"
            value={kpiData.activeBeauticians.toString()}
            subtitle={`共 ${kpiData.beauticianCount} 人`}
            icon={UserCheck}
            colorScheme="blue"
          />
        </KPIDashboard>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <StatusTabs
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            counts={statusCounts}
          />

          {/* Bulk Actions */}
          <div className="p-6 space-y-4">
            <BulkActions
              selectedCount={selectedCount}
              actions={[
                { label: '批量确认', value: 'confirm' },
                { label: '批量删除', value: 'delete' },
                { label: '导出选中', value: 'export' },
              ]}
              onAction={handleBulkAction}
            />

            {/* Table */}
            <StatusFilter
              activeStatus={activeStatus}
              data={revenueData}
              getItemStatus={classifyRevenueStatus}
            >
              {(filteredData) => (
                <SimpleTable
                  data={filteredData}
                  columns={columns}
                  selectable={true}
                  selectedRows={selectedRows}
                  onSelectAll={handleSelectAll}
                  onSelectRow={handleSelectRow}
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
