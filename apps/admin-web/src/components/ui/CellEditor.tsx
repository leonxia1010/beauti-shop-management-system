import React, { useState } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { DatePicker } from './DatePicker';
import { EditConfig } from '../../lib/table';

interface CellEditorProps<T> {
  value: unknown;
  record: T;
  config: EditConfig<T>;
  onSave: (record: T, field: keyof T, newValue: unknown) => void;
  onCancel: () => void;
}

export function CellEditor<T>({
  value,
  record,
  config,
  onSave,
  onCancel,
}: CellEditorProps<T>) {
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(record, config.field, editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {config.type === 'select' ? (
        <Select value={String(editValue)} onValueChange={setEditValue}>
          <SelectTrigger className="w-full h-8">
            <SelectValue placeholder="请选择..." />
          </SelectTrigger>
          <SelectContent>
            {config.options?.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : config.type === 'date' ? (
        <DatePicker
          value={editValue ? new Date(String(editValue)) : undefined}
          onChange={(date) =>
            setEditValue(date ? date.toISOString().split('T')[0] : '')
          }
          className="w-full h-8"
        />
      ) : (
        <Input
          type="text"
          value={String(editValue)}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 text-sm"
          autoFocus
          onKeyDown={handleKeyDown}
        />
      )}
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="h-8 w-8 text-green-600 hover:text-green-800"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8 text-red-600 hover:text-red-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface EditableCellProps<T> {
  value: unknown;
  record: T;
  config?: EditConfig<T>;
  onEdit?: (record: T, field: keyof T, newValue: unknown) => void;
  render?: (value: unknown, record: T) => React.ReactNode;
}

export function EditableCell<T>({
  value,
  record,
  config,
  onEdit,
  render,
}: EditableCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (record: T, field: keyof T, newValue: any) => {
    onEdit?.(record, field, newValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing && config) {
    return (
      <CellEditor
        value={value}
        record={record}
        config={config}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="flex items-center">
      <div className="flex-1">
        {render ? render(value, record) : String(value || '')}
      </div>
      {config && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          className="ml-2 h-6 w-6 text-gray-400 hover:text-gray-600"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
