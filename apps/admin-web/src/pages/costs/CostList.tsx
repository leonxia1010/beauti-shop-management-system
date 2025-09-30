/**
 * Cost List Component
 *
 * Following SOLID principles:
 * - Single Responsibility: Displays and manages cost records list
 * - Open/Closed: Extensible for new list features
 * - Dependency Inversion: Uses abstract data hooks
 */

import { useState, useMemo } from 'react';
import {
  Plus,
  DollarSign,
  HandCoins,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { KPICard, KPIDashboard } from '../../components/ui/SimpleKpiCard';
import { SimpleTable } from '../../components/ui/SimpleTable';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '../../components/ui/Dialog';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { CostForm } from './CostForm';
import {
  useCosts,
  useCostSummary,
  useCostCategories,
  useCostPayers,
  useCreateCost,
  useUpdateCost,
  useDeleteCost,
  CostEntry,
  CostFilter,
} from '@beauty-shop/data-access';
import { TableColumn } from '../../lib/table';

interface CostListProps {
  storeId: string;
}

export function CostList({ storeId }: CostListProps) {
  const [filter, setFilter] = useState<CostFilter>({
    store_id: storeId,
    limit: 50,
  });
  const [selectedCost, setSelectedCost] = useState<CostEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Data hooks (following Dependency Inversion)
  const {
    data: costsData,
    isLoading: costsLoading,
    error: costsError,
  } = useCosts(filter);

  const { data: summary } = useCostSummary(storeId);
  const { data: categories = [] } = useCostCategories(storeId);
  const { data: payers = [] } = useCostPayers(storeId);

  // Mutation hooks
  const createCostMutation = useCreateCost();
  const updateCostMutation = useUpdateCost();
  const deleteCostMutation = useDeleteCost();

  // KPI calculations (KISS principle - simple calculations)
  const kpiData = useMemo(() => {
    if (!summary) return null;

    return [
      {
        title: '总成本',
        value: `¥${summary.totalCosts.toLocaleString()}`,
        change: '+5.2%',
        trend: 'up' as const,
        icon: DollarSign,
      },
      {
        title: '日均成本',
        value: `¥${summary.averageDailyCost.toLocaleString()}`,
        change: '+2.1%',
        trend: 'up' as const,
        icon: HandCoins,
      },
      {
        title: '异常项目',
        value: '0',
        change: '0',
        trend: 'neutral' as const,
        icon: AlertTriangle,
      },
    ];
  }, [summary]);

  // Table columns definition (DRY principle)
  const columns: TableColumn<CostEntry>[] = [
    {
      key: 'entry_date',
      title: '日期',
      render: (_, cost: CostEntry) =>
        new Date(cost.entry_date).toLocaleDateString('zh-CN'),
    },
    {
      key: 'category',
      title: '类别',
      render: (_, cost: CostEntry) => (
        <Badge variant="secondary">{cost.category}</Badge>
      ),
    },
    {
      key: 'payer',
      title: '付款方',
      render: (_, cost: CostEntry) => cost.payer,
    },
    {
      key: 'amount',
      title: '金额',
      render: (_, cost: CostEntry) => `¥${cost.amount.toLocaleString()}`,
    },
    {
      key: 'description',
      title: '备注',
      render: (_, cost: CostEntry) => cost.description || '-',
    },
    {
      key: 'actions' as keyof CostEntry,
      title: '操作',
      render: (_, cost: CostEntry) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEdit(cost)}>
              <Edit className="h-4 w-4 mr-2" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(cost.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Event handlers (Single Responsibility)
  const handleCreate = () => {
    setSelectedCost(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEdit = (cost: CostEntry) => {
    setSelectedCost(cost);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleDelete = async (costId: string) => {
    if (confirm('确定要删除这条成本记录吗？')) {
      try {
        await deleteCostMutation.mutateAsync(costId);
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (isEditMode && selectedCost) {
        await updateCostMutation.mutateAsync({
          id: selectedCost.id,
          data,
        });
      } else {
        await createCostMutation.mutateAsync(data);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleFilterChange = (key: keyof CostFilter, value: string) => {
    setFilter((prev: CostFilter) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value || undefined,
    }));
  };

  if (costsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">加载成本数据失败</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Dashboard */}
      {kpiData && (
        <KPIDashboard>
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </KPIDashboard>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <Select
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择类别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类别</SelectItem>
              {categories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payer Filter */}
          <Select onValueChange={(value) => handleFilterChange('payer', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择付款方" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部付款方</SelectItem>
              {payers.map((payer: string) => (
                <SelectItem key={payer} value={payer}>
                  {payer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filters */}
          <Input
            type="date"
            placeholder="开始日期"
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            placeholder="结束日期"
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            className="w-40"
          />
        </div>

        {/* Create Button */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              新增成本
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <CostForm
              initialData={selectedCost || undefined}
              categories={categories}
              payers={payers}
              isSubmitting={
                createCostMutation.isPending || updateCostMutation.isPending
              }
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cost Records Table */}
      <SimpleTable
        data={costsData?.data || []}
        columns={columns}
        loading={costsLoading}
      />

      {/* Pagination Info */}
      {costsData?.pagination && (
        <div className="text-sm text-gray-500 text-center">
          共 {costsData.pagination.total} 条记录
        </div>
      )}
    </div>
  );
}
