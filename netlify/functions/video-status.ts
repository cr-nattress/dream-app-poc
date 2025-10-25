/**
 * Netlify Function: Video Status
 * GET /api/video-status/:jobId
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getVideoStatus } from '../../src/lib/sora-api';
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
      error: status.error,
      apiLatencyMs: Date.now() - apiCallStart,
    });

    // If failed, log the error details
    if (status.status === 'failed' && status.error) {
      blobLogger.error({
        msg: 'video_generation_failed',
        requestId,
        jobId,
        error: status.error,
      });
    }

    // If completed, return the video URL from Sora
    if (status.status === 'completed') {
      const videoUrl = status.url;

      if (!videoUrl) {
        blobLogger.error({
          msg: 'video_completed_but_no_url',
          requestId,
          jobId,
        });

        await blobLogger.flush();

        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Video completed but no URL provided by Sora API',
            jobId: status.id,
          }),
        };
      }

      blobLogger.info({
        msg: 'video_completed',
        requestId,
        jobId,
        videoUrl,
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
