/**
 * Input validation utilities
 */

const PROMPT_MIN_LENGTH = 10;
const PROMPT_MAX_LENGTH = 500;
const JOB_ID_PATTERN = /^video_[a-zA-Z0-9]{10,50}$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a dream prompt
 */
export function validatePrompt(prompt: string): ValidationResult {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt is required' };
  }

  const trimmed = prompt.trim();

  if (trimmed.length < PROMPT_MIN_LENGTH) {
    return {
      valid: false,
      error: `Prompt must be at least ${PROMPT_MIN_LENGTH} characters`,
    };
  }

  if (trimmed.length > PROMPT_MAX_LENGTH) {
    return {
      valid: false,
      error: `Prompt must be less than ${PROMPT_MAX_LENGTH} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validates a job ID format
 */
export function validateJobId(jobId: string): ValidationResult {
  if (!jobId || typeof jobId !== 'string') {
    return { valid: false, error: 'Job ID is required' };
  }

  if (!JOB_ID_PATTERN.test(jobId)) {
    return {
      valid: false,
      error: 'Invalid job ID format',
    };
  }

  return { valid: true };
}

/**
 * Validates environment variables
 */
export function validateEnvVars(): ValidationResult {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      valid: false,
      error: 'OPENAI_API_KEY environment variable is not set',
    };
  }

  if (!apiKey.startsWith('sk-')) {
    return {
      valid: false,
      error: 'OPENAI_API_KEY must start with "sk-"',
    };
  }

  return { valid: true };
}
