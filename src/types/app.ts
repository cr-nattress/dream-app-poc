/**
 * Application Type Definitions
 */

import { VideoStatus } from './sora';

/**
 * Video history item stored in local storage
 */
export interface VideoHistoryItem {
  jobId: string;
  prompt: string;
  createdAt: string;
  status: VideoStatus;
  completedAt?: string;
  videoUrl?: string;
}

/**
 * Local storage data structure
 */
export interface LocalStorageData {
  version: number;
  videos: VideoHistoryItem[];
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
}

/**
 * API success response with data
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
