/**
 * Frontend API client for calling Netlify functions
 */

import { CreateVideoResponse, VideoJob } from '@/types';
import { logger } from './logger';
import { retry } from './retry';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Creates a new video generation job
 * Automatically retries on network errors and server errors (5xx)
 */
export async function createVideo(prompt: string): Promise<CreateVideoResponse> {
  const startTime = Date.now();
  logger.info('[API Client] Creating video', {
    endpoint: '/api/create-video',
    method: 'POST',
    promptLength: prompt.length
  });

  try {
    const response = await retry(
      () => fetch('/api/create-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      }),
      {
        maxAttempts: 3,
        initialDelay: 1000,
        onRetry: (attempt, error) => {
          logger.warn('[API Client] Retrying create video request', {
            attempt,
            error: error instanceof Error ? error.message : String(error),
          });
        },
      }
    );

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      logger.error('[API Client] Create video failed', {
        endpoint: '/api/create-video',
        status: response.status,
        error: data.error,
        duration
      });
      throw new ApiError(response.status, data.error || 'Failed to create video');
    }

    logger.info('[API Client] Video created successfully', {
      endpoint: '/api/create-video',
      jobId: data.jobId,
      status: data.status,
      duration
    });

    return data;
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('[API Client] Create video request error', {
      endpoint: '/api/create-video',
      error: error instanceof Error ? error.message : String(error),
      duration
    });
    throw error;
  }
}

/**
 * Gets the status of a video generation job
 * Automatically retries on network errors and server errors (5xx)
 */
export async function getVideoStatus(jobId: string): Promise<VideoJob> {
  const startTime = Date.now();
  const endpoint = `/api/video-status/${jobId}`;

  logger.debug('[API Client] Fetching video status', {
    endpoint,
    method: 'GET',
    jobId
  });

  try {
    const response = await retry(
      () => fetch(endpoint),
      {
        maxAttempts: 3,
        initialDelay: 500,
        onRetry: (attempt) => {
          logger.debug('[API Client] Retrying get video status', {
            attempt,
            jobId,
          });
        },
      }
    );
    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      logger.error('[API Client] Get video status failed', {
        endpoint,
        jobId,
        status: response.status,
        error: data.error,
        duration
      });
      throw new ApiError(response.status, data.error || 'Failed to get video status');
    }

    logger.debug('[API Client] Video status fetched', {
      endpoint,
      jobId,
      videoStatus: data.status,
      hasVideoUrl: !!data.videoUrl,
      duration
    });

    return {
      id: data.jobId,
      status: data.status,
      prompt: '',
      createdAt: data.createdAt || new Date().toISOString(),
      completedAt: data.completedAt,
      videoUrl: data.videoUrl,
      error: data.error,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('[API Client] Get video status request error', {
      endpoint,
      jobId,
      error: error instanceof Error ? error.message : String(error),
      duration
    });
    throw error;
  }
}

/**
 * Gets the video URL for a job ID
 */
export function getVideoUrl(jobId: string): string {
  const url = `/api/get-video/${jobId}`;
  logger.debug('[API Client] Generated video URL', {
    jobId,
    url
  });
  return url;
}
