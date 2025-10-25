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

type Tab = 'home' | 'history' | 'about';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
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
      setCurrentTab('home'); // Switch to home tab to show the video
    } else if (item.status === 'processing' || item.status === 'pending') {
      setCurrentJobId(item.jobId);
      setCurrentPrompt(item.prompt);
      setVideoUrl(null);
      setCurrentTab('home'); // Switch to home tab to show the status
    }
  };

  const handleCreateNew = () => {
    setCurrentJobId(null);
    setCurrentPrompt('');
    setVideoUrl(null);
  };

  return (
    <>
      <div className="space-y-4 h-full flex flex-col pb-16">
        {/* Home Tab */}
        {currentTab === 'home' && (
          <>
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
          </>
        )}

        {/* History Tab */}
        {currentTab === 'history' && (
          <div className="flex-1 overflow-hidden">
            <VideoHistory onSelect={handleSelectHistory} currentJobId={currentJobId || undefined} />
          </div>
        )}

        {/* About Tab */}
        {currentTab === 'about' && (
          <div className="bg-white rounded-lg shadow-md border border-neutral-200 p-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">About DreamIt</h2>
            <div className="space-y-4 text-neutral-700">
              <p>
                DreamIt transforms your dream descriptions into stunning AI-generated videos using Sora 2,
                OpenAI's state-of-the-art video generation model.
              </p>
              <p>
                Simply describe your dream, choose a visual style, and watch as AI brings your imagination to life
                in breathtaking detail.
              </p>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">How it works:</h3>
                <ol className="list-decimal list-inside space-y-2 text-neutral-700">
                  <li>Choose your preferred visual style (optional)</li>
                  <li>Describe your dream in vivid detail</li>
                  <li>Wait 3-5 minutes while AI creates your video</li>
                  <li>Download and share your dream video</li>
                </ol>
              </div>
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <p className="text-sm text-neutral-500">
                  Powered by OpenAI Sora 2 | Video generation takes approximately 3-5 minutes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Tab Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-lg z-10">
        <nav className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex flex-col items-center py-3 px-4 transition-colors duration-fast ${
                currentTab === 'home'
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              aria-label="Home"
              aria-current={currentTab === 'home' ? 'page' : undefined}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1 font-medium">Home</span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex flex-col items-center py-3 px-4 transition-colors duration-fast ${
                currentTab === 'history'
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              aria-label="History"
              aria-current={currentTab === 'history' ? 'page' : undefined}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs mt-1 font-medium">History</span>
            </button>

            <button
              onClick={() => setCurrentTab('about')}
              className={`flex flex-col items-center py-3 px-4 transition-colors duration-fast ${
                currentTab === 'about'
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              aria-label="About"
              aria-current={currentTab === 'about' ? 'page' : undefined}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs mt-1 font-medium">About</span>
            </button>
          </div>
        </nav>
      </footer>
    </>
  );
}
