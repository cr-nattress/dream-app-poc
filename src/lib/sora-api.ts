/**
 * OpenAI Sora 2 API client
 */

import {
  CreateVideoResponse,
  VideoStatusResponse,
  OpenAIError,
} from '@/types';
import { VideoGenerationError } from './errors';
import { logger } from './logger';
import { renderDreamPrompt } from './prompt-template';

const OPENAI_API_BASE = 'https://api.openai.com/v1';

/**
 * Creates a new video generation job
 */
export async function createVideoJob(prompt: string): Promise<CreateVideoResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new VideoGenerationError('OPENAI_API_KEY is not configured');
  }

  // Render dream-focused prompt template with user notes
  const enhancedPrompt = renderDreamPrompt(prompt);

  const requestBody = {
    model: 'sora-2',
    prompt: enhancedPrompt,
    seconds: '4', // Short length (4 seconds)
    size: '480x854', // 480p portrait for mobile (smaller file size)
  };

  logger.info('[Sora API] Creating video job', {
    promptLength: prompt.length,
    enhancedPromptLength: enhancedPrompt.length,
    model: requestBody.model,
    duration: requestBody.seconds
  });

  try {
    const apiCallStart = Date.now();
    logger.debug('[Sora API] Sending POST request to OpenAI', {
      endpoint: '/videos',
      model: requestBody.model
    });

    const response = await fetch(`${OPENAI_API_BASE}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const apiLatency = Date.now() - apiCallStart;

    if (!response.ok) {
      const errorData: OpenAIError = await response.json();
      logger.error('[Sora API] Create video job failed', {
        status: response.status,
        statusText: response.statusText,
        errorCode: errorData.error.code,
        errorMessage: errorData.error.message,
        apiLatency
      });
      throw new VideoGenerationError(
        errorData.error.message,
        errorData.error.code || 'API_ERROR'
      );
    }

    const data: VideoStatusResponse = await response.json();

    logger.info('[Sora API] Video job created successfully', {
      jobId: data.id,
      status: data.status,
      apiLatency
    });

    return {
      jobId: data.id,
      status: 'pending',
      createdAt: data.created_at
        ? new Date(data.created_at * 1000).toISOString()
        : new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof VideoGenerationError) {
      throw error;
    }

    logger.error('[Sora API] Failed to create video job', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
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

  logger.debug('[Sora API] Checking video status', { jobId });

  try {
    const apiCallStart = Date.now();
    logger.debug('[Sora API] Sending GET request to OpenAI', {
      endpoint: `/videos/${jobId}`,
      jobId
    });

    const response = await fetch(`${OPENAI_API_BASE}/videos/${jobId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const apiLatency = Date.now() - apiCallStart;

    if (!response.ok) {
      if (response.status === 404) {
        logger.warn('[Sora API] Video job not found', {
          jobId,
          status: response.status,
          apiLatency
        });
        throw new VideoGenerationError('Video job not found', 'NOT_FOUND');
      }

      const errorData: OpenAIError = await response.json();
      logger.error('[Sora API] Get video status failed', {
        jobId,
        status: response.status,
        statusText: response.statusText,
        errorCode: errorData.error.code,
        errorMessage: errorData.error.message,
        apiLatency
      });
      throw new VideoGenerationError(
        errorData.error.message,
        errorData.error.code || 'API_ERROR'
      );
    }

    const data: VideoStatusResponse = await response.json();

    logger.debug('[Sora API] Video status retrieved', {
      jobId,
      status: data.status,
      hasError: !!data.error,
      apiLatency
    });

    return data;
  } catch (error) {
    if (error instanceof VideoGenerationError) {
      throw error;
    }

    logger.error('[Sora API] Failed to get video status', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
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

  logger.info('[Sora API] Downloading video', { jobId });

  try {
    const apiCallStart = Date.now();
    logger.debug('[Sora API] Sending GET request to OpenAI', {
      endpoint: `/videos/${jobId}/content`,
      jobId
    });

    const response = await fetch(`${OPENAI_API_BASE}/videos/${jobId}/content`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const responseLatency = Date.now() - apiCallStart;

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[Sora API] Download request failed', {
        jobId,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        responseLatency,
      });
      throw new VideoGenerationError(
        `Failed to download video: ${response.status} ${response.statusText}`,
        'DOWNLOAD_ERROR'
      );
    }

    logger.debug('[Sora API] Reading video content', { jobId });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const totalLatency = Date.now() - apiCallStart;

    logger.info('[Sora API] Video downloaded successfully', {
      jobId,
      size: buffer.length,
      sizeKB: Math.round(buffer.length / 1024),
      sizeMB: Math.round(buffer.length / 1024 / 1024 * 100) / 100,
      responseLatency,
      totalLatency
    });

    return buffer;
  } catch (error) {
    if (error instanceof VideoGenerationError) {
      throw error;
    }

    logger.error('[Sora API] Failed to download video', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new VideoGenerationError('Failed to download video');
  }
}
