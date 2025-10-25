'use client';

import { useState } from 'react';

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
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              DreamIt
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Create AI videos from your dream descriptions
            </p>
          </div>

          <button
            onClick={handleClearStorage}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-base
              ${
                showConfirm
                  ? 'bg-error hover:bg-red-700 text-white shadow-md'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 shadow-sm hover:shadow-md'
              }
            `}
            title="Clear all video history from local storage"
          >
            {showConfirm ? 'Click to Confirm' : 'Clear History'}
          </button>
        </div>
      </div>
    </header>
  );
}
