/**
 * Netlify Blob Storage utilities
 */

import { getStore } from '@netlify/blobs';
import { StorageError } from './errors';
import { logger } from './logger';

const STORE_NAME = 'videos';
const KEY_PREFIX = 'video:'; // Namespace for video blobs

/**
 * Generate a properly namespaced key for a video
 */
function getVideoKey(jobId: string): string {
  return `${KEY_PREFIX}${jobId}`;
}

/**
 * Get the blob store with proper configuration
 */
function getBlobStore() {
  const options: {
    name: string;
    siteID?: string;
    token?: string;
  } = {
    name: STORE_NAME,
  };

  // For local development, use environment variables if available
  if (process.env.NETLIFY_SITE_ID) {
    options.siteID = process.env.NETLIFY_SITE_ID;
  }

  if (process.env.NETLIFY_BLOB_STORE_TOKEN) {
    options.token = process.env.NETLIFY_BLOB_STORE_TOKEN;
  }

  return getStore(options);
}

/**
 * Stores a video in Netlify Blob storage
 */
export async function storeVideo(jobId: string, videoData: Buffer): Promise<string> {
  try {
    logger.debug('Attempting to store video in blob', { jobId, size: videoData.length });

    const store = getBlobStore();
    const key = getVideoKey(jobId);

    // Convert Buffer to ArrayBuffer properly
    // Use a copy to ensure we have a standard ArrayBuffer (not SharedArrayBuffer)
    const uint8Array = new Uint8Array(videoData);
    const arrayBuffer = uint8Array.buffer;

    await store.set(key, arrayBuffer, {
      metadata: {
        uploadedAt: new Date().toISOString(),
        size: videoData.length,
        jobId, // Store jobId in metadata for reference
      },
    });

    logger.info('Video stored in blob', { jobId, key, size: videoData.length });

    // Return the blob URL (this will be handled by get-video function)
    return `/api/get-video/${jobId}`;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to store video in blob', {
      jobId,
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new StorageError(`Failed to store video in blob storage: ${errorMsg}`);
  }
}

/**
 * Retrieves a video from Netlify Blob storage
 */
export async function getVideo(jobId: string): Promise<Buffer | null> {
  try {
    const store = getBlobStore();
    const key = getVideoKey(jobId);

    const blob = await store.get(key, { type: 'arrayBuffer' });

    if (!blob) {
      logger.debug('Video not found in blob', { jobId, key });
      return null;
    }

    logger.debug('Video retrieved from blob', { jobId, key, size: blob.byteLength });

    return Buffer.from(blob);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to get video from blob', {
      jobId,
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new StorageError(`Failed to retrieve video from blob storage: ${errorMsg}`);
  }
}

/**
 * Checks if a video exists in Netlify Blob storage
 */
export async function videoExists(jobId: string): Promise<boolean> {
  try {
    const store = getBlobStore();
    const key = getVideoKey(jobId);
    const metadata = await store.getMetadata(key);

    return metadata !== null;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to check video existence', {
      jobId,
      error: errorMsg,
    });
    return false;
  }
}

/**
 * Lists all video keys in blob storage (for maintenance/cleanup)
 */
export async function listVideos(): Promise<string[]> {
  try {
    const store = getBlobStore();
    const { blobs } = await store.list({ prefix: KEY_PREFIX });

    // Remove prefix from keys to return just jobIds
    return blobs.map((blob) => blob.key.replace(KEY_PREFIX, ''));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to list videos', { error: errorMsg });
    return [];
  }
}
