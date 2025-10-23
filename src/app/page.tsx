'use client';

import { useState } from 'react';
import { DreamInput } from '@/components/features/DreamInput';
import { VideoStatus } from '@/components/features/VideoStatus';
import { VideoPlayer } from '@/components/features/VideoPlayer';
import { VideoHistory } from '@/components/features/VideoHistory';
import { createVideo } from '@/lib/api-client';
import { saveVideoToHistory } from '@/lib/storage';
import { VideoHistoryItem } from '@/types';

export default function HomePage() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateVideo = async (prompt: string) => {
    setIsCreating(true);
    setVideoUrl(null);

    try {
      const result = await createVideo(prompt);

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
    } catch (error) {
      console.error('Failed to create video:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleVideoComplete = (url: string) => {
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
    }
  };

  const handleVideoError = (error: string) => {
    console.error('Video generation error:', error);

    // Update history with failed status
    if (currentJobId) {
      const historyItem: VideoHistoryItem = {
        jobId: currentJobId,
        prompt: currentPrompt,
        createdAt: new Date().toISOString(),
        status: 'failed',
      };
      saveVideoToHistory(historyItem);
    }

    // Reset state
    setCurrentJobId(null);
    setCurrentPrompt('');
  };

  const handleSelectHistory = (item: VideoHistoryItem) => {
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
    <div className="space-y-8">
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

          <div className="flex justify-center">
            <button
              onClick={handleCreateNew}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Create Another Dream Video
            </button>
          </div>
        </>
      )}

      {/* Video History */}
      <VideoHistory onSelect={handleSelectHistory} currentJobId={currentJobId || undefined} />
    </div>
  );
}
