'use client';

import { useEffect, useState } from 'react';
import { getCompletedVideos, clearVideoHistory } from '@/lib/storage';
import { VideoHistoryItem } from '@/types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

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
      <section
        className="bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200 p-6 transition-shadow duration-base"
        role="region"
        aria-label="Video history"
      >
        <h2 className="text-xl font-semibold mb-4 text-neutral-900">Your Dream Videos</h2>
        <EmptyState
          title="No Dream Videos Yet"
          description="Your video journey starts here! Describe a dream above and watch it come to life in seconds."
          showExamples={true}
        />
      </section>
    );
  }

  return (
    <section
      className="bg-white rounded-lg shadow-md p-6"
      role="region"
      aria-label="Video history"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold" id="video-history-heading">
          Your Dream Videos
        </h2>
        <Button
          variant="secondary"
          onClick={handleClear}
          className="text-sm py-2"
          aria-label="Clear all video history"
        >
          Clear History
        </Button>
      </div>

      <nav aria-labelledby="video-history-heading">
        <ul className="space-y-2" role="list">
          {history.map((item, index) => (
            <li key={item.jobId}>
              <button
                className={`w-full text-left p-4 border rounded-lg cursor-pointer transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  item.jobId === currentJobId
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
                onClick={() => onSelect(item)}
                aria-label={`View video: ${item.prompt}. Completed ${formatDate(item.completedAt || item.createdAt)}`}
                aria-current={item.jobId === currentJobId ? 'true' : undefined}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-800 font-medium truncate">&quot;{item.prompt}&quot;</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <time
                        className="text-xs text-neutral-500"
                        dateTime={item.completedAt || item.createdAt}
                      >
                        {item.completedAt
                          ? `Completed: ${formatDate(item.completedAt)}`
                          : formatDate(item.createdAt)}
                      </time>
                      <span className="text-xs text-primary-600 font-medium">
                        <span aria-hidden="true">👁️</span> View Video
                      </span>
                    </div>
                  </div>

                  <svg
                    className="h-5 w-5 text-primary-500 ml-2 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
