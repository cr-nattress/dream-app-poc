/**
 * Netlify Background Function: Process Video
 * POST /api/process-video
 *
 * Downloads video from Sora, optionally compresses it, and stores in Netlify Blobs
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { storeVideo } from '../../src/lib/blob-storage';
import { compressVideo } from '../../src/lib/video-compressor';
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
    const { jobId } = JSON.parse(event.body || '{}');

    if (!jobId) {
      blobLogger.warn({
        msg: 'missing_parameters',
        requestId,
        hasJobId: !!jobId,
      });
      await blobLogger.flush();

      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing jobId' }),
      };
    }

    blobLogger.info({
      msg: 'processing_video',
      requestId,
      jobId,
    });

    // Download video from OpenAI's content endpoint
    const downloadStart = Date.now();
    const apiKey = process.env.OPENAI_API_KEY;
    const videoUrl = `https://api.openai.com/v1/videos/${jobId}/content`;

    blobLogger.debug({
      msg: 'downloading_video',
      requestId,
      jobId,
      videoUrl,
    });

    const response = await fetch(videoUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

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

    // Compress video with CRF 23 (60-70% size reduction)
    const compressionStart = Date.now();
    blobLogger.debug({
      msg: 'compressing_video',
      requestId,
      jobId,
      originalSize: videoBuffer.length,
    });

    const compressedBuffer = await compressVideo(videoBuffer);

    const compressionRatio = ((1 - compressedBuffer.length / videoBuffer.length) * 100).toFixed(1);
    blobLogger.info({
      msg: 'video_compressed',
      requestId,
      jobId,
      originalSize: videoBuffer.length,
      compressedSize: compressedBuffer.length,
      originalSizeMB: Math.round(videoBuffer.length / 1024 / 1024 * 100) / 100,
      compressedSizeMB: Math.round(compressedBuffer.length / 1024 / 1024 * 100) / 100,
      compressionRatio: `${compressionRatio}%`,
      compressionMs: Date.now() - compressionStart,
    });

    // Store compressed video in Netlify Blobs
    const storeStart = Date.now();
    blobLogger.debug({
      msg: 'storing_video',
      requestId,
      jobId,
      size: compressedBuffer.length,
    });

    const storedUrl = await storeVideo(jobId, compressedBuffer);

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
