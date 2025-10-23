'use client';

import { useEffect, useState } from 'react';
import { getCompletedVideos, clearVideoHistory } from '@/lib/storage';
import { VideoHistoryItem } from '@/types';
import { Button } from '../ui/Button';

export interface VideoHistoryProps {
  onSelect: (item: VideoHistoryItem) => void;
  currentJobId?: string;
}

export function VideoHistory({ onSelect, currentJobId }: VideoHistoryProps) {
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);

  const loadHistory = () => {
    const items = getCompletedVideos(); // Only show completed videos
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
          <button
            key={item.jobId}
            className={`w-full text-left p-4 border rounded-lg cursor-pointer transition-colors ${
              item.jobId === currentJobId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onSelect(item)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium truncate">&quot;{item.prompt}&quot;</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">
                    {item.completedAt
                      ? `Completed: ${formatDate(item.completedAt)}`
                      : formatDate(item.createdAt)}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">👁️ View Video</span>
                </div>
              </div>

              <svg
                className="h-5 w-5 text-blue-500 ml-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
