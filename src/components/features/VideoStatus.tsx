'use client';

import { useEffect, useState } from 'react';
import { getVideoStatus } from '@/lib/api-client';
import { VideoJob, VideoStatus as Status } from '@/types';
import { Spinner } from '../ui/Spinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { logger } from '@/lib/logger';

const POLL_INTERVAL = 10000; // 10 seconds

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

    return () => {
      logger.debug('[VideoStatus] Cleaning up polling intervals', {
        jobId,
        totalPolls: pollCount
      });

      if (intervalId) clearInterval(intervalId);
      if (timeIntervalId) clearInterval(timeIntervalId);
    };
  }, [jobId, onComplete, onError]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Generating Video</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Your dream:</p>
          <p className="text-gray-800 italic">&quot;{prompt}&quot;</p>
        </div>

        <div className="flex items-center space-x-3">
          <Spinner size="md" />
          <div className="flex-1">
            <p className="text-gray-700 font-medium">{STATUS_MESSAGES[status]}</p>
            <p className="text-sm text-gray-500">
              Elapsed time: {formatTime(elapsedTime)}
            </p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Job ID:</span>
            <span className="font-mono text-gray-800">{jobId}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Status updates every 10 seconds. This usually takes 3-5 minutes...
        </p>
      </div>
    </div>
  );
}
