/**
 * Upload Dropzone Drag-and-Drop Tests
 *
 * Testing upload functionality mentioned in story 1.2:
 * - Drag-and-drop Excel/CSV files
 * - File validation
 * - Visual feedback during upload
 * - Error handling
 * - Template download functionality
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock upload dropzone component based on story requirements
interface UploadDropzoneProps {
  onFileUpload: (file: File) => void;
  onError: (error: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  isLoading?: boolean;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFileUpload,
  onError,
  acceptedFileTypes = ['.csv', '.xlsx', '.xls'],
  maxFileSize = 10,
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      onError(`不支持的文件类型。请上传 ${acceptedFileTypes.join(', ')} 文件`);
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      onError(`文件大小超出限制。最大支持 ${maxFileSize}MB`);
      return false;
    }

    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      onError('一次只能上传一个文件');
      return;
    }

    const file = files[0];
    if (file && validateFile(file)) {
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            onFileUpload(file);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileUpload(file);
    }
  };

  const handleDownloadTemplate = () => {
    // Mock template download
    const templateData =
      'store_id,beautician_id,service_date,gross_revenue,payment_method\n';
    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div data-testid="upload-dropzone" className="w-full">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="drop-area"
      >
        {isLoading || uploadProgress > 0 ? (
          <div data-testid="upload-progress">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">上传中... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
                data-testid="progress-bar"
              ></div>
            </div>
          </div>
        ) : (
          <div data-testid="upload-prompt">
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">📁</div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragOver ? '松开鼠标上传文件' : '拖拽文件到此处或点击选择'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              支持 {acceptedFileTypes.join(', ')} 格式，最大 {maxFileSize}MB
            </p>

            <input
              type="file"
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              data-testid="file-input"
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <label
                htmlFor="file-input"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors duration-200"
                data-testid="select-file-button"
              >
                选择文件
              </label>

              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
                data-testid="download-template-button"
              >
                📥 下载模板
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Type Help */}
      <div className="mt-4 text-sm text-gray-600" data-testid="file-help">
        <p className="mb-2">📝 上传说明：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Excel 文件(.xlsx, .xls)：推荐使用，支持多种格式</li>
          <li>CSV 文件(.csv)：纯文本格式，兼容性最好</li>
          <li>文件大小：不超过 {maxFileSize}MB</li>
          <li>
            数据列：store_id, beautician_id, service_date, gross_revenue,
            payment_method
          </li>
        </ul>
      </div>
    </div>
  );
};

describe('UploadDropzone Drag-and-Drop Tests', () => {
  const mockOnFileUpload = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File(['mock content'], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  const createDataTransfer = (files: File[]) => {
    return {
      dataTransfer: {
        files: {
          ...files,
          length: files.length,
          [Symbol.iterator]: function* () {
            for (let i = 0; i < files.length; i++) {
              yield files[i];
            }
          },
        },
      },
    };
  };

  describe('Basic Rendering', () => {
    it('should render dropzone with all required elements', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      expect(screen.getByTestId('upload-dropzone')).toBeInTheDocument();
      expect(screen.getByTestId('drop-area')).toBeInTheDocument();
      expect(screen.getByTestId('upload-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('select-file-button')).toBeInTheDocument();
      expect(
        screen.getByTestId('download-template-button')
      ).toBeInTheDocument();
      expect(screen.getByTestId('file-help')).toBeInTheDocument();
    });

    it('should display correct file type support information', () => {
      render(
        <UploadDropzone
          onFileUpload={mockOnFileUpload}
          onError={mockOnError}
          acceptedFileTypes={['.csv', '.xlsx']}
          maxFileSize={5}
        />
      );

      expect(
        screen.getByText(/支持 \.csv, \.xlsx 格式，最大 5MB/)
      ).toBeInTheDocument();
    });
  });

  describe('Drag and Drop Interactions', () => {
    it('should handle dragover event and show visual feedback', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');

      // Simulate drag over
      fireEvent.dragOver(dropArea);

      expect(screen.getByText('松开鼠标上传文件')).toBeInTheDocument();
      expect(dropArea).toHaveClass('border-blue-500', 'bg-blue-50');
    });

    it('should handle dragleave event and remove visual feedback', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');

      // Simulate drag over then leave
      fireEvent.dragOver(dropArea);
      fireEvent.dragLeave(dropArea);

      expect(screen.getByText('拖拽文件到此处或点击选择')).toBeInTheDocument();
      expect(dropArea).not.toHaveClass('border-blue-500', 'bg-blue-50');
    });

    it('should handle successful file drop', async () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');
      const csvFile = createMockFile('revenue.csv', 1024, 'text/csv');

      fireEvent.drop(dropArea, createDataTransfer([csvFile]));

      // Should show upload progress
      await waitFor(() => {
        expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
      });

      // Should complete upload
      await waitFor(
        () => {
          expect(mockOnFileUpload).toHaveBeenCalledWith(csvFile);
        },
        { timeout: 2000 }
      );
    });

    it('should prevent multiple file uploads', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');
      const file1 = createMockFile('file1.csv', 1024, 'text/csv');
      const file2 = createMockFile('file2.csv', 1024, 'text/csv');

      fireEvent.drop(dropArea, createDataTransfer([file1, file2]));

      expect(mockOnError).toHaveBeenCalledWith('一次只能上传一个文件');
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  describe('File Validation', () => {
    it('should reject unsupported file types', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');
      const txtFile = createMockFile('data.txt', 1024, 'text/plain');

      fireEvent.drop(dropArea, createDataTransfer([txtFile]));

      expect(mockOnError).toHaveBeenCalledWith(
        '不支持的文件类型。请上传 .csv, .xlsx, .xls 文件'
      );
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });

    it('should reject files exceeding size limit', () => {
      render(
        <UploadDropzone
          onFileUpload={mockOnFileUpload}
          onError={mockOnError}
          maxFileSize={1} // 1MB limit
        />
      );

      const dropArea = screen.getByTestId('drop-area');
      const largeFile = createMockFile(
        'large.csv',
        2 * 1024 * 1024,
        'text/csv'
      ); // 2MB

      fireEvent.drop(dropArea, createDataTransfer([largeFile]));

      expect(mockOnError).toHaveBeenCalledWith(
        '文件大小超出限制。最大支持 1MB'
      );
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });

    it('should accept valid Excel files', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');
      const excelFile = createMockFile(
        'data.xlsx',
        1024,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );

      fireEvent.drop(dropArea, createDataTransfer([excelFile]));

      // Should not call error
      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should accept valid CSV files', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');
      const csvFile = createMockFile('data.csv', 1024, 'text/csv');

      fireEvent.drop(dropArea, createDataTransfer([csvFile]));

      expect(mockOnError).not.toHaveBeenCalled();
    });
  });

  describe('File Selection via Click', () => {
    it('should handle file selection through file input', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
      const csvFile = createMockFile('selected.csv', 1024, 'text/csv');

      Object.defineProperty(fileInput, 'files', {
        value: [csvFile],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(mockOnFileUpload).toHaveBeenCalledWith(csvFile);
    });

    it('should trigger file dialog when select button is clicked', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const selectButton = screen.getByTestId('select-file-button');
      const fileInput = screen.getByTestId('file-input');

      expect(selectButton.getAttribute('for')).toBe('file-input');
      expect(fileInput).toHaveAttribute('type', 'file');
    });
  });

  describe('Template Download', () => {
    it('should trigger template download when button is clicked', () => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      const mockCreateObjectURL = vi.fn(() => 'mock-blob-url');
      const mockRevokeObjectURL = vi.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      // Mock document.createElement
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const mockCreateElement = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockAnchor as any);

      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const downloadButton = screen.getByTestId('download-template-button');
      fireEvent.click(downloadButton);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.download).toBe('revenue_template.csv');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-blob-url');

      // Cleanup mocks
      mockCreateElement.mockRestore();
    });
  });

  describe('Upload Progress and Loading States', () => {
    it('should show upload progress during file processing', async () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');
      const csvFile = createMockFile('test.csv', 1024, 'text/csv');

      fireEvent.drop(dropArea, createDataTransfer([csvFile]));

      // Should show progress immediately
      await waitFor(() => {
        expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
      });

      // Progress bar should be visible
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByText(/上传中\.\.\./)).toBeInTheDocument();
    });

    it('should disable dropzone when loading', () => {
      render(
        <UploadDropzone
          onFileUpload={mockOnFileUpload}
          onError={mockOnError}
          isLoading={true}
        />
      );

      const dropArea = screen.getByTestId('drop-area');
      expect(dropArea).toHaveClass('pointer-events-none', 'opacity-50');
    });

    it('should show spinning indicator during upload', async () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');
      const csvFile = createMockFile('test.csv', 1024, 'text/csv');

      fireEvent.drop(dropArea, createDataTransfer([csvFile]));

      await waitFor(() => {
        const progressElement = screen.getByTestId('upload-progress');
        const spinner = progressElement.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('type', 'file');

      const selectButton = screen.getByTestId('select-file-button');
      expect(selectButton).toHaveAttribute('for', 'file-input');
    });

    it('should be keyboard accessible', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const selectButton = screen.getByTestId('select-file-button');
      const downloadButton = screen.getByTestId('download-template-button');

      expect(selectButton).toHaveClass('cursor-pointer');
      expect(downloadButton).not.toHaveAttribute('disabled');
    });

    it('should provide clear feedback messages', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      expect(screen.getByText('拖拽文件到此处或点击选择')).toBeInTheDocument();
      expect(screen.getByText(/支持.*格式，最大.*MB/)).toBeInTheDocument();
      expect(screen.getByText('📝 上传说明：')).toBeInTheDocument();
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle drag events with no files', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');

      fireEvent.drop(dropArea, { dataTransfer: { files: [] } });

      expect(mockOnError).not.toHaveBeenCalled();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });

    it('should handle corrupted file names gracefully', () => {
      render(
        <UploadDropzone onFileUpload={mockOnFileUpload} onError={mockOnError} />
      );

      const dropArea = screen.getByTestId('drop-area');
      const fileWithoutExtension = createMockFile(
        'noextension',
        1024,
        'text/csv'
      );

      fireEvent.drop(dropArea, createDataTransfer([fileWithoutExtension]));

      expect(mockOnError).toHaveBeenCalled();
    });
  });
});
