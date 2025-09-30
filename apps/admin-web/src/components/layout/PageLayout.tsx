import React from 'react';
import { cn } from '../../lib/utils';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageLayout({
  title,
  subtitle,
  children,
  actions,
  className,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-3">{actions}</div>}
        </div>
        <div className={cn(className)}>{children}</div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
