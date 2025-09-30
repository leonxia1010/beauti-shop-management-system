import { CheckCircle, AlertTriangle, List } from 'lucide-react';

export type StatusType = 'all' | 'normal' | 'exception' | 'confirmed';

export interface StatusConfig {
  key: StatusType;
  label: string;
  icon: typeof CheckCircle;
  variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  color: string;
}

const STATUS_CONFIGS: Record<StatusType, StatusConfig> = {
  all: {
    key: 'all',
    label: '全部',
    icon: List,
    variant: 'secondary',
    color: 'text-gray-600 border-gray-300',
  },
  normal: {
    key: 'normal',
    label: '正常',
    icon: CheckCircle,
    variant: 'success',
    color: 'text-green-600 border-green-300',
  },
  exception: {
    key: 'exception',
    label: '异常',
    icon: AlertTriangle,
    variant: 'warning',
    color: 'text-yellow-600 border-yellow-300',
  },
  confirmed: {
    key: 'confirmed',
    label: '已确认',
    icon: CheckCircle,
    variant: 'default',
    color: 'text-blue-600 border-blue-300',
  },
};

export function getStatusConfig(status: StatusType): StatusConfig {
  return STATUS_CONFIGS[status];
}

export function classifyRevenueStatus(record: any): StatusType {
  if (record.exception_flag) return 'exception';
  if (record.confirmed) return 'confirmed';
  return 'normal';
}

export function classifyCostStatus(record: any): StatusType {
  if (record.category?.startsWith('[DELETED]')) return 'exception';
  if (record.verified) return 'confirmed';
  return 'normal';
}

export function calculateStatusCounts<T>(
  data: T[],
  getItemStatus: (item: T) => StatusType
): Record<StatusType, number> {
  const counts: Record<StatusType, number> = {
    all: data.length,
    normal: 0,
    exception: 0,
    confirmed: 0,
  };

  data.forEach((item) => {
    const status = getItemStatus(item);
    if (status !== 'all') {
      counts[status]++;
    }
  });

  return counts;
}
