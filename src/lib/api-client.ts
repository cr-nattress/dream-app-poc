/**
 * Frontend API client for calling Netlify functions
 */

import { CreateVideoResponse, VideoJob } from '@/types';

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
 */
export async function createVideo(prompt: string): Promise<CreateVideoResponse> {
  const response = await fetch('/api/create-video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Failed to create video');
  }

  return data;
}

/**
 * Gets the status of a video generation job
 */
export async function getVideoStatus(jobId: string): Promise<VideoJob> {
  const response = await fetch(`/api/video-status/${jobId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Failed to get video status');
  }

  return {
    id: data.jobId,
    status: data.status,
    prompt: '',
    createdAt: data.createdAt || new Date().toISOString(),
    completedAt: data.completedAt,
    videoUrl: data.videoUrl,
    error: data.error,
  };
}

/**
 * Gets the video URL for a job ID
 */
export function getVideoUrl(jobId: string): string {
  return `/api/get-video/${jobId}`;
}
