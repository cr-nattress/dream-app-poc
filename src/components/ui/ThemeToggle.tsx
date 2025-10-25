'use client';

import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setIsOpen(false);
  };

  // Icons for different theme modes
  const themeIcons = {
    light: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    dark: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
    system: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  };

  const getCurrentIcon = () => {
    if (themeMode === 'system') {
      return themeIcons.system;
    }
    return themeIcons[theme];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-2 rounded-lg
          bg-neutral-100 dark:bg-neutral-800
          text-neutral-700 dark:text-neutral-300
          hover:bg-neutral-200 dark:hover:bg-neutral-700
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          transition-all duration-fast
          transform hover:scale-105 active:scale-95
        "
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getCurrentIcon()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-48
            bg-white dark:bg-neutral-800
            rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-fast
            z-50
          "
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-menu"
        >
          <div className="py-1">
            {/* Light Theme */}
            <button
              onClick={() => handleSelect('light')}
              className={`
                w-full px-4 py-2.5 text-left flex items-center gap-3
                transition-colors duration-fast
                ${
                  themeMode === 'light'
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }
              `}
              role="menuitem"
            >
              {themeIcons.light}
              <span className="flex-1 font-medium">Light</span>
              {themeMode === 'light' && (
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Dark Theme */}
            <button
              onClick={() => handleSelect('dark')}
              className={`
                w-full px-4 py-2.5 text-left flex items-center gap-3
                transition-colors duration-fast
                ${
                  themeMode === 'dark'
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }
              `}
              role="menuitem"
            >
              {themeIcons.dark}
              <span className="flex-1 font-medium">Dark</span>
              {themeMode === 'dark' && (
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* System Theme */}
            <button
              onClick={() => handleSelect('system')}
              className={`
                w-full px-4 py-2.5 text-left flex items-center gap-3
                transition-colors duration-fast
                ${
                  themeMode === 'system'
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }
              `}
              role="menuitem"
            >
              {themeIcons.system}
              <span className="flex-1 font-medium">System</span>
              {themeMode === 'system' && (
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
