/**
 * Netlify Background Function: Process Video
 * POST /api/process-video
 *
 * Downloads video from Sora, optionally compresses it, and stores in Netlify Blobs
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { storeVideo } from '../../src/lib/blob-storage';
import { handleApiError } from '../../src/lib/errors';
import { BlobLogger } from '../../src/lib/blob-logger';
import { randomUUID } from 'crypto';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const requestId = randomUUID();
  const blobLogger = new BlobLogger({
    service: 'process-video',
    env: (process.env.CONTEXT as any) || 'dev',
  });

  const start = Date.now();

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    blobLogger.warn({
      msg: 'method_not_allowed',
      requestId,
      method: event.httpMethod,
    });
    await blobLogger.flush();

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { jobId, videoUrl } = JSON.parse(event.body || '{}');

    if (!jobId || !videoUrl) {
      blobLogger.warn({
        msg: 'missing_parameters',
        requestId,
        hasJobId: !!jobId,
        hasVideoUrl: !!videoUrl,
      });
      await blobLogger.flush();

      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing jobId or videoUrl' }),
      };
    }

    blobLogger.info({
      msg: 'processing_video',
      requestId,
      jobId,
      videoUrl,
    });

    // Download video from Sora URL
    const downloadStart = Date.now();
    blobLogger.debug({
      msg: 'downloading_video',
      requestId,
      jobId,
      videoUrl,
    });

    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    blobLogger.info({
      msg: 'video_downloaded',
      requestId,
      jobId,
      size: videoBuffer.length,
      sizeMB: Math.round(videoBuffer.length / 1024 / 1024 * 100) / 100,
      downloadMs: Date.now() - downloadStart,
    });

    // TODO: Add compression here if needed
    // For now, we're just caching the 480p video from Sora
    // const compressedBuffer = await compressVideo(videoBuffer);

    // Store in Netlify Blobs
    const storeStart = Date.now();
    blobLogger.debug({
      msg: 'storing_video',
      requestId,
      jobId,
      size: videoBuffer.length,
    });

    const storedUrl = await storeVideo(jobId, videoBuffer);

    blobLogger.info({
      msg: 'video_stored',
      requestId,
      jobId,
      storedUrl,
      storeMs: Date.now() - storeStart,
      totalMs: Date.now() - start,
    });

    await blobLogger.flush();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        jobId,
        cachedUrl: storedUrl,
      }),
    };
  } catch (error) {
    const errorResponse = handleApiError(error);

    blobLogger.error({
      msg: 'process_video_error',
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      totalMs: Date.now() - start,
    });

    await blobLogger.flush();

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorResponse),
    };
  }
};
