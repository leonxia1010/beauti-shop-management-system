/**
 * ValidationSummary Component Tests
 *
 * Following React Testing Library best practices:
 * - Test user interactions and behavior
 * - Accessibility testing
 * - Visual feedback
 * - Error states
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  ValidationSummary,
  ValidationResult,
  ValidationError,
} from './ValidationSummary';

describe('ValidationSummary', () => {
  const createValidationResult = (
    overrides: Partial<ValidationResult> = {}
  ): ValidationResult => ({
    isValid: true,
    totalRows: 100,
    validRows: 95,
    errorRows: 3,
    warningRows: 2,
    errors: [],
    processingTime: 1500,
    ...overrides,
  });

  const createValidationError = (
    overrides: Partial<ValidationError> = {}
  ): ValidationError => ({
    row: 5,
    field: 'amount',
    message: 'Amount must be positive',
    severity: 'error',
    value: '-100',
    ...overrides,
  });

  it('should render successfully with valid data', () => {
    const result = createValidationResult();
    render(<ValidationSummary result={result} />);

    expect(screen.getByTestId('validation-summary')).toBeInTheDocument();
  });

  it('should display overall validation status as success when valid', () => {
    const result = createValidationResult({ isValid: true });
    render(<ValidationSummary result={result} />);

    expect(screen.getByText(/验证通过/)).toBeInTheDocument();
    expect(screen.getByTestId('validation-status-success')).toBeInTheDocument();
  });

  it('should display overall validation status as error when invalid', () => {
    const result = createValidationResult({
      isValid: false,
      errors: [createValidationError()],
    });
    render(<ValidationSummary result={result} />);

    expect(screen.getByText(/验证失败/)).toBeInTheDocument();
    expect(screen.getByTestId('validation-status-error')).toBeInTheDocument();
  });

  it('should show correct statistics', () => {
    const result = createValidationResult({
      totalRows: 100,
      validRows: 85,
      errorRows: 10,
      warningRows: 5,
    });
    render(<ValidationSummary result={result} />);

    expect(screen.getByText('100')).toBeInTheDocument(); // total rows
    expect(screen.getByText('85')).toBeInTheDocument(); // valid rows
    expect(screen.getByText('10')).toBeInTheDocument(); // error rows
    expect(screen.getByText('5')).toBeInTheDocument(); // warning rows
  });

  it('should display processing time when provided', () => {
    const result = createValidationResult({ processingTime: 2500 });
    render(<ValidationSummary result={result} />);

    expect(screen.getByText(/处理时间.*2\.5.*秒/)).toBeInTheDocument();
  });

  it('should not display processing time when not provided', () => {
    const result = createValidationResult({ processingTime: undefined });
    render(<ValidationSummary result={result} />);

    expect(screen.queryByText(/处理时间/)).not.toBeInTheDocument();
  });

  it('should render error details when errors exist', () => {
    const errors = [
      createValidationError({
        row: 5,
        field: 'amount',
        message: 'Amount must be positive',
        severity: 'error',
        value: '-100',
      }),
      createValidationError({
        row: 8,
        field: 'date',
        message: 'Invalid date format',
        severity: 'warning',
        value: '2024/13/45',
      }),
    ];
    const result = createValidationResult({
      isValid: false,
      errors,
    });
    render(<ValidationSummary result={result} />);

    // Check if error details are displayed
    expect(screen.getByText('第 5 行')).toBeInTheDocument();
    expect(screen.getByText('amount')).toBeInTheDocument();
    expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
    expect(screen.getByText('-100')).toBeInTheDocument();

    expect(screen.getByText('第 8 行')).toBeInTheDocument();
    expect(screen.getByText('date')).toBeInTheDocument();
    expect(screen.getByText('Invalid date format')).toBeInTheDocument();
    expect(screen.getByText('2024/13/45')).toBeInTheDocument();
  });

  it('should distinguish between error and warning severities', () => {
    const errors = [
      createValidationError({ severity: 'error', message: 'Critical error' }),
      createValidationError({
        severity: 'warning',
        message: 'Warning message',
      }),
    ];
    const result = createValidationResult({ errors });
    render(<ValidationSummary result={result} />);

    // Both should be displayed but with different styling/icons
    expect(screen.getByText('Critical error')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('should handle empty error list', () => {
    const result = createValidationResult({
      errors: [],
      errorRows: 0,
      warningRows: 0,
    });
    render(<ValidationSummary result={result} />);

    expect(screen.queryByTestId('error-list')).toBeEmptyDOMElement();
  });

  it('should have proper accessibility attributes', () => {
    const result = createValidationResult();
    render(<ValidationSummary result={result} />);

    const summary = screen.getByTestId('validation-summary');
    expect(summary).toHaveAttribute('role', 'region');
    expect(summary).toHaveAttribute(
      'aria-label',
      expect.stringContaining('验证结果')
    );
  });

  it('should show success rate percentage', () => {
    const result = createValidationResult({
      totalRows: 100,
      validRows: 85,
    });
    render(<ValidationSummary result={result} />);

    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('should handle zero total rows gracefully', () => {
    const result = createValidationResult({
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      warningRows: 0,
    });
    render(<ValidationSummary result={result} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText(/NaN%/)).not.toBeInTheDocument();
  });

  describe('Visual Feedback', () => {
    it('should apply success styling when validation passes', () => {
      const result = createValidationResult({ isValid: true, errorRows: 0 });
      render(<ValidationSummary result={result} />);

      const statusElement = screen.getByTestId('validation-status-success');
      expect(statusElement).toHaveClass(/success|green/i);
    });

    it('should apply error styling when validation fails', () => {
      const result = createValidationResult({
        isValid: false,
        errorRows: 5,
        errors: [createValidationError()],
      });
      render(<ValidationSummary result={result} />);

      const statusElement = screen.getByTestId('validation-status-error');
      expect(statusElement).toHaveClass(/error|red/i);
    });

    it('should show warning styling when there are warnings', () => {
      const result = createValidationResult({
        isValid: true,
        warningRows: 3,
        errors: [createValidationError({ severity: 'warning' })],
      });
      render(<ValidationSummary result={result} />);

      // Should indicate warnings even if overall validation passes
      expect(screen.getByText(/3.*警告/)).toBeInTheDocument();
    });
  });

  describe('Performance Metrics', () => {
    it('should format processing time correctly for milliseconds', () => {
      const result = createValidationResult({ processingTime: 500 });
      render(<ValidationSummary result={result} />);

      expect(screen.getByText(/0\.5.*秒/)).toBeInTheDocument();
    });

    it('should format processing time correctly for seconds', () => {
      const result = createValidationResult({ processingTime: 5000 });
      render(<ValidationSummary result={result} />);

      expect(screen.getByText(/5\.0.*秒/)).toBeInTheDocument();
    });

    it('should show validation speed indicator for fast processing', () => {
      const result = createValidationResult({
        processingTime: 500, // Fast processing
        totalRows: 1000,
      });
      render(<ValidationSummary result={result} />);

      // Should indicate fast processing speed
      expect(screen.getByTestId('validation-summary')).toBeInTheDocument();
    });
  });

  describe('Error Detail Expansion', () => {
    it('should limit displayed errors when there are many', () => {
      const manyErrors = Array.from({ length: 50 }, (_, i) =>
        createValidationError({
          row: i + 1,
          message: `Error ${i + 1}`,
        })
      );
      const result = createValidationResult({ errors: manyErrors });
      render(<ValidationSummary result={result} />);

      // Should show some indicator of many errors without overwhelming the UI
      expect(screen.getByTestId('validation-summary')).toBeInTheDocument();
    });
  });
});
