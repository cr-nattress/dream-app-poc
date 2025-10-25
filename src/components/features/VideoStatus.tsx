'use client';

import { useEffect, useState } from 'react';
import { getVideoStatus } from '@/lib/api-client';
import { VideoJob, VideoStatus as Status } from '@/types';
import { ProgressRing } from '../ui/ProgressRing';
import { ErrorMessage } from '../ui/ErrorMessage';
import { getRandomTip, DreamTip } from '@/lib/dream-tips';
import { logger } from '@/lib/logger';

const POLL_INTERVAL = 10000; // 10 seconds
const TIP_ROTATION_INTERVAL = 8000; // 8 seconds - rotate tips
const ESTIMATED_DURATION = 240; // 4 minutes average

const STATUS_MESSAGES: Record<Status, string> = {
  pending: 'Initializing video generation...',
  processing: 'Creating your dream video...',
  completed: 'Video ready!',
  failed: 'Generation failed',
};

export interface VideoStatusProps {
  jobId: string;
  prompt: string;
  onComplete: (videoUrl: string) => void;
  onError: (error: string) => void;
}

export function VideoStatus({ jobId, prompt, onComplete, onError }: VideoStatusProps) {
  const [status, setStatus] = useState<Status>('pending');
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTip, setCurrentTip] = useState<DreamTip>(getRandomTip());

  useEffect(() => {
    logger.info('[VideoStatus] Starting video status polling', {
      jobId,
      pollInterval: POLL_INTERVAL
    });

    // eslint-disable-next-line prefer-const
    let intervalId: NodeJS.Timeout | undefined;
    // eslint-disable-next-line prefer-const
    let timeIntervalId: NodeJS.Timeout | undefined;
    let pollCount = 0;

    const pollStatus = async () => {
      pollCount++;
      logger.debug('[VideoStatus] Polling video status', {
        jobId,
        pollCount,
        currentStatus: status
      });

      try {
        const job: VideoJob = await getVideoStatus(jobId);

        logger.debug('[VideoStatus] Status poll response', {
          jobId,
          pollCount,
          status: job.status,
          hasVideoUrl: !!job.videoUrl,
          hasError: !!job.error
        });

        setStatus(job.status);

        if (job.status === 'completed' && job.videoUrl) {
          if (intervalId) clearInterval(intervalId);
          if (timeIntervalId) clearInterval(timeIntervalId);

          logger.info('[VideoStatus] Video completed', {
            jobId,
            pollCount,
            videoUrl: job.videoUrl,
            totalPolls: pollCount
          });

          onComplete(job.videoUrl);
        } else if (job.status === 'failed') {
          if (intervalId) clearInterval(intervalId);
          if (timeIntervalId) clearInterval(timeIntervalId);
          const errorMsg = job.error || 'Video generation failed';

          logger.error('[VideoStatus] Video generation failed', {
            jobId,
            pollCount,
            error: errorMsg,
            totalPolls: pollCount
          });

          setError(errorMsg);
          onError(errorMsg);
        }
      } catch (err) {
        if (intervalId) clearInterval(intervalId);
        if (timeIntervalId) clearInterval(timeIntervalId);
        const errorMsg = err instanceof Error ? err.message : 'Failed to check status';

        logger.error('[VideoStatus] Status polling error', {
          jobId,
          pollCount,
          error: errorMsg,
          totalPolls: pollCount
        });

        setError(errorMsg);
        onError(errorMsg);
      }
    };

    // Start polling
    pollStatus();
    intervalId = setInterval(pollStatus, POLL_INTERVAL);

    // Track elapsed time
    timeIntervalId = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Rotate tips to keep users engaged
    const tipIntervalId = setInterval(() => {
      setCurrentTip(getRandomTip());
    }, TIP_ROTATION_INTERVAL);

    return () => {
      logger.debug('[VideoStatus] Cleaning up polling intervals', {
        jobId,
        totalPolls: pollCount
      });

      if (intervalId) clearInterval(intervalId);
      if (timeIntervalId) clearInterval(timeIntervalId);
      if (tipIntervalId) clearInterval(tipIntervalId);
    };
  }, [jobId, onComplete, onError]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (0-100)
  const calculateProgress = (): number => {
    // Progress estimation: linear approximation based on elapsed time
    // Clamp to maximum of 95% until actually complete
    const rawProgress = Math.min((elapsedTime / ESTIMATED_DURATION) * 100, 95);
    return Math.round(rawProgress);
  };

  // Calculate estimated time remaining
  const getTimeRemaining = (): string => {
    const remainingSeconds = Math.max(ESTIMATED_DURATION - elapsedTime, 0);
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;

    if (remainingSeconds === 0) {
      return 'Almost done...';
    }

    if (mins === 0) {
      return `~${secs}s remaining`;
    }

    return `~${mins}m ${secs}s remaining`;
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const progress = calculateProgress();
  const timeRemaining = getTimeRemaining();

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200 p-6 transition-shadow duration-base"
      role="region"
      aria-label="Video generation status"
    >
      <h2 className="text-xl font-semibold mb-6 text-neutral-900">Creating Your Dream</h2>

      <div className="space-y-6">
        {/* Dream prompt */}
        <div>
          <p className="text-sm text-neutral-600 mb-2 font-medium">Your dream:</p>
          <p className="text-neutral-800 italic bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-medium">
            &quot;{prompt}&quot;
          </p>
        </div>

        {/* Progress Ring */}
        <div className="flex flex-col items-center justify-center py-4">
          <ProgressRing progress={progress} size="lg" />
        </div>

        {/* Status and time - Live region for screen readers */}
        <div
          className="text-center space-y-2"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-neutral-700 font-semibold text-lg">{STATUS_MESSAGES[status]}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <time dateTime={`PT${elapsedTime}S`}>{formatTime(elapsedTime)}</time>
            </span>
            <span className="text-neutral-400">•</span>
            <span className="font-medium text-secondary-600">{timeRemaining}</span>
          </div>
        </div>

        {/* Engaging Tip Card */}
        <div
          className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-100 transition-all duration-slow"
          key={currentTip.id}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-700 leading-relaxed animate-in fade-in duration-slow">
                {currentTip.tip}
              </p>
            </div>
          </div>
        </div>

        {/* Job ID */}
        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Job ID:</span>
            <span className="font-mono text-neutral-800 font-medium" aria-label={`Job ID: ${jobId}`}>
              {jobId}
            </span>
          </div>
        </div>

        <p className="text-xs text-neutral-500 text-center">
          Updates every 10 seconds • AI video generation typically takes 3-5 minutes
        </p>
      </div>
    </div>
  );
}
