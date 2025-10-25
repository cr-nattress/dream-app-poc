/**
 * Netlify Function: Get Video
 * GET /api/get-video/:jobId
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getVideo } from '../../src/lib/blob-storage';
import { downloadVideo } from '../../src/lib/sora-api';
import { validateJobId } from '../../src/lib/validators';
import { handleApiError, ValidationError } from '../../src/lib/errors';
import { BlobLogger } from '../../src/lib/blob-logger';
import { randomUUID } from 'crypto';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const requestId = randomUUID();
  const blobLogger = new BlobLogger({
    service: 'get-video',
    env: (process.env.CONTEXT as any) || 'dev',
  });

  const start = Date.now();

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    blobLogger.warn({
      msg: 'method_not_allowed',
      requestId,
      method: event.httpMethod,
      route: event.path,
    });
    await blobLogger.flush();

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract job ID from path
    const pathParts = event.path.split('/');
    const jobId = pathParts[pathParts.length - 1];

    blobLogger.info({
      msg: 'request.start',
      requestId,
      route: event.path,
      method: event.httpMethod,
      jobId,
    });

    // Validate job ID
    const validation = validateJobId(jobId);
    if (!validation.valid) {
      blobLogger.warn({
        msg: 'invalid_job_id',
        requestId,
        jobId,
        error: validation.error,
      });
      await blobLogger.flush();

      throw new ValidationError(validation.error || 'Invalid job ID');
    }

    // Try to get video from blob storage first (cached)
    blobLogger.debug({
      msg: 'fetching_from_blob_storage',
      requestId,
      jobId,
    });

    const fetchStart = Date.now();
    let videoData = await getVideo(jobId);
    let source = 'blob_storage';

    // If not cached, download from OpenAI
    if (!videoData) {
      blobLogger.info({
        msg: 'video_not_cached_downloading_from_openai',
        requestId,
        jobId,
      });

      try {
        const downloadStart = Date.now();
        videoData = await downloadVideo(jobId);
        source = 'openai_api';

        blobLogger.info({
          msg: 'video_downloaded_from_openai',
          requestId,
          jobId,
          videoSize: videoData.length,
          downloadMs: Date.now() - downloadStart,
        });
      } catch (downloadError) {
        blobLogger.error({
          msg: 'video_not_found_in_blob_or_openai',
          requestId,
          jobId,
          error: downloadError instanceof Error ? downloadError.message : String(downloadError),
          latencyMs: Date.now() - start,
        });
        await blobLogger.flush();

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
    }

    blobLogger.info({
      msg: 'request.success',
      requestId,
      jobId,
      videoSize: videoData.length,
      source,
      fetchMs: Date.now() - fetchStart,
      latencyMs: Date.now() - start,
    });

    await blobLogger.flush();

    // Return video with CDN-optimized cache headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="dream-video-${jobId}.mp4"`,
        // Browser cache: always check with CDN
        'Cache-Control': 'public, max-age=0, must-revalidate',
        // Netlify CDN: cache for 1 year with durable storage
        'Netlify-CDN-Cache-Control': 'public, s-maxage=31536000, durable, must-revalidate',
        // Enable range requests for video seeking
        'Accept-Ranges': 'bytes',
      } as Record<string, string>,
      body: videoData.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    const errorResponse = handleApiError(error);

    const isValidationError = error instanceof ValidationError;
    const errorSource = isValidationError ? 'validation' : 'blob_storage';

    blobLogger.error({
      msg: 'request.error',
      requestId,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof ValidationError ? 'validation' : 'internal',
      errorSource,
      stack: error instanceof Error ? error.stack : undefined,
      latencyMs: Date.now() - start,
    });

    await blobLogger.flush();

    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorResponse),
    };
  }
};
