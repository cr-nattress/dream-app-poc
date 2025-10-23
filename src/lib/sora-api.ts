/**
 * OpenAI Sora 2 API client
 */

import {
  CreateVideoRequest,
  CreateVideoResponse,
  VideoStatusResponse,
  OpenAIError,
} from '@/types';
import { VideoGenerationError } from './errors';
import { logger } from './logger';

const OPENAI_API_BASE = 'https://api.openai.com/v1';

/**
 * Creates a new video generation job
 */
export async function createVideoJob(prompt: string): Promise<CreateVideoResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new VideoGenerationError('OPENAI_API_KEY is not configured');
  }

  // Enhance prompt with cinematic elements
  const enhancedPrompt = `Cinematic dream sequence: ${prompt}`;

  const requestBody = {
    model: 'sora-2',
    prompt: enhancedPrompt,
  };

  logger.info('Creating video job', { promptLength: prompt.length });

  try {
    const response = await fetch(`${OPENAI_API_BASE}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData: OpenAIError = await response.json();
      throw new VideoGenerationError(
        errorData.error.message,
        errorData.error.code || 'API_ERROR'
      );
    }

    const data: VideoStatusResponse = await response.json();

    logger.info('Video job created', { jobId: data.id });

    return {
      jobId: data.id,
      status: 'pending',
      createdAt: new Date(data.created_at * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof VideoGenerationError) {
      throw error;
    }

    logger.error('Failed to create video job', { error });
    throw new VideoGenerationError('Failed to create video job');
  }
}

/**
 * Gets the status of a video generation job
 */
export async function getVideoStatus(jobId: string): Promise<VideoStatusResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new VideoGenerationError('OPENAI_API_KEY is not configured');
  }

  logger.debug('Checking video status', { jobId });

  try {
    const response = await fetch(`${OPENAI_API_BASE}/videos/${jobId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new VideoGenerationError('Video job not found', 'NOT_FOUND');
      }

      const errorData: OpenAIError = await response.json();
      throw new VideoGenerationError(
        errorData.error.message,
        errorData.error.code || 'API_ERROR'
      );
    }

    const data: VideoStatusResponse = await response.json();

    logger.debug('Video status retrieved', { jobId, status: data.status });

    return data;
  } catch (error) {
    if (error instanceof VideoGenerationError) {
      throw error;
    }

    logger.error('Failed to get video status', { jobId, error });
    throw new VideoGenerationError('Failed to get video status');
  }
}

/**
 * Downloads a completed video from OpenAI
 */
export async function downloadVideo(jobId: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new VideoGenerationError('OPENAI_API_KEY is not configured');
  }

  logger.info('Downloading video', { jobId });

  try {
    const response = await fetch(`${OPENAI_API_BASE}/videos/${jobId}/content`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new VideoGenerationError('Failed to download video', 'DOWNLOAD_ERROR');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    logger.info('Video downloaded', { jobId, size: buffer.length });

    return buffer;
  } catch (error) {
    if (error instanceof VideoGenerationError) {
      throw error;
    }

    logger.error('Failed to download video', { jobId, error });
    throw new VideoGenerationError('Failed to download video');
  }
}
