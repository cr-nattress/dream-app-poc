/**
 * Netlify Function: Video Status
 * GET /api/video-status/:jobId
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getVideoStatus, downloadVideo } from '../../src/lib/sora-api';
import { storeVideo, videoExists } from '../../src/lib/blob-storage';
import { validateJobId } from '../../src/lib/validators';
import { handleApiError, ValidationError } from '../../src/lib/errors';
import { BlobLogger } from '../../src/lib/blob-logger';
import { randomUUID } from 'crypto';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const requestId = randomUUID();
  const blobLogger = new BlobLogger({
    service: 'video-status',
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

    // Check if video already exists in blob storage
    blobLogger.debug({
      msg: 'checking_blob_storage',
      requestId,
      jobId,
    });

    const exists = await videoExists(jobId);

    if (exists) {
      blobLogger.info({
        msg: 'video_cached',
        requestId,
        jobId,
        latencyMs: Date.now() - start,
      });
      await blobLogger.flush();

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
    const apiCallStart = Date.now();
    blobLogger.debug({
      msg: 'calling_sora_api.get_status',
      requestId,
      jobId,
    });

    const status = await getVideoStatus(jobId);

    blobLogger.info({
      msg: 'status_retrieved',
      requestId,
      jobId,
      status: status.status,
      hasError: !!status.error,
      errorCode: status.error?.code,
      errorMessage: status.error?.message,
      apiLatencyMs: Date.now() - apiCallStart,
    });

    // If failed, log the error details
    if (status.status === 'failed' && status.error) {
      blobLogger.error({
        msg: 'video_generation_failed',
        requestId,
        jobId,
        errorCode: status.error.code,
        errorMessage: status.error.message,
        fullError: status.error,
      });
    }

    // If completed, download and store the video
    if (status.status === 'completed') {
      blobLogger.info({
        msg: 'downloading_video',
        requestId,
        jobId,
      });

      try {
        const downloadStart = Date.now();
        blobLogger.debug({
          msg: 'calling_sora_api.download_video',
          requestId,
          jobId,
        });

        const videoData = await downloadVideo(jobId);

        blobLogger.info({
          msg: 'video_downloaded',
          requestId,
          jobId,
          videoSize: videoData.length,
          downloadMs: Date.now() - downloadStart,
        });

        const storeStart = Date.now();
        blobLogger.debug({
          msg: 'storing_video_to_blob',
          requestId,
          jobId,
          videoSize: videoData.length,
        });

        const videoUrl = await storeVideo(jobId, videoData);

        blobLogger.info({
          msg: 'video_stored',
          requestId,
          jobId,
          videoUrl,
          storeMs: Date.now() - storeStart,
          latencyMs: Date.now() - start,
        });

        await blobLogger.flush();

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
        const errorMessage =
          downloadError instanceof Error ? downloadError.message : 'Unknown error';

        blobLogger.error({
          msg: 'download_failed',
          requestId,
          jobId,
          error: errorMessage,
          stack: downloadError instanceof Error ? downloadError.stack : undefined,
          latencyMs: Date.now() - start,
        });

        await blobLogger.flush();

        // Return error but keep status as completed so frontend knows generation succeeded
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: `Video generation completed but download failed: ${errorMessage}`,
            jobId: status.id,
          }),
        };
      }
    }

    blobLogger.info({
      msg: 'request.success',
      requestId,
      jobId,
      status: status.status,
      latencyMs: Date.now() - start,
    });

    await blobLogger.flush();

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

    // Determine error source based on error type
    const isValidationError = error instanceof ValidationError;
    const errorSource = isValidationError ? 'validation' : 'sora_api_or_blob_storage';

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
