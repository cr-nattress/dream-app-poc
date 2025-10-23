/**
 * Local storage utilities for video history
 */

import { VideoHistoryItem, LocalStorageData } from '@/types';

const STORAGE_KEY = 'dream-videos-history';
const STORAGE_VERSION = 1;

/**
 * Saves a video to history
 */
export function saveVideoToHistory(item: VideoHistoryItem): void {
  try {
    const data = getStorageData();

    // Remove any existing entry with same jobId (ensure no duplicates)
    data.videos = data.videos.filter((v) => v.jobId !== item.jobId);

    // Add the item
    data.videos.push(item);

    // Sort by completedAt descending (newest first)
    // Videos without completedAt go to the end
    data.videos.sort((a, b) => {
      if (!a.completedAt && !b.completedAt) return 0;
      if (!a.completedAt) return 1;
      if (!b.completedAt) return -1;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

    // Keep only last 50 videos
    if (data.videos.length > 50) {
      data.videos = data.videos.slice(0, 50);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save video to history:', error);
  }
}

/**
 * Gets all videos from history
 */
export function getVideoHistory(): VideoHistoryItem[] {
  try {
    const data = getStorageData();
    return data.videos;
  } catch (error) {
    console.error('Failed to get video history:', error);
    return [];
  }
}

/**
 * Clears all video history
 */
export function clearVideoHistory(): void {
  try {
    const data: LocalStorageData = {
      version: STORAGE_VERSION,
      videos: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to clear video history:', error);
  }
}

/**
 * Gets a single video from history by job ID
 */
export function getVideoFromHistory(jobId: string): VideoHistoryItem | null {
  try {
    const data = getStorageData();
    return data.videos.find((v) => v.jobId === jobId) || null;
  } catch (error) {
    console.error('Failed to get video from history:', error);
    return null;
  }
}

/**
 * Gets only completed videos from history, sorted by completedAt descending
 */
export function getCompletedVideos(): VideoHistoryItem[] {
  try {
    const data = getStorageData();

    return data.videos
      .filter((v) => v.status === 'completed' && v.completedAt && v.videoUrl)
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      });
  } catch (error) {
    console.error('Failed to get completed videos:', error);
    return [];
  }
}

/**
 * Helper to get storage data with version handling
 */
function getStorageData(): LocalStorageData {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return {
      version: STORAGE_VERSION,
      videos: [],
    };
  }

  try {
    const data = JSON.parse(stored) as LocalStorageData;

    // Handle version migrations if needed
    if (data.version !== STORAGE_VERSION) {
      // Future: Add migration logic here
      return {
        version: STORAGE_VERSION,
        videos: data.videos || [],
      };
    }

    return data;
  } catch {
    return {
      version: STORAGE_VERSION,
      videos: [],
    };
  }
}
