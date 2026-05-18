import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { ThemeProvider, useTheme } from '../context/ThemeContext';


// ── Modal Tests ────────────────────────────────────────────────
describe('Modal component', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByText('Test Modal')).toBeNull();
    expect(screen.queryByText('Content')).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal content here</p>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeTruthy();
    expect(screen.getByText('Modal content here')).toBeTruthy();
  });

  it('should call onClose when the close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Closeable Modal">
        <p>Content</p>
      </Modal>
    );
    const closeBtn = screen.getByLabelText('Close modal');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onClose when backdrop is clicked', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} title="Backdrop Modal">
        <p>Content</p>
      </Modal>
    );
    // Click the overlay (first div)
    const overlay = container.querySelector('.modal-overlay');
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Escape Modal">
        <p>Content</p>
      </Modal>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should render children correctly', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Children Test">
        <input placeholder="Test input" />
        <button>Submit</button>
      </Modal>
    );
    expect(screen.getByPlaceholderText('Test input')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeTruthy();
  });
});

// ── Pagination Tests ────────────────────────────────────────────
describe('Pagination component', () => {
  const defaultMeta = {
    total: 50,
    page: 1,
    limit: 10,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
  };

  const onPageChange = vi.fn();
  const onLimitChange = vi.fn();

  beforeEach(() => {
    onPageChange.mockClear();
    onLimitChange.mockClear();
  });

  it('should display the current record range', () => {
    render(
      <Pagination meta={defaultMeta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    );
    expect(screen.getByText(/Showing 1–10 of 50/)).toBeTruthy();
  });

  it('should call onPageChange when next page button is clicked', () => {
    render(
      <Pagination meta={defaultMeta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    );
    // Find next button (chevron right) — last button
    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons[buttons.length - 1];
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('prev button should be disabled on first page', () => {
    render(
      <Pagination meta={{ ...defaultMeta, hasPrev: false }} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    );
    const buttons = screen.getAllByRole('button');
    const prevBtn = buttons[0];
    expect(prevBtn).toBeDisabled();
  });

  it('next button should be disabled on last page', () => {
    render(
      <Pagination
        meta={{ ...defaultMeta, page: 5, totalPages: 5, hasNext: false, hasPrev: true }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    );
    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons[buttons.length - 1];
    expect(nextBtn).toBeDisabled();
  });

  it('should call onLimitChange when page size selector changes', () => {
    render(
      <Pagination meta={defaultMeta} onPageChange={onPageChange} onLimitChange={onLimitChange} />
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '25' } });
    expect(onLimitChange).toHaveBeenCalledWith(25);
  });
});

// ── ThemeContext Tests ─────────────────────────────────────────
describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  const ThemeDisplay = () => {
    const { theme, toggleTheme, isDark } = useTheme();
    return (
      <div>
        <span data-testid="theme">{theme}</span>
        <span data-testid="isDark">{String(isDark)}</span>
        <button onClick={toggleTheme}>Toggle</button>
      </div>
    );
  };

  it('should default to light theme', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(screen.getByTestId('isDark').textContent).toBe('false');
  });

  it('should toggle to dark when button is clicked', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(screen.getByTestId('isDark').textContent).toBe('true');
  });

  it('should add .dark class to document.documentElement when dark', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove .dark class when toggled back to light', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    const btn = screen.getByRole('button', { name: 'Toggle' });
    act(() => fireEvent.click(btn)); // light → dark
    act(() => fireEvent.click(btn)); // dark → light
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should throw if used outside ThemeProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ThemeDisplay />)).toThrow();
    consoleError.mockRestore();
  });
});
