'use client';

import { useState } from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';

export function Header() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearStorage = () => {
    if (showConfirm) {
      localStorage.clear();
      setShowConfirm(false);
      // Reload the page to reflect the cleared state
      window.location.reload();
    } else {
      setShowConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary-600 to-secondary-600 shadow-lg" role="banner">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/dreamit-logo.png"
              alt="DreamIt - AI Dream Videos"
              className="h-16 w-auto"
            />
          </div>

          <nav aria-label="Utility navigation" className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleClearStorage}
              className={`
                px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-base
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/30
                ${
                  showConfirm
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    : 'bg-white/20 hover:bg-white/30 text-white shadow-sm backdrop-blur-sm'
                }
              `}
              aria-label={showConfirm ? 'Confirm clear all video history' : 'Clear all video history from local storage'}
              aria-pressed={showConfirm}
            >
              {showConfirm ? 'Confirm' : 'Clear'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
