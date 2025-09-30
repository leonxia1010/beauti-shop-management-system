import { useState } from 'react';
import { getRowKey } from '../lib/table';

export function useTableSelection<T>(
  data: T[],
  rowKeyField: keyof T | ((record: T) => string) = 'id' as keyof T
) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = new Set(
        data.map((record, index) => getRowKey(record, index, rowKeyField))
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

  const clearSelection = () => {
    setSelectedRows(new Set());
  };

  return {
    selectedRows,
    handleSelectAll,
    handleSelectRow,
    clearSelection,
    selectedCount: selectedRows.size,
    selectedKeys: Array.from(selectedRows),
  };
}
