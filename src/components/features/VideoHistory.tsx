'use client';

import { useEffect, useState } from 'react';
import { getCompletedVideos, clearVideoHistory } from '@/lib/storage';
import { VideoHistoryItem } from '@/types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { VideoThumbnail, VideoThumbnailGrid } from '../ui/VideoThumbnail';

type ViewMode = 'grid' | 'list';

export interface VideoHistoryProps {
  onSelect: (item: VideoHistoryItem) => void;
  currentJobId?: string;
}

export function VideoHistory({ onSelect, currentJobId }: VideoHistoryProps) {
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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
      className="bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200 flex flex-col h-full transition-shadow duration-base"
      role="region"
      aria-label="Video history"
    >
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
        {history.length > 1 && (
          <h2 className="text-lg font-semibold text-neutral-900" id="video-history-heading">
            Your Dream Videos
          </h2>
        )}
        {history.length === 1 && <div />}

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded transition-all duration-fast ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded transition-all duration-fast ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={handleClear}
            className="text-sm py-2"
            aria-label="Clear all video history"
          >
            Clear History
          </Button>
        </div>
      </div>

      <nav aria-labelledby="video-history-heading" className="flex-1 overflow-y-auto p-4">
        {/* Grid View */}
        {viewMode === 'grid' ? (
          <VideoThumbnailGrid>
            {history.map((item) => (
              <VideoThumbnail
                key={item.jobId}
                videoUrl={item.videoUrl}
                prompt={item.prompt}
                duration={8}
                onClick={() => onSelect(item)}
                className={item.jobId === currentJobId ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
              />
            ))}
          </VideoThumbnailGrid>
        ) : (
          /* List View */
          <ul className="space-y-2" role="list">
            {history.map((item) => (
              <li key={item.jobId}>
                <button
                  className={`w-full text-left p-3 border rounded-lg cursor-pointer transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
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
                      <p className="text-neutral-800 font-medium truncate text-sm">&quot;{item.prompt}&quot;</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <time
                          className="text-xs text-neutral-500"
                          dateTime={item.completedAt || item.createdAt}
                        >
                          {item.completedAt
                            ? `${formatDate(item.completedAt)}`
                            : formatDate(item.createdAt)}
                        </time>
                        <span className="text-xs text-primary-600 font-medium">
                          View
                        </span>
                      </div>
                    </div>

                    <svg
                      className="h-4 w-4 text-primary-500 ml-2 flex-shrink-0"
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
        )}
      </nav>
    </section>
  );
}
