import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, List } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '../../lib/utils';

export type StatusType = 'all' | 'normal' | 'exception' | 'confirmed';

export interface StatusTabConfig {
  key: StatusType;
  label: string;
  icon: React.ReactNode;
  color: string;
  count?: number;
}

interface StatusTabsProps {
  activeStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
  counts?: Record<StatusType, number>;
  className?: string;
}

export function StatusTabs({
  activeStatus,
  onStatusChange,
  counts,
  className,
}: StatusTabsProps) {
  const tabs: StatusTabConfig[] = [
    {
      key: 'all',
      label: '全部',
      icon: <List className="h-4 w-4" />,
      color: 'text-gray-600 border-gray-300',
      count: counts?.all,
    },
    {
      key: 'normal',
      label: '正常',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600 border-green-300',
      count: counts?.normal,
    },
    {
      key: 'exception',
      label: '异常',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-yellow-600 border-yellow-300',
      count: counts?.exception,
    },
    {
      key: 'confirmed',
      label: '已确认',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-blue-600 border-blue-300',
      count: counts?.confirmed,
    },
  ];

  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant="ghost"
            onClick={() => onStatusChange(tab.key)}
            className={cn(
              'group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none transition-all duration-200',
              {
                'border-b-2 border-teal-500 text-teal-600 bg-teal-50':
                  activeStatus === tab.key,
                'text-gray-500 hover:text-gray-700 border-b-2 border-transparent':
                  activeStatus !== tab.key,
              }
            )}
            aria-current={activeStatus === tab.key ? 'page' : undefined}
          >
            <div className="flex items-center justify-center space-x-2">
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <Badge
                  variant={activeStatus === tab.key ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {tab.count.toLocaleString()}
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </nav>
    </div>
  );
}

// Status indicator component for use in tables/cards
interface StatusIndicatorProps {
  status: StatusType;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const statusConfig = {
    all: {
      icon: <List className="h-4 w-4" />,
      label: '全部',
      variant: 'secondary' as const,
    },
    normal: {
      icon: <CheckCircle className="h-4 w-4" />,
      label: '正常',
      variant: 'success' as const,
    },
    exception: {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: '异常',
      variant: 'warning' as const,
    },
    confirmed: {
      icon: <CheckCircle className="h-4 w-4" />,
      label: '已确认',
      variant: 'default' as const,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn('inline-flex items-center', className)}
    >
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </Badge>
  );
}

// Filter component that works with status tabs
interface StatusFilterProps {
  activeStatus: StatusType;
  data: any[];
  getItemStatus: (item: any) => StatusType;
  children: (filteredData: any[]) => React.ReactNode;
}

export function StatusFilter({
  activeStatus,
  data,
  getItemStatus,
  children,
}: StatusFilterProps) {
  const filteredData =
    activeStatus === 'all'
      ? data
      : data.filter((item) => getItemStatus(item) === activeStatus);

  return <>{children(filteredData)}</>;
}

// Utility functions for status classification
export function classifyRevenueStatus(record: any): StatusType {
  // Example logic - customize based on your business rules
  if (record.exception_flag) {
    return 'exception';
  }
  if (record.confirmed) {
    return 'confirmed';
  }
  return 'normal';
}

export function classifyCostStatus(record: any): StatusType {
  // Example logic - customize based on your business rules
  if (record.category?.startsWith('[DELETED]')) {
    return 'exception';
  }
  if (record.verified) {
    return 'confirmed';
  }
  return 'normal';
}

// Hook for managing status counts
export function useStatusCounts<T>(
  data: T[],
  getItemStatus: (item: T) => StatusType
) {
  return React.useMemo(() => {
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
  }, [data, getItemStatus]);
}
