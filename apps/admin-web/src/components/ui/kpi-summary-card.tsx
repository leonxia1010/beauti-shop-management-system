import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Banknote,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './card';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

export interface KPIData {
  title: string;
  value: string | number;
  change?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
  };
  subtitle?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface KPISummaryCardProps {
  data: KPIData;
  className?: string;
}

export function KPISummaryCard({ data, className }: KPISummaryCardProps) {
  const { title, value, change, subtitle, status = 'info' } = data;

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Banknote className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Card
      className={cn('transition-all duration-200 hover:shadow-md', className)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {getIcon()}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center space-x-2 mt-4">
            <Badge
              variant={
                change.trend === 'up'
                  ? 'success'
                  : change.trend === 'down'
                  ? 'destructive'
                  : 'secondary'
              }
              className="flex items-center space-x-1"
            >
              {change.trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {change.trend === 'down' && <TrendingDown className="h-3 w-3" />}
              <span>
                {change.trend === 'up'
                  ? '↑'
                  : change.trend === 'down'
                  ? '↓'
                  : '→'}
                {Math.abs(change.percentage)}%
              </span>
            </Badge>
            <span className="text-xs text-muted-foreground">
              {change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}
              {typeof change.value === 'number'
                ? change.value.toLocaleString()
                : change.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface KPIDashboardProps {
  className?: string;
  children: React.ReactNode;
}

export function KPIDashboard({ className, children }: KPIDashboardProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}

// Pre-configured KPI card types
interface RevenueKPIProps {
  netRevenue: number;
  previousNetRevenue?: number;
  className?: string;
}

export function NetRevenueCard({
  netRevenue,
  previousNetRevenue,
  className,
}: RevenueKPIProps) {
  const change = previousNetRevenue
    ? {
        value: netRevenue - previousNetRevenue,
        percentage: Math.round(
          ((netRevenue - previousNetRevenue) / previousNetRevenue) * 100
        ),
        trend:
          netRevenue > previousNetRevenue
            ? ('up' as const)
            : netRevenue < previousNetRevenue
            ? ('down' as const)
            : ('neutral' as const),
      }
    : undefined;

  return (
    <KPISummaryCard
      data={{
        title: '今日净收入',
        value: `¥${netRevenue.toFixed(2)}`,
        change,
        status: 'success',
      }}
      className={className}
    />
  );
}

interface CashHandoverKPIProps {
  pendingCash: number;
  batchCount: number;
  className?: string;
}

export function CashHandoverCard({
  pendingCash,
  batchCount,
  className,
}: CashHandoverKPIProps) {
  return (
    <KPISummaryCard
      data={{
        title: '未交接现金',
        value: `¥${pendingCash.toFixed(2)}`,
        subtitle: `${batchCount} 个批次`,
        status: pendingCash > 0 ? 'warning' : 'success',
      }}
      className={className}
    />
  );
}

interface ExceptionKPIProps {
  exceptionCount: number;
  className?: string;
}

export function ExceptionCard({
  exceptionCount,
  className,
}: ExceptionKPIProps) {
  return (
    <KPISummaryCard
      data={{
        title: '异常待处理',
        value: `${exceptionCount}`,
        subtitle: exceptionCount > 0 ? '需要处理' : '无异常',
        status: exceptionCount > 0 ? 'error' : 'success',
      }}
      className={className}
    />
  );
}

interface BeauticianKPIProps {
  beauticianCount: number;
  activeCount: number;
  className?: string;
}

export function BeauticianCard({
  beauticianCount,
  activeCount,
  className,
}: BeauticianKPIProps) {
  return (
    <KPISummaryCard
      data={{
        title: '美容师',
        value: activeCount,
        subtitle: `共 ${beauticianCount} 人`,
        status: 'info',
      }}
      className={className}
    />
  );
}
