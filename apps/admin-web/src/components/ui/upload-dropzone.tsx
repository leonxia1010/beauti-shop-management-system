import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, FileSpreadsheet, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface UploadDropzoneProps {
  onFileSelect: (files: File[]) => void;
  onTemplateDownload?: () => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  className?: string;
}

export function UploadDropzone({
  onFileSelect,
  onTemplateDownload,
  acceptedTypes = ['.xlsx', '.csv'],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileSelect(acceptedFiles);
    },
    [onFileSelect]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
    open,
  } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'text/csv': ['.csv'],
    },
    maxSize,
    multiple,
    noClick: true,
  });

  const hasErrors = fileRejections.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
          {
            'border-teal-300 bg-teal-50 text-teal-700':
              isDragActive && !isDragReject,
            'border-red-300 bg-red-50 text-red-700': isDragReject || hasErrors,
            'border-gray-300': !isDragActive && !hasErrors,
          }
        )}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="flex justify-center">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-current opacity-60" />
            ) : (
              <FileSpreadsheet className="h-12 w-12 text-gray-400" />
            )}
          </div>

          <div>
            {isDragActive ? (
              <p className="text-lg font-medium">松开鼠标上传文件</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  拖拽文件到此处，或点击选择文件
                </p>
                <p className="text-sm text-gray-500">
                  支持 Excel (.xlsx) 和 CSV (.csv) 格式，最大 10MB
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              选择文件
            </Button>

            {onTemplateDownload && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onTemplateDownload();
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                下载模板
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {hasErrors && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }, index) => (
            <div
              key={index}
              className="text-sm text-red-600 bg-red-50 p-3 rounded-md"
            >
              <p className="font-medium">文件 "{file.name}" 上传失败:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {errors.map((error) => (
                  <li key={error.code}>
                    {error.code === 'file-too-large' &&
                      '文件大小超过限制 (10MB)'}
                    {error.code === 'file-invalid-type' &&
                      '文件格式不支持，请上传 .xlsx 或 .csv 文件'}
                    {!['file-too-large', 'file-invalid-type'].includes(
                      error.code
                    ) && error.message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface FilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
}

export function FilePreview({ files, onRemove, className }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium text-gray-900">已选择文件:</h4>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="text-gray-400 hover:text-gray-600 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
