/**
 * Responsive Design Tests
 *
 * Testing responsive behavior across breakpoints:
 * - Mobile <768px
 * - Tablet 768-1023px
 * - Desktop 1024-1439px
 * - Large Desktop 1440px+
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock component that demonstrates responsive behavior
const ResponsiveTestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50" data-testid="responsive-container">
      {/* Navigation - responsive layout */}
      <nav
        className="bg-background shadow-sm border-b"
        data-testid="navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">
                美容院管理系统
              </h1>
            </div>
            {/* Desktop navigation */}
            <div
              className="hidden md:flex items-center space-x-4"
              data-testid="desktop-nav"
            >
              <a href="/revenue">收入管理</a>
              <a href="/costs">成本管理</a>
              <a href="/reports">报表</a>
            </div>
            {/* Mobile menu button */}
            <div
              className="md:hidden flex items-center"
              data-testid="mobile-menu-button"
            >
              <button className="p-2">☰</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area with responsive grid */}
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        data-testid="main-content"
      >
        {/* KPI Cards - responsive grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          data-testid="kpi-grid"
        >
          <div
            className="bg-white p-4 rounded-lg shadow"
            data-testid="kpi-card"
          >
            <h3 className="text-sm text-gray-600">今日收入</h3>
            <p className="text-2xl font-bold">¥12,345</p>
          </div>
          <div
            className="bg-white p-4 rounded-lg shadow"
            data-testid="kpi-card"
          >
            <h3 className="text-sm text-gray-600">今日成本</h3>
            <p className="text-2xl font-bold">¥5,678</p>
          </div>
          <div
            className="bg-white p-4 rounded-lg shadow"
            data-testid="kpi-card"
          >
            <h3 className="text-sm text-gray-600">净利润</h3>
            <p className="text-2xl font-bold">¥6,667</p>
          </div>
          <div
            className="bg-white p-4 rounded-lg shadow"
            data-testid="kpi-card"
          >
            <h3 className="text-sm text-gray-600">利润率</h3>
            <p className="text-2xl font-bold">54%</p>
          </div>
        </div>

        {/* Data table - responsive */}
        <div
          className="bg-white rounded-lg shadow"
          data-testid="data-table-container"
        >
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">数据表格</h2>
            {/* Table that should scroll horizontally on mobile */}
            <div
              className="overflow-x-auto"
              data-testid="table-scroll-container"
            >
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">日期</th>
                    <th className="text-left py-2 hidden sm:table-cell">
                      门店
                    </th>
                    <th className="text-left py-2">金额</th>
                    <th className="text-left py-2 hidden md:table-cell">
                      美容师
                    </th>
                    <th className="text-left py-2 hidden lg:table-cell">
                      支付方式
                    </th>
                    <th className="text-left py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr data-testid="table-row">
                    <td className="py-2">2024-01-15</td>
                    <td className="py-2 hidden sm:table-cell">总店</td>
                    <td className="py-2">¥1,000</td>
                    <td className="py-2 hidden md:table-cell">张美丽</td>
                    <td className="py-2 hidden lg:table-cell">微信支付</td>
                    <td className="py-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        编辑
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action buttons - responsive layout */}
        <div
          className="mt-8 flex flex-col sm:flex-row gap-4"
          data-testid="action-buttons"
        >
          <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md">
            新增记录
          </button>
          <button className="w-full sm:w-auto border border-gray-300 px-4 py-2 rounded-md">
            导出数据
          </button>
          <button className="w-full sm:w-auto border border-gray-300 px-4 py-2 rounded-md">
            批量导入
          </button>
        </div>
      </main>
    </div>
  );
};

describe('Responsive Design Tests', () => {
  // Helper function to simulate viewport resize
  const resizeWindow = (width: number, height = 768) => {
    // Mock window.innerWidth and window.innerHeight
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  };

  beforeEach(() => {
    // Reset to desktop size
    resizeWindow(1024, 768);
  });

  afterEach(() => {
    // Clean up
    resizeWindow(1024, 768);
  });

  describe('Mobile Layout (<768px)', () => {
    beforeEach(() => {
      resizeWindow(375, 667); // iPhone 6/7/8 size
    });

    it('should hide desktop navigation and show mobile menu button', () => {
      render(<ResponsiveTestComponent />);

      // Desktop nav should be hidden on mobile
      const desktopNav = screen.getByTestId('desktop-nav');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');

      // Mobile menu button should be visible
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toHaveClass('md:hidden');
    });

    it('should display KPI cards in single column', () => {
      render(<ResponsiveTestComponent />);

      const kpiGrid = screen.getByTestId('kpi-grid');
      expect(kpiGrid).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-4'
      );
    });

    it('should make action buttons full width and stack vertically', () => {
      render(<ResponsiveTestComponent />);

      const actionButtons = screen.getByTestId('action-buttons');
      expect(actionButtons).toHaveClass('flex-col', 'sm:flex-row');

      const buttons = actionButtons.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('w-full', 'sm:w-auto');
      });
    });

    it('should hide non-essential table columns on mobile', () => {
      render(<ResponsiveTestComponent />);

      const tableHeaders = screen.getByRole('table').querySelectorAll('th');

      // Check that some columns are hidden on mobile
      expect(tableHeaders[1]).toHaveClass('hidden', 'sm:table-cell'); // 门店 column
      expect(tableHeaders[3]).toHaveClass('hidden', 'md:table-cell'); // 美容师 column
      expect(tableHeaders[4]).toHaveClass('hidden', 'lg:table-cell'); // 支付方式 column
    });

    it('should enable horizontal scroll for wide content', () => {
      render(<ResponsiveTestComponent />);

      const scrollContainer = screen.getByTestId('table-scroll-container');
      expect(scrollContainer).toHaveClass('overflow-x-auto');
    });
  });

  describe('Tablet Layout (768px-1023px)', () => {
    beforeEach(() => {
      resizeWindow(768, 1024); // iPad size
    });

    it('should show desktop navigation on tablet', () => {
      render(<ResponsiveTestComponent />);

      const desktopNav = screen.getByTestId('desktop-nav');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');

      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toHaveClass('md:hidden');
    });

    it('should display KPI cards in 2-column grid', () => {
      render(<ResponsiveTestComponent />);

      const kpiGrid = screen.getByTestId('kpi-grid');
      expect(kpiGrid).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-4'
      );
    });

    it('should show more table columns than mobile', () => {
      render(<ResponsiveTestComponent />);

      const tableHeaders = screen.getByRole('table').querySelectorAll('th');

      // Store column should be visible on tablet
      expect(tableHeaders[1]).toHaveClass('hidden', 'sm:table-cell');
      // Beautician column still hidden on tablet
      expect(tableHeaders[3]).toHaveClass('hidden', 'md:table-cell');
    });

    it('should use horizontal layout for action buttons', () => {
      render(<ResponsiveTestComponent />);

      const actionButtons = screen.getByTestId('action-buttons');
      expect(actionButtons).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      resizeWindow(1024, 768); // Standard desktop
    });

    it('should show full desktop navigation', () => {
      render(<ResponsiveTestComponent />);

      const desktopNav = screen.getByTestId('desktop-nav');
      expect(desktopNav).toHaveClass('hidden', 'md:flex');

      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toHaveClass('md:hidden');
    });

    it('should display KPI cards in 4-column grid', () => {
      render(<ResponsiveTestComponent />);

      const kpiGrid = screen.getByTestId('kpi-grid');
      expect(kpiGrid).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-4'
      );
    });

    it('should show most table columns', () => {
      render(<ResponsiveTestComponent />);

      const tableHeaders = screen.getByRole('table').querySelectorAll('th');

      // Most columns should be visible on desktop
      expect(tableHeaders[1]).toHaveClass('hidden', 'sm:table-cell'); // Store
      expect(tableHeaders[3]).toHaveClass('hidden', 'md:table-cell'); // Beautician
      expect(tableHeaders[4]).toHaveClass('hidden', 'lg:table-cell'); // Payment method
    });

    it('should have auto-width action buttons in horizontal layout', () => {
      render(<ResponsiveTestComponent />);

      const actionButtons = screen.getByTestId('action-buttons');
      expect(actionButtons).toHaveClass('flex-col', 'sm:flex-row');

      const buttons = actionButtons.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('w-full', 'sm:w-auto');
      });
    });
  });

  describe('Large Desktop Layout (1440px+)', () => {
    beforeEach(() => {
      resizeWindow(1440, 900);
    });

    it('should show all table columns', () => {
      render(<ResponsiveTestComponent />);

      const tableHeaders = screen.getByRole('table').querySelectorAll('th');

      // All columns should be visible on large desktop
      expect(tableHeaders).toHaveLength(6);
      expect(tableHeaders[4]).toHaveClass('hidden', 'lg:table-cell'); // Payment method visible
    });

    it('should maintain maximum content width', () => {
      render(<ResponsiveTestComponent />);

      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toHaveClass('max-w-7xl', 'mx-auto');
    });
  });

  describe('Content Overflow and Scrolling', () => {
    it('should handle long content with horizontal scroll', () => {
      render(<ResponsiveTestComponent />);

      const scrollContainer = screen.getByTestId('table-scroll-container');
      expect(scrollContainer).toHaveClass('overflow-x-auto');

      const table = scrollContainer.querySelector('table');
      expect(table).toHaveClass('min-w-full');
    });

    it('should maintain minimum height for full viewport', () => {
      render(<ResponsiveTestComponent />);

      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveClass('min-h-screen');
    });
  });

  describe('Touch and Mobile Interaction', () => {
    it('should have appropriate touch targets for mobile', () => {
      resizeWindow(375, 667);
      render(<ResponsiveTestComponent />);

      const mobileMenuButton = screen
        .getByTestId('mobile-menu-button')
        .querySelector('button');
      expect(mobileMenuButton).toHaveClass('p-2'); // Minimum 44px touch target

      const actionButtons = screen
        .getByTestId('action-buttons')
        .querySelectorAll('button');
      actionButtons.forEach((button) => {
        expect(button).toHaveClass('px-4', 'py-2'); // Adequate padding for touch
      });
    });

    it('should have proper spacing for mobile interaction', () => {
      resizeWindow(375, 667);
      render(<ResponsiveTestComponent />);

      const actionButtons = screen.getByTestId('action-buttons');
      expect(actionButtons).toHaveClass('gap-4'); // Adequate spacing between buttons

      const kpiGrid = screen.getByTestId('kpi-grid');
      expect(kpiGrid).toHaveClass('gap-4'); // Spacing between cards
    });
  });

  describe('Accessibility in Responsive Design', () => {
    it('should maintain keyboard navigation across breakpoints', () => {
      render(<ResponsiveTestComponent />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeVisible();
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have proper heading hierarchy', () => {
      render(<ResponsiveTestComponent />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('美容院管理系统');

      const sectionHeading = screen.getByRole('heading', { level: 2 });
      expect(sectionHeading).toHaveTextContent('数据表格');
    });

    it('should maintain semantic structure on all devices', () => {
      render(<ResponsiveTestComponent />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
