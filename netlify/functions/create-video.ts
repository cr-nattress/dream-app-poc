/**
 * Netlify Function: Create Video
 * POST /api/create-video
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { createVideoJob } from '../../src/lib/sora-api';
import { validatePrompt, validateEnvVars } from '../../src/lib/validators';
import { handleApiError, ValidationError } from '../../src/lib/errors';
import { logger } from '../../src/lib/logger';

export const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Validate environment variables
    const envValidation = validateEnvVars();
    if (!envValidation.valid) {
      logger.error('Environment validation failed', { error: envValidation.error });
      return {
        statusCode: 500,
        body: JSON.stringify({ error: envValidation.error }),
      };
    }

    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { prompt } = JSON.parse(event.body);

    // Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'Invalid prompt');
    }

    // Create video job
    const result = await createVideoJob(prompt);

    logger.info('Video creation request successful', { jobId: result.jobId });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
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
