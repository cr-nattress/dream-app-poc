'use client';

import { useState } from 'react';
import { DreamInput } from '@/components/features/DreamInput';
import { VideoStatus } from '@/components/features/VideoStatus';
import { VideoPlayer } from '@/components/features/VideoPlayer';
import { VideoHistory } from '@/components/features/VideoHistory';
import { createVideo } from '@/lib/api-client';
import { saveVideoToHistory } from '@/lib/storage';
import { VideoHistoryItem } from '@/types';
import { logger } from '@/lib/logger';

export default function HomePage() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateVideo = async (prompt: string) => {
    logger.info('[HomePage] Creating video', {
      promptLength: prompt.length
    });

    setIsCreating(true);
    setVideoUrl(null);

    try {
      logger.debug('[HomePage] Calling createVideo API');
      const result = await createVideo(prompt);

      logger.info('[HomePage] Video creation initiated', {
        jobId: result.jobId,
        status: result.status
      });

      setCurrentJobId(result.jobId);
      setCurrentPrompt(prompt);

      // Save to history
      const historyItem: VideoHistoryItem = {
        jobId: result.jobId,
        prompt,
        createdAt: result.createdAt,
        status: result.status,
      };
      saveVideoToHistory(historyItem);

      logger.debug('[HomePage] Video saved to history', {
        jobId: result.jobId
      });
    } catch (error) {
      logger.error('[HomePage] Failed to create video', {
        error: error instanceof Error ? error.message : String(error),
        promptLength: prompt.length
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleVideoComplete = (url: string) => {
    logger.info('[HomePage] Video completed', {
      jobId: currentJobId,
      videoUrl: url
    });

    setVideoUrl(url);

    // Update history with completed status
    if (currentJobId) {
      const historyItem: VideoHistoryItem = {
        jobId: currentJobId,
        prompt: currentPrompt,
        createdAt: new Date().toISOString(),
        status: 'completed',
        videoUrl: url,
        completedAt: new Date().toISOString(),
      };
      saveVideoToHistory(historyItem);

      logger.debug('[HomePage] Updated history with completed video', {
        jobId: currentJobId
      });
    }
  };

  const handleVideoError = (error: string) => {
    logger.error('[HomePage] Video generation error', {
      jobId: currentJobId,
      error
    });

    // Update history with failed status
    if (currentJobId) {
      const historyItem: VideoHistoryItem = {
        jobId: currentJobId,
        prompt: currentPrompt,
        createdAt: new Date().toISOString(),
        status: 'failed',
      };
      saveVideoToHistory(historyItem);

      logger.debug('[HomePage] Updated history with failed video', {
        jobId: currentJobId
      });
    }

    // Reset state
    setCurrentJobId(null);
    setCurrentPrompt('');
  };

  const handleSelectHistory = (item: VideoHistoryItem) => {
    logger.info('[HomePage] Selected history item', {
      jobId: item.jobId,
      status: item.status,
      hasVideoUrl: !!item.videoUrl
    });

    if (item.status === 'completed' && item.videoUrl) {
      setCurrentJobId(item.jobId);
      setCurrentPrompt(item.prompt);
      setVideoUrl(item.videoUrl);
    } else if (item.status === 'processing' || item.status === 'pending') {
      setCurrentJobId(item.jobId);
      setCurrentPrompt(item.prompt);
      setVideoUrl(null);
    }
  };

  const handleCreateNew = () => {
    setCurrentJobId(null);
    setCurrentPrompt('');
    setVideoUrl(null);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Input Form - Only show if not currently processing */}
      {!currentJobId && (
        <DreamInput onSubmit={handleCreateVideo} isLoading={isCreating} />
      )}

      {/* Video Status - Show while processing */}
      {currentJobId && !videoUrl && (
        <VideoStatus
          jobId={currentJobId}
          prompt={currentPrompt}
          onComplete={handleVideoComplete}
          onError={handleVideoError}
        />
      )}

      {/* Video Player - Show when completed */}
      {currentJobId && videoUrl && (
        <>
          <VideoPlayer videoUrl={videoUrl} jobId={currentJobId} prompt={currentPrompt} />

          <div className="flex justify-center py-2">
            <button
              onClick={handleCreateNew}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              ← Create Another Dream Video
            </button>
          </div>
        </>
      )}

      {/* Video History */}
      <div className="flex-1 overflow-hidden">
        <VideoHistory onSelect={handleSelectHistory} currentJobId={currentJobId || undefined} />
      </div>
    </div>
  );
}
