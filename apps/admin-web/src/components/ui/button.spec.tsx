/**
 * Button Component Unit Tests
 *
 * Tests the reusable button component from shadcn/ui
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click Me</Button>);

    expect(screen.getByRole('button', { name: /click me/i })).toBeTruthy();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBeTruthy();
  });

  it('should not trigger click when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toBeTruthy();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toBeTruthy();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="default">Default Size</Button>);
    expect(screen.getByRole('button')).toBeTruthy();

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeTruthy();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('should render as child component when asChild prop is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    // Should render the link, not a button element
    const link = screen.getByRole('link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/test');
  });
});
