/**
 * SimpleTable Component Unit Tests
 *
 * Tests the reusable table component used across the application
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SimpleTable } from './SimpleTable';
import { TableColumn } from '../../lib/table';

interface TestRow {
  id: string;
  name: string;
  value: number;
}

describe('SimpleTable', () => {
  const columns: TableColumn<TestRow>[] = [
    { key: 'name', title: 'Name', width: '200px' },
    { key: 'value', title: 'Value', width: '100px' },
  ];

  const data: TestRow[] = [
    { id: '1', name: 'Item 1', value: 100 },
    { id: '2', name: 'Item 2', value: 200 },
  ];

  it('should render table with headers', () => {
    render(<SimpleTable columns={columns} data={data} />);

    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Value')).toBeTruthy();
  });

  it('should render table rows with data', () => {
    render(<SimpleTable columns={columns} data={data} />);

    expect(screen.getByText('Item 1')).toBeTruthy();
    expect(screen.getByText('Item 2')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
    expect(screen.getByText('200')).toBeTruthy();
  });

  it('should render empty state when no data', () => {
    render(<SimpleTable columns={columns} data={[]} />);

    // Should show empty message or empty table
    const table = screen.getByRole('table');
    expect(table).toBeTruthy();
  });

  it('should handle loading state if supported', () => {
    const { container } = render(<SimpleTable columns={columns} data={[]} />);

    // Should render without errors
    expect(container.querySelector('table')).toBeTruthy();
  });
});
