/**
 * Netlify Function: Video Status
 * GET /api/video-status/:jobId
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { getVideoStatus, downloadVideo } from '../../src/lib/sora-api';
import { storeVideo, videoExists } from '../../src/lib/blob-storage';
import { validateJobId } from '../../src/lib/validators';
import { handleApiError, ValidationError } from '../../src/lib/errors';
import { logger } from '../../src/lib/logger';

export const handler: Handler = async (event: HandlerEvent) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract job ID from path
    const pathParts = event.path.split('/');
    const jobId = pathParts[pathParts.length - 1];

    // Validate job ID
    const validation = validateJobId(jobId);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid job ID');
    }

    // Check if video already exists in blob storage
    const exists = await videoExists(jobId);

    if (exists) {
      logger.debug('Video already in blob storage', { jobId });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          status: 'completed',
          videoUrl: `/api/get-video/${jobId}`,
          completedAt: new Date().toISOString(),
        }),
      };
    }

    // Get status from Sora API
    const status = await getVideoStatus(jobId);

    // If completed, download and store the video
    if (status.status === 'completed') {
      logger.info('Video completed, downloading', { jobId });

      try {
        const videoData = await downloadVideo(jobId);
        const videoUrl = await storeVideo(jobId, videoData);

        logger.info('Video downloaded and stored successfully', { jobId });

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: status.id,
            status: 'completed',
            videoUrl,
            completedAt: status.completed_at
              ? new Date(status.completed_at * 1000).toISOString()
              : new Date().toISOString(),
          }),
        };
      } catch (downloadError) {
        logger.error('Failed to download/store video', { jobId, error: downloadError });
        // Return error but keep status as completed so frontend knows generation succeeded
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Video generation completed but download failed',
            jobId: status.id,
          }),
        };
      }
    }

    // Return current status
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: status.id,
        status: status.status,
        error: status.error,
      }),
    };
  } catch (error) {
    const errorResponse = handleApiError(error);

    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorResponse),
    };
  }
};
