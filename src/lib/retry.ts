/**
 * Retry utility with exponential backoff
 */

import { logger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry'>> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

/**
 * Default retry predicate - retries on network errors and 5xx server errors
 */
function defaultShouldRetry(error: unknown): boolean {
  // Retry network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Retry 5xx server errors
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status >= 500 && status < 600;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'shouldRetry' | 'onRetry'>>): number {
  const delay = options.initialDelay * Math.pow(options.backoffFactor, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects if all retries fail
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetch('/api/endpoint'),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const shouldRetry = options.shouldRetry || defaultShouldRetry;
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      const willRetry = attempt < opts.maxAttempts && shouldRetry(error);

      if (!willRetry) {
        // No more retries or error is not retryable
        throw error;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, opts);

      logger.warn(`Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`, {
        attempt,
        maxAttempts: opts.maxAttempts,
        delay,
        error: error instanceof Error ? error.message : String(error),
      });

      // Call optional retry callback
      options.onRetry?.(attempt, error);

      // Wait before next attempt
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Creates a retry wrapper for a function with pre-configured options
 *
 * @example
 * ```typescript
 * const retryableFetch = withRetry(
 *   (url: string) => fetch(url),
 *   { maxAttempts: 3 }
 * );
 *
 * const response = await retryableFetch('/api/endpoint');
 * ```
 */
export function withRetry<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => retry(() => fn(...args), options);
}
