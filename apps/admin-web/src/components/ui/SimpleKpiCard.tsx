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
  teal: 'from-emerald-400/10 via-teal-400/5 to-cyan-400/10 text-teal-700 border-teal-200/30',
  amber:
    'from-orange-400/10 via-amber-400/5 to-yellow-400/10 text-amber-700 border-amber-200/30',
  red: 'from-rose-400/10 via-pink-400/5 to-red-400/10 text-red-700 border-red-200/30',
  blue: 'from-blue-400/10 via-indigo-400/5 to-purple-400/10 text-blue-700 border-blue-200/30',
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
