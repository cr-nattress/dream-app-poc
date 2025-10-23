/**
 * Netlify Function: Get Video
 * GET /api/get-video/:jobId
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { getVideo } from '../../src/lib/blob-storage';
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

    // Get video from blob storage
    const videoData = await getVideo(jobId);

    if (!videoData) {
      logger.warn('Video not found', { jobId });

      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: `Video not found for job ID: ${jobId}`,
        }),
      };
    }

    logger.info('Video retrieved successfully', { jobId, size: videoData.length });

    // Return video with appropriate headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="dream-video-${jobId}.mp4"`,
        'Cache-Control': 'public, max-age=31536000',
      } as Record<string, string>,
      body: videoData.toString('base64'),
      isBase64Encoded: true,
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
