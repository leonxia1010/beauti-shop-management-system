import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from './card';
import { cn } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'teal' | 'amber' | 'red' | 'blue';
  className?: string;
}

const COLOR_SCHEMES = {
  teal: 'from-emerald-50 via-white to-emerald-100/40 text-teal-600',
  amber: 'from-amber-50 via-white to-amber-100/40 text-yellow-600',
  red: 'from-red-50 via-white to-red-100/40 text-red-600',
  blue: 'from-blue-50 via-white to-blue-100/40 text-blue-600',
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'teal',
  className,
}: KPICardProps) {
  return (
    <Card
      className={cn(
        '@container/card bg-gradient-to-br border shadow-xs transition-all duration-200 hover:shadow-md',
        COLOR_SCHEMES[colorScheme],
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-5 w-5" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function KPIDashboard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}
