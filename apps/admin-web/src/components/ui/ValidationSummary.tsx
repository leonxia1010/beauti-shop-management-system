import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
  value?: string;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  errors: ValidationError[];
  processingTime?: number;
}

interface ValidationSummaryProps {
  result: ValidationResult;
  className?: string;
}

export function ValidationSummary({
  result,
  className,
}: ValidationSummaryProps) {
  const {
    totalRows,
    validRows,
    errorRows,
    warningRows,
    errors,
    processingTime,
  } = result;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="总记录数"
          value={totalRows}
          icon={<TrendingUp className="h-5 w-5" />}
          color="blue"
        />
        <SummaryCard
          title="✅ 正常"
          value={validRows}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <SummaryCard
          title="⚠️ 异常"
          value={warningRows}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="yellow"
        />
        <SummaryCard
          title="❌ 错误"
          value={errorRows}
          icon={<XCircle className="h-5 w-5" />}
          color="red"
        />
      </div>

      {/* Processing Info */}
      {processingTime && (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          处理时间: {processingTime.toFixed(2)}ms
        </div>
      )}

      {/* Overall Status */}
      <div
        className={cn('flex items-center p-4 rounded-md', {
          'bg-green-50 border border-green-200':
            result.isValid && errorRows === 0,
          'bg-yellow-50 border border-yellow-200':
            warningRows > 0 && errorRows === 0,
          'bg-red-50 border border-red-200': errorRows > 0,
        })}
      >
        {result.isValid && errorRows === 0 ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-800">✅ 字段格式检查通过</p>
              <p className="text-sm text-green-600">
                所有数据格式正确，可以进行导入
              </p>
            </div>
          </>
        ) : errorRows > 0 ? (
          <>
            <XCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-800">
                ❌ 发现 {errorRows} 条错误数据
              </p>
              <p className="text-sm text-red-600">请修正错误后重新上传</p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">
                ⚠️ 发现 {warningRows} 条异常数据需要确认
              </p>
              <p className="text-sm text-yellow-600">建议检查后再导入</p>
            </div>
          </>
        )}
      </div>

      {/* Error Details */}
      {errors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">详细错误信息</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {errors.map((error, index) => (
              <ErrorItem key={index} error={error} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={cn('border rounded-md p-4', colorClasses[color])}>
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

interface ErrorItemProps {
  error: ValidationError;
}

function ErrorItem({ error }: ErrorItemProps) {
  return (
    <div
      className={cn('flex items-start p-3 rounded-md text-sm', {
        'bg-red-50 border border-red-200': error.severity === 'error',
        'bg-yellow-50 border border-yellow-200': error.severity === 'warning',
      })}
    >
      <div className="flex-shrink-0 mt-0.5">
        {error.severity === 'error' ? (
          <XCircle className="h-4 w-4 text-red-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        )}
      </div>
      <div className="ml-3">
        <p
          className={cn('font-medium', {
            'text-red-800': error.severity === 'error',
            'text-yellow-800': error.severity === 'warning',
          })}
        >
          第 {error.row} 行，{error.field} 字段
        </p>
        <p
          className={cn('mt-1', {
            'text-red-600': error.severity === 'error',
            'text-yellow-600': error.severity === 'warning',
          })}
        >
          {error.message}
        </p>
        {error.value && (
          <p className="mt-1 text-xs text-gray-500">当前值: "{error.value}"</p>
        )}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({
  label,
  current,
  total,
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900 font-medium">
          {current}/{total} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-teal-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
