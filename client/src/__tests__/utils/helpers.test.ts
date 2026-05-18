import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, formatRelativeTime, downloadCsv } from '../../utils/helpers';

describe('formatDate', () => {
  it('should format a valid ISO date string', () => {
    const result = formatDate('2024-01-15T10:00:00Z');
    // Should include month, day, year
    expect(result).toMatch(/Jan 15, 2024/);
  });

  it('should return em-dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('should return em-dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('should return em-dash for empty string', () => {
    expect(formatDate('')).toBe('—');
  });
});

describe('formatRelativeTime', () => {
  it('should return "Just now" for very recent dates', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('Just now');
  });

  it('should return minutes ago for recent dates', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
  });

  it('should return hours ago for dates within a day', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });

  it('should return days ago for dates within a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
  });

  it('should return formatted date for old dates', () => {
    const oldDate = '2022-06-01T00:00:00Z';
    const result = formatRelativeTime(oldDate);
    expect(result).toContain('2022');
  });

  it('should return em-dash for null', () => {
    expect(formatRelativeTime(null)).toBe('—');
  });
});

describe('downloadCsv', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should trigger a download by creating an anchor element', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el: any) => el);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el: any) => el);
    vi.spyOn(document.body, 'contains').mockReturnValue(true);

    const blob = new Blob(['name,email\nJohn,john@test.com'], { type: 'text/csv' });
    downloadCsv(blob, 'test_export.csv');

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(appendSpy).toHaveBeenCalledOnce();
    
    // Fast-forward the 500ms timeout
    vi.runAllTimers();
    expect(removeSpy).toHaveBeenCalledOnce();

    clickSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('should use a timestamped filename when no filename provided', () => {
    let capturedDownload = '';

    const originalCreateElement = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: any) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'download', {
          set(val) { capturedDownload = val; },
          get() { return capturedDownload; },
        });
        el.click = vi.fn();
      }
      return el;
    });

    vi.spyOn(document.body, 'appendChild').mockImplementation((el: any) => el);
    vi.spyOn(document.body, 'removeChild').mockImplementation((el: any) => el);

    const blob = new Blob(['test'], { type: 'text/csv' });
    downloadCsv(blob);
    vi.runAllTimers();

    expect(capturedDownload).toMatch(/leads_export_\d+\.csv/);

    createSpy.mockRestore();
  });
});
