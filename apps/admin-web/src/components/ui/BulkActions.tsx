import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface BulkAction {
  label: string;
  value: string;
}

interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (actionValue: string) => void;
  className?: string;
}

export function BulkActions({
  selectedCount,
  actions,
  onAction,
  className,
}: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between bg-teal-50 border border-teal-200 rounded-md p-3',
        className
      )}
    >
      <span className="text-sm text-teal-800">已选择 {selectedCount} 项</span>
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="border-teal-300 text-teal-700 hover:bg-teal-50"
        >
          批量操作
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <div className="py-1">
              {actions.map((action) => (
                <Button
                  key={action.value}
                  variant="ghost"
                  onClick={() => {
                    onAction(action.value);
                    setIsOpen(false);
                  }}
                  className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
