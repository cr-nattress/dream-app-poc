'use client';

import { useEffect, useState } from 'react';
import { getVideoHistory, clearVideoHistory } from '@/lib/storage';
import { VideoHistoryItem } from '@/types';
import { Button } from '../ui/Button';

export interface VideoHistoryProps {
  onSelect: (item: VideoHistoryItem) => void;
  currentJobId?: string;
}

export function VideoHistory({ onSelect, currentJobId }: VideoHistoryProps) {
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);

  const loadHistory = () => {
    const items = getVideoHistory();
    setHistory(items);
  };

  useEffect(() => {
    loadHistory();
  }, [currentJobId]); // Reload when current job changes

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all video history?')) {
      clearVideoHistory();
      setHistory([]);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Dream Videos</h2>
        <p className="text-gray-500 text-center py-8">
          No videos yet. Create your first dream video above!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Dream Videos</h2>
        <Button variant="secondary" onClick={handleClear} className="text-sm py-2">
          Clear History
        </Button>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.jobId}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              item.jobId === currentJobId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onSelect(item)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 truncate">&quot;{item.prompt}&quot;</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-500">{formatDate(item.createdAt)}</span>
                </div>
              </div>

              {item.status === 'completed' && (
                <svg
                  className="h-5 w-5 text-green-500 ml-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
