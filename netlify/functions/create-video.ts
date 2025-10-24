/**
 * Netlify Function: Create Video
 * POST /api/create-video
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createVideoJob } from '../../src/lib/sora-api';
import { validatePrompt, validateEnvVars } from '../../src/lib/validators';
import { handleApiError, ValidationError } from '../../src/lib/errors';
import { BlobLogger } from '../../src/lib/blob-logger';
import { randomUUID } from 'crypto';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const requestId = randomUUID();
  const blobLogger = new BlobLogger({
    service: 'create-video',
    env: (process.env.CONTEXT as any) || 'dev',
  });

  const start = Date.now();

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
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
    blobLogger.info({
      msg: 'request.start',
      requestId,
      route: event.path,
      method: event.httpMethod,
      headers: {
        userAgent: event.headers['user-agent'],
        contentType: event.headers['content-type'],
      },
    });

    // Validate environment variables
    const envValidation = validateEnvVars();
    if (!envValidation.valid) {
      blobLogger.error({
        msg: 'env_validation_failed',
        requestId,
        error: envValidation.error,
      });
      await blobLogger.flush();

      return {
        statusCode: 500,
        body: JSON.stringify({ error: envValidation.error }),
      };
    }

    // Parse request body
    if (!event.body) {
      blobLogger.warn({
        msg: 'missing_request_body',
        requestId,
      });
      await blobLogger.flush();

      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { prompt } = JSON.parse(event.body);

    // Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      blobLogger.warn({
        msg: 'prompt_validation_failed',
        requestId,
        error: validation.error,
        promptLength: prompt?.length,
      });
      await blobLogger.flush();

      throw new ValidationError(validation.error || 'Invalid prompt');
    }

    blobLogger.info({
      msg: 'creating_video_job',
      requestId,
      promptLength: prompt.length,
    });

    // Create video job
    const apiCallStart = Date.now();
    blobLogger.debug({
      msg: 'calling_sora_api.create_video',
      requestId,
      promptLength: prompt.length,
    });

    const result = await createVideoJob(prompt);

    blobLogger.info({
      msg: 'sora_api.create_video.success',
      requestId,
      jobId: result.jobId,
      status: result.status,
      apiLatencyMs: Date.now() - apiCallStart,
    });

    blobLogger.info({
      msg: 'request.success',
      requestId,
      jobId: result.jobId,
      status: result.status,
      latencyMs: Date.now() - start,
    });

    await blobLogger.flush();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    const errorResponse = handleApiError(error);

    // Check if error is from Sora API or validation
    const isValidationError = error instanceof ValidationError;
    const errorSource = isValidationError ? 'validation' : 'sora_api';

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
