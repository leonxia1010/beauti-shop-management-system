import React, { useState } from 'react';
import { Edit2, Check, X, ChevronDown, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';
import { Checkbox } from './checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { DatePicker } from './date-picker';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  editable?: boolean;
  editType?: 'input' | 'select' | 'date';
  editOptions?: Array<{ label: string; value: any }>;
  sortable?: boolean;
}

export interface EditableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (record: T, field: keyof T, newValue: any) => Promise<void> | void;
  onBulkAction?: (selectedIds: string[], action: string) => void;
  rowKey?: keyof T | ((record: T) => string);
  selectable?: boolean;
  className?: string;
  loading?: boolean;
}

export function EditableTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onBulkAction,
  rowKey = 'id' as keyof T,
  selectable = false,
  className,
  loading = false,
}: EditableTableProps<T>) {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    field: keyof T;
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editValue, setEditValue] = useState<any>('');
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey]?.toString() || index.toString();
  };

  const handleStartEdit = (
    rowIndex: number,
    field: keyof T,
    currentValue: any
  ) => {
    setEditingCell({ rowIndex, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!editingCell || !onEdit) return;

    const record = data[editingCell.rowIndex];
    try {
      await onEdit(record, editingCell.field, editValue);
      setEditingCell(null);
      setEditValue('');
    } catch (error) {
      console.error('Edit failed:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = new Set(
        data.map((record, index) => getRowKey(record, index))
      );
      setSelectedRows(allKeys);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowKey: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowKey);
    } else {
      newSelected.delete(rowKey);
    }
    setSelectedRows(newSelected);
  };

  const bulkActions = [
    { label: '批量确认', value: 'confirm' },
    { label: '批量删除', value: 'delete' },
    { label: '导出选中', value: 'export' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-2 text-gray-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bulk Actions */}
      {selectable && selectedRows.size > 0 && (
        <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-md p-3">
          <span className="text-sm text-teal-800">
            已选择 {selectedRows.size} 项
          </span>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
              className="border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              批量操作
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
            {bulkMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {bulkActions.map((action) => (
                    <Button
                      key={action.value}
                      variant="ghost"
                      onClick={() => {
                        onBulkAction?.(Array.from(selectedRows), action.value);
                        setBulkMenuOpen(false);
                        setSelectedRows(new Set());
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
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedRows.size === data.length && data.length > 0
                    }
                    onCheckedChange={handleSelectAll}
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
            {data.map((record, rowIndex) => {
              const key = getRowKey(record, rowIndex);
              return (
                <TableRow key={key}>
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(key)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(key, checked as boolean)
                        }
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const field = column.key as keyof T;
                    const value = record[field];
                    const isEditing =
                      editingCell?.rowIndex === rowIndex &&
                      editingCell?.field === field;

                    return (
                      <TableCell
                        key={String(column.key)}
                        className="whitespace-nowrap"
                      >
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            {column.editType === 'select' ? (
                              <Select
                                value={editValue}
                                onValueChange={setEditValue}
                              >
                                <SelectTrigger className="w-full h-8">
                                  <SelectValue placeholder="请选择..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {column.editOptions?.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : column.editType === 'date' ? (
                              <DatePicker
                                value={
                                  editValue ? new Date(editValue) : undefined
                                }
                                onChange={(date) =>
                                  setEditValue(
                                    date ? date.toISOString().split('T')[0] : ''
                                  )
                                }
                                className="w-full h-8"
                              />
                            ) : (
                              <Input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                            )}
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSaveEdit}
                                className="h-8 w-8 text-green-600 hover:text-green-800"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="flex-1">
                              {column.render
                                ? column.render(value, record, rowIndex)
                                : String(value || '')}
                            </div>
                            {column.editable && onEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleStartEdit(rowIndex, field, value)
                                }
                                className="ml-2 h-6 w-6 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
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
    </div>
  );
}
