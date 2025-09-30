import React, { useState } from 'react';
import { DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Stepper,
  StepperForm,
  StepContent,
} from '../../components/ui/StepperForm';
import {
  UploadDropzone,
  FilePreview,
} from '../../components/ui/UploadDropzone';
import {
  ValidationSummary,
  ProgressBar,
  ValidationResult,
} from '../../components/ui/ValidationSummary';
import { KPICard, KPIDashboard } from '../../components/ui/SimpleKpiCard';

interface ImportRecord {
  id: string;
  store_id: string;
  beautician_id: string;
  service_date: string;
  gross_revenue: number;
  payment_method: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export function BulkImportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<{
    total: number;
    successful: number;
    failed: number;
    records: ImportRecord[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, title: '上传', description: '选择文件' },
    { id: 2, title: '预览', description: '验证数据' },
    { id: 3, title: '结果', description: '导入完成' },
  ];

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTemplateDownload = () => {
    // Create CSV template
    const headers = [
      'store_id',
      'beautician_id',
      'service_date',
      'gross_revenue',
      'payment_method',
    ];
    const sampleData = [
      'store-001,beautician-001,2024-01-15,150.00,cash',
      'store-001,beautician-002,2024-01-15,280.50,transfer',
    ];

    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'revenue_import_template.csv';
    link.click();
  };

  const handleNextStep = async () => {
    if (currentStep === 1 && selectedFiles.length > 0) {
      // Validate files
      setIsProcessing(true);
      try {
        // Simulate validation API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock validation result
        setValidationResult({
          isValid: true,
          totalRows: 150,
          validRows: 145,
          errorRows: 2,
          warningRows: 3,
          processingTime: 1847,
          errors: [
            {
              row: 15,
              field: 'gross_revenue',
              message: '金额为负数，请检查数据',
              severity: 'error',
              value: '-50.00',
            },
            {
              row: 23,
              field: 'service_date',
              message: '日期格式不正确',
              severity: 'error',
              value: '2024/13/45',
            },
            {
              row: 45,
              field: 'gross_revenue',
              message: '金额异常高，请确认',
              severity: 'warning',
              value: '5000.00',
            },
          ],
        });

        setCurrentStep(2);
      } finally {
        setIsProcessing(false);
      }
    } else if (currentStep === 2 && validationResult?.isValid) {
      // Process import
      setIsProcessing(true);
      try {
        // Simulate import API call
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Mock import result
        setImportResult({
          total: 150,
          successful: 145,
          failed: 5,
          records: [], // Would contain actual imported records
        });

        setCurrentStep(3);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setSelectedFiles([]);
    setValidationResult(null);
    setImportResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            批量导入收入数据
          </h1>
          <p className="text-gray-600">
            支持 Excel 和 CSV 格式文件，一键导入日常收入记录
          </p>
        </div>

        <StepperForm>
          <Stepper currentStep={currentStep} steps={steps} className="mb-8" />

          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <StepContent>
              <div className="space-y-6">
                <UploadDropzone
                  onFileSelect={handleFileSelect}
                  onTemplateDownload={handleTemplateDownload}
                />

                <FilePreview
                  files={selectedFiles}
                  onRemove={handleRemoveFile}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    onClick={handleNextStep}
                    disabled={selectedFiles.length === 0 || isProcessing}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isProcessing ? '验证中...' : '下一步：预览数据'}
                  </Button>
                </div>
              </div>
            </StepContent>
          )}

          {/* Step 2: Validation */}
          {currentStep === 2 && (
            <StepContent>
              <div className="space-y-6">
                {isProcessing ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                      <span className="text-lg text-gray-600">
                        正在验证数据...
                      </span>
                    </div>
                    <ProgressBar
                      label="验证进度"
                      current={75}
                      total={100}
                      className="mt-4 max-w-md mx-auto"
                    />
                  </div>
                ) : validationResult ? (
                  <>
                    <ValidationSummary result={validationResult} />

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handlePrevStep}>
                        上一步
                      </Button>
                      <Button
                        onClick={handleNextStep}
                        disabled={validationResult.errorRows > 0}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        {validationResult.errorRows > 0
                          ? '请修正错误'
                          : '开始导入'}
                      </Button>
                    </div>
                  </>
                ) : null}
              </div>
            </StepContent>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && (
            <StepContent>
              <div className="space-y-6">
                {isProcessing ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                      <span className="text-lg text-gray-600">
                        正在导入数据...
                      </span>
                    </div>
                    <ProgressBar
                      label="导入进度"
                      current={85}
                      total={100}
                      className="mt-4 max-w-md mx-auto"
                    />
                  </div>
                ) : importResult ? (
                  <>
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        导入完成
                      </h2>
                      <p className="text-gray-600 mb-6">
                        成功导入 {importResult.successful} 条记录，
                        {importResult.failed > 0 &&
                          `${importResult.failed} 条记录导入失败`}
                      </p>
                    </div>

                    <KPIDashboard>
                      <KPICard
                        title="净收入增加"
                        value={`¥${(21450.75).toFixed(2)}`}
                        icon={DollarSign}
                        colorScheme="teal"
                      />
                      <KPICard
                        title="导入失败"
                        value={importResult.failed.toString()}
                        subtitle={
                          importResult.failed > 0 ? '需要处理' : '无异常'
                        }
                        icon={AlertTriangle}
                        colorScheme="red"
                      />
                    </KPIDashboard>

                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" onClick={handleStartOver}>
                        重新导入
                      </Button>
                      <Button
                        onClick={() => (window.location.href = '/revenue')}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        查看收入记录
                      </Button>
                    </div>
                  </>
                ) : null}
              </div>
            </StepContent>
          )}
        </StepperForm>
      </div>
    </div>
  );
}
