/**
 * Netlify Blob Storage utilities
 */

import { getStore } from '@netlify/blobs';
import { StorageError } from './errors';
import { logger } from './logger';

const STORE_NAME = 'videos';

/**
 * Stores a video in Netlify Blob storage
 */
export async function storeVideo(jobId: string, videoData: Buffer): Promise<string> {
  try {
    const store = getStore(STORE_NAME);

    await store.set(jobId, videoData.buffer as ArrayBuffer, {
      metadata: {
        uploadedAt: new Date().toISOString(),
        size: videoData.length,
      },
    });

    logger.info('Video stored in blob', { jobId, size: videoData.length });

    // Return the blob URL (this will be handled by get-video function)
    return `/api/get-video/${jobId}`;
  } catch (error) {
    logger.error('Failed to store video', { jobId, error });
    throw new StorageError('Failed to store video in blob storage');
  }
}

/**
 * Retrieves a video from Netlify Blob storage
 */
export async function getVideo(jobId: string): Promise<Buffer | null> {
  try {
    const store = getStore(STORE_NAME);

    const blob = await store.get(jobId, { type: 'arrayBuffer' });

    if (!blob) {
      logger.debug('Video not found in blob', { jobId });
      return null;
    }

    logger.debug('Video retrieved from blob', { jobId });

    return Buffer.from(blob);
  } catch (error) {
    logger.error('Failed to get video from blob', { jobId, error });
    throw new StorageError('Failed to retrieve video from blob storage');
  }
}

/**
 * Checks if a video exists in Netlify Blob storage
 */
export async function videoExists(jobId: string): Promise<boolean> {
  try {
    const store = getStore(STORE_NAME);
    const metadata = await store.getMetadata(jobId);

    return metadata !== null;
  } catch (error) {
    logger.error('Failed to check video existence', { jobId, error });
    return false;
  }
}
