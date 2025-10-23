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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dream Video Generator</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create AI videos from your dream descriptions
            </p>
          </div>

          <button
            onClick={handleClearStorage}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${
                showConfirm
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
