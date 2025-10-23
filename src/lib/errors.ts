/**
 * Custom error classes and error handling utilities
 */

export class VideoGenerationError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'VideoGenerationError';
  }
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

/**
 * Handles API errors and returns a standardized error response
 */
export function handleApiError(error: unknown): ErrorResponse {
  if (error instanceof VideoGenerationError) {
    return {
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof ValidationError) {
    return {
      error: error.message,
      code: 'VALIDATION_ERROR',
    };
  }

  if (error instanceof StorageError) {
    return {
      error: error.message,
      code: 'STORAGE_ERROR',
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    error: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
}
