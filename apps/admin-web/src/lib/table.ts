export interface TableColumn<T> {
  key: keyof T;
  title: string;
  width?: string;
  render?: (value: unknown, record: T) => React.ReactNode;
}

export interface EditConfig<T> {
  field: keyof T;
  type: 'input' | 'select' | 'date';
  options?: Array<{ label: string; value: string | number }>;
}

export function getRowKey<T>(
  record: T,
  index: number,
  keyField: keyof T | ((record: T) => string)
): string {
  if (typeof keyField === 'function') {
    return keyField(record);
  }
  return record[keyField]?.toString() || index.toString();
}
