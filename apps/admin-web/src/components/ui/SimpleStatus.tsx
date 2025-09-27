import React from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '../../lib/utils';
import { StatusType, getStatusConfig } from '../../lib/status';

interface StatusIndicatorProps {
  status: StatusType;
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn('inline-flex items-center', className)}
    >
      <Icon className="h-4 w-4" />
      <span className="ml-1">{config.label}</span>
    </Badge>
  );
}

interface StatusTabsProps {
  activeStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
  counts: Record<StatusType, number>;
  className?: string;
}

export function StatusTabs({
  activeStatus,
  onStatusChange,
  counts,
  className,
}: StatusTabsProps) {
  const statuses: StatusType[] = ['all', 'normal', 'exception', 'confirmed'];

  return (
    <div className={cn('border-b border-gray-200', className)}>
      <nav className="flex space-x-8">
        {statuses.map((status) => {
          const config = getStatusConfig(status);
          const Icon = config.icon;
          const isActive = activeStatus === status;

          return (
            <Button
              key={status}
              variant="ghost"
              onClick={() => onStatusChange(status)}
              className={cn(
                'relative py-4 px-6 text-sm font-medium rounded-none border-b-2 transition-all duration-200',
                {
                  'border-teal-500 text-teal-600 bg-teal-50': isActive,
                  'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50':
                    !isActive,
                }
              )}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{config.label}</span>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {counts[status].toLocaleString()}
                </Badge>
              </div>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

interface StatusFilterProps<T> {
  activeStatus: StatusType;
  data: T[];
  getItemStatus: (item: T) => StatusType;
  children: (filteredData: T[]) => React.ReactNode;
}

export function StatusFilter<T>({
  activeStatus,
  data,
  getItemStatus,
  children,
}: StatusFilterProps<T>) {
  const filteredData =
    activeStatus === 'all'
      ? data
      : data.filter((item) => getItemStatus(item) === activeStatus);

  return <>{children(filteredData)}</>;
}
