/**
 * Sora 2 API Type Definitions
 */

export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type SoraModel = 'sora-2' | 'sora-2-pro';

export type VideoResolution = '720p' | '1080p' | '1024p';

/**
 * Valid duration values for Sora video generation
 * "4" = 4 seconds (default)
 * "8" = 8 seconds (medium)
 * "12" = 12 seconds (maximum)
 */
export type VideoDuration = '4' | '8' | '12';

/**
 * Request to create a new video generation job
 */
export interface CreateVideoRequest {
  model: SoraModel;
  prompt: string;
  seconds?: VideoDuration;
  resolution?: VideoResolution;
}

/**
 * Response from creating a video generation job
 */
export interface CreateVideoResponse {
  jobId: string;
  status: VideoStatus;
  createdAt: string;
}

/**
 * Response from checking video generation status
 */
export interface VideoStatusResponse {
  id: string;
  status: string;
  created_at?: number;
  completed_at?: number;
  error?: string | null;
}

/**
 * Internal video job representation
 */
export interface VideoJob {
  id: string;
  status: VideoStatus;
  prompt: string;
  createdAt: string;
  completedAt?: string;
  videoUrl?: string;
  error?: string;
}

/**
 * OpenAI API error response
 */
export interface OpenAIError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}
