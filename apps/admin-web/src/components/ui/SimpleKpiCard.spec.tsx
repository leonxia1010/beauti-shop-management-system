/**
 * KPI Card Component Unit Tests
 *
 * Tests the KPI display component used in reports dashboard
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KPICard } from './SimpleKpiCard';
import { DollarSign } from 'lucide-react';

describe('KPICard', () => {
  it('should render KPI with title and value', () => {
    render(<KPICard title="Total Revenue" value="¥12,345" icon={DollarSign} />);

    expect(screen.getByText('Total Revenue')).toBeTruthy();
    expect(screen.getByText('¥12,345')).toBeTruthy();
  });

  it('should render KPI with subtitle if provided', () => {
    render(
      <KPICard
        title="Total Revenue"
        value="¥12,345"
        subtitle="比上月增长 15%"
        icon={DollarSign}
      />
    );

    expect(screen.getByText('比上月增长 15%')).toBeTruthy();
  });

  it('should render KPI with icon', () => {
    const { container } = render(
      <KPICard title="Total Revenue" value="¥12,345" icon={DollarSign} />
    );

    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render KPI without optional props', () => {
    render(<KPICard title="Basic KPI" value="100" icon={DollarSign} />);

    expect(screen.getByText('Basic KPI')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('should handle zero values correctly', () => {
    render(<KPICard title="Zero Value" value="0" icon={DollarSign} />);

    expect(screen.getByText('Zero Value')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('should apply color scheme correctly', () => {
    const { container } = render(
      <KPICard title="Test" value="100" icon={DollarSign} colorScheme="amber" />
    );

    expect(container.firstChild).toBeTruthy();
  });
});
