export interface BulkImportError {
  row: number;
  error: string;
  data: unknown;
}

export interface BulkImportResponseDto {
  total: number;
  successful: number;
  failed: number;
  errors: BulkImportError[];
}

export interface ValidationResultDto {
  isValid: boolean;
  exceptions: string[];
}
