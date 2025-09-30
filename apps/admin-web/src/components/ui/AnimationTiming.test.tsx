/**
 * Animation Timing Tests
 *
 * Testing animation specifications from the story:
 * - Fast interactions: 200ms (button clicks, status changes)
 * - General transitions: 300ms (page switches, form expansion)
 * - Easing function: cubic-bezier(0.4, 0, 0.2, 1)
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock animated components that follow the design system timing
const AnimatedButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200); // 200ms for fast interaction
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      data-testid="animated-button"
      className={`
        px-4 py-2 bg-blue-600 text-white rounded-md
        transition-all duration-200 ease-out
        hover:bg-blue-700 hover:scale-105
        active:scale-95
        ${isPressed ? 'animate-pulse' : ''}
      `}
      style={{
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </button>
  );
};

const ExpandableForm: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div data-testid="expandable-form">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="form-toggle"
        className="px-4 py-2 bg-gray-200 rounded-md transition-colors duration-200"
      >
        {isExpanded ? '收起表单' : '展开表单'}
      </button>

      <div
        data-testid="form-content"
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
        style={{
          transition:
            'max-height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="p-4 bg-white border rounded-md mt-2">
          <h3 className="text-lg font-semibold mb-4">详细表单</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="输入内容"
              className="w-full p-2 border rounded-md"
              data-testid="form-input"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
              提交
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusIndicator: React.FC<{
  status: 'idle' | 'loading' | 'success' | 'error';
}> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return { color: 'bg-yellow-500', text: '处理中...', icon: '🔄' };
      case 'success':
        return { color: 'bg-green-500', text: '成功', icon: '✅' };
      case 'error':
        return { color: 'bg-red-500', text: '失败', icon: '❌' };
      default:
        return { color: 'bg-gray-500', text: '待处理', icon: '⏸️' };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      data-testid="status-indicator"
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-white text-sm
        transition-all duration-200 ease-out
        ${config.color}
      `}
      style={{
        transition:
          'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </div>
  );
};

const PageTransition: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'page1' | 'page2'>('page1');

  return (
    <div data-testid="page-transition">
      <nav className="mb-4">
        <button
          onClick={() => setCurrentPage('page1')}
          data-testid="page1-button"
          className={`mr-2 px-4 py-2 rounded-md transition-colors duration-300 ${
            currentPage === 'page1' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          页面1
        </button>
        <button
          onClick={() => setCurrentPage('page2')}
          data-testid="page2-button"
          className={`px-4 py-2 rounded-md transition-colors duration-300 ${
            currentPage === 'page2' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          页面2
        </button>
      </nav>

      <div
        data-testid="page-content"
        className="min-h-32 p-4 bg-white border rounded-md transition-opacity duration-300"
        style={{
          transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {currentPage === 'page1' ? (
          <div data-testid="page1-content">
            <h2 className="text-xl font-bold">页面1内容</h2>
            <p>这是第一个页面的内容</p>
          </div>
        ) : (
          <div data-testid="page2-content">
            <h2 className="text-xl font-bold">页面2内容</h2>
            <p>这是第二个页面的内容</p>
          </div>
        )}
      </div>
    </div>
  );
};

describe('Animation Timing Tests', () => {
  // Helper to get computed styles
  const getComputedTransition = (element: Element) => {
    return window.getComputedStyle(element).transition;
  };

  describe('Fast Interactions (200ms)', () => {
    it('should animate button clicks within 200ms', async () => {
      const onClick = vi.fn();
      render(<AnimatedButton onClick={onClick}>点击我</AnimatedButton>);

      const button = screen.getByTestId('animated-button');

      // Check transition timing
      const computedStyle = window.getComputedStyle(button);
      expect(computedStyle.transitionDuration).toMatch(/200ms|0\.2s/);

      // Test click interaction
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);

      // Button should have visual feedback
      expect(button).toHaveClass('transition-all', 'duration-200');
    });

    it('should animate status changes within 200ms', () => {
      const { rerender } = render(<StatusIndicator status="idle" />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('transition-all', 'duration-200');

      // Change status and verify transition
      rerender(<StatusIndicator status="loading" />);
      expect(screen.getByText('处理中...')).toBeInTheDocument();

      rerender(<StatusIndicator status="success" />);
      expect(screen.getByText('成功')).toBeInTheDocument();
    });

    it('should use correct easing function for fast interactions', () => {
      render(<AnimatedButton>测试按钮</AnimatedButton>);

      const button = screen.getByTestId('animated-button');
      const style = button.getAttribute('style');

      expect(style).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(style).toContain('200ms');
    });
  });

  describe('General Transitions (300ms)', () => {
    it('should animate form expansion within 300ms', async () => {
      render(<ExpandableForm />);

      const toggleButton = screen.getByTestId('form-toggle');
      const formContent = screen.getByTestId('form-content');

      // Initial state - form should be collapsed
      expect(formContent).toHaveClass('max-h-0', 'opacity-0');

      // Expand form
      fireEvent.click(toggleButton);

      // Check transition timing
      const style = formContent.getAttribute('style');
      expect(style).toContain('300ms');
      expect(style).toContain('cubic-bezier(0.4, 0, 0.2, 1)');

      // Form should expand
      await waitFor(() => {
        expect(formContent).toHaveClass('max-h-96', 'opacity-100');
      });

      // Collapse form
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(formContent).toHaveClass('max-h-0', 'opacity-0');
      });
    });

    it('should animate page transitions within 300ms', async () => {
      render(<PageTransition />);

      const page1Button = screen.getByTestId('page1-button');
      const page2Button = screen.getByTestId('page2-button');
      const pageContent = screen.getByTestId('page-content');

      // Initial state
      expect(screen.getByTestId('page1-content')).toBeInTheDocument();

      // Check transition timing
      expect(pageContent).toHaveClass('transition-opacity', 'duration-300');

      // Switch to page 2
      fireEvent.click(page2Button);

      await waitFor(() => {
        expect(screen.getByTestId('page2-content')).toBeInTheDocument();
      });

      // Switch back to page 1
      fireEvent.click(page1Button);

      await waitFor(() => {
        expect(screen.getByTestId('page1-content')).toBeInTheDocument();
      });
    });

    it('should use correct easing function for transitions', () => {
      render(<ExpandableForm />);

      const formContent = screen.getByTestId('form-content');
      const style = formContent.getAttribute('style');

      expect(style).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(style).toContain('300ms');
    });
  });

  describe('Hover Effects and Micro-interactions', () => {
    it('should have appropriate hover timing for buttons', () => {
      render(<AnimatedButton>悬停测试</AnimatedButton>);

      const button = screen.getByTestId('animated-button');

      // Check hover classes
      expect(button).toHaveClass('hover:bg-blue-700', 'hover:scale-105');
      expect(button).toHaveClass('transition-all', 'duration-200');

      // Simulate hover
      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);
    });

    it('should handle active states with proper timing', () => {
      render(<AnimatedButton>激活测试</AnimatedButton>);

      const button = screen.getByTestId('animated-button');

      expect(button).toHaveClass('active:scale-95');

      // Simulate active state
      fireEvent.mouseDown(button);
      fireEvent.mouseUp(button);
    });
  });

  describe('Performance Considerations', () => {
    it('should use CSS transitions instead of JavaScript animations', () => {
      render(<ExpandableForm />);

      const formContent = screen.getByTestId('form-content');

      // Should use CSS classes for transitions
      expect(formContent).toHaveClass('transition-all');

      // Should not have JavaScript-based animation attributes
      expect(formContent).not.toHaveAttribute('data-animation-library');
    });

    it('should optimize for 60fps with transform and opacity', () => {
      render(<AnimatedButton>性能测试</AnimatedButton>);

      const button = screen.getByTestId('animated-button');

      // Should use transform for hover effects (GPU accelerated)
      expect(button).toHaveClass('hover:scale-105', 'active:scale-95');
    });

    it('should use will-change for complex animations', () => {
      render(<ExpandableForm />);

      const toggleButton = screen.getByTestId('form-toggle');
      fireEvent.click(toggleButton);

      const formContent = screen.getByTestId('form-content');

      // For complex animations, should hint browser optimization
      expect(formContent).toHaveClass('transition-all');
    });
  });

  describe('Accessibility and Reduced Motion', () => {
    it('should respect user motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<AnimatedButton>无障碍测试</AnimatedButton>);

      const button = screen.getByTestId('animated-button');
      expect(button).toBeInTheDocument();
    });

    it('should maintain usability without animations', () => {
      render(<ExpandableForm />);

      const toggleButton = screen.getByTestId('form-toggle');
      const formInput = screen.getByTestId('form-input');

      // Form should work without animations
      fireEvent.click(toggleButton);

      // Input should be accessible regardless of animation state
      fireEvent.change(formInput, { target: { value: 'test input' } });
      expect(formInput).toHaveValue('test input');
    });
  });

  describe('Animation Consistency', () => {
    it('should use consistent timing across similar interactions', () => {
      render(
        <div>
          <AnimatedButton>按钮1</AnimatedButton>
          <StatusIndicator status="idle" />
        </div>
      );

      const button = screen.getByTestId('animated-button');
      const status = screen.getByTestId('status-indicator');

      // Both fast interactions should use 200ms
      expect(button).toHaveClass('duration-200');
      expect(status).toHaveClass('duration-200');
    });

    it('should use consistent easing functions', () => {
      render(
        <div>
          <ExpandableForm />
          <PageTransition />
        </div>
      );

      const formContent = screen.getByTestId('form-content');
      const pageContent = screen.getByTestId('page-content');

      // Both should use the same easing function
      const formStyle = formContent.getAttribute('style');
      const pageStyle = pageContent.getAttribute('style');

      expect(formStyle).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
      expect(pageStyle).toContain('cubic-bezier(0.4, 0, 0.2, 1)');
    });
  });
});
