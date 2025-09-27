import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Checkbox } from './checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { TableColumn, getRowKey } from '../../lib/table';

interface SimpleTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (rowKey: string, checked: boolean) => void;
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  className?: string;
}

export function SimpleTable<T extends Record<string, unknown>>({
  data,
  columns,
  selectable = false,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
  rowKey = 'id' as keyof T,
  loading = false,
  className,
}: SimpleTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        <span className="ml-2 text-gray-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRows.size === data.length && data.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                style={{ width: column.width }}
              >
                {column.title}
              </TableHead>
            ))}
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record, index) => {
            const key = getRowKey(record, index, rowKey);
            return (
              <TableRow key={key}>
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(key)}
                      onCheckedChange={(checked) =>
                        onSelectRow?.(key, checked as boolean)
                      }
                    />
                  </TableCell>
                )}
                {columns.map((column) => {
                  const value = record[column.key];
                  return (
                    <TableCell
                      key={String(column.key)}
                      className="whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(value, record)
                        : String(value || '')}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无数据</p>
        </div>
      )}
    </div>
  );
}
