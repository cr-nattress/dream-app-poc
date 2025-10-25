'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type ThemeMode = Theme | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'dreamit-theme-mode';

/**
 * Gets the system theme preference
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Gets the initial theme mode from localStorage or system preference
 */
function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }

  return 'system';
}

/**
 * Resolves the actual theme based on mode and system preference
 */
function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme after mount to avoid hydration mismatch
  useEffect(() => {
    const initialMode = getInitialThemeMode();
    setThemeModeState(initialMode);
    setTheme(resolveTheme(initialMode));
    setMounted(true);
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    if (!mounted) return;

    const resolvedTheme = resolveTheme(themeMode);
    setTheme(resolvedTheme);

    // Update localStorage
    try {
      localStorage.setItem(STORAGE_KEY, themeMode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }

    // Update document class for CSS
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#171717' : '#fafafa'
      );
    }
  }, [themeMode, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, mounted]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      // If in system mode, switch to opposite of current resolved theme
      setThemeMode(theme === 'light' ? 'dark' : 'light');
    } else {
      // If manually set, toggle between light and dark
      setThemeMode(theme === 'light' ? 'dark' : 'light');
    }
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
  };

  // Always provide context, even during SSR
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
