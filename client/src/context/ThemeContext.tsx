import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Apply or remove dark class on <html> and persist to localStorage */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
  localStorage.setItem('theme', theme);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read from localStorage first
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'dark' || stored === 'light') return stored;
    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply on initial render and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Also apply immediately on mount (before any effect delay)
  useEffect(() => {
    applyTheme(theme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
