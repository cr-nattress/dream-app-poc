import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validatePrompt, validateJobId, validateEnvVars } from '../../../src/lib/validators';

describe('validatePrompt', () => {
  it('should validate correct prompts', () => {
    const result = validatePrompt('A serene dream of floating through cherry blossoms');
    expect(result.valid).toBe(true);
  });

  it('should reject prompts that are too short', () => {
    const result = validatePrompt('Short');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 10 characters');
  });

  it('should reject prompts that are too long', () => {
    const longPrompt = 'A'.repeat(501);
    const result = validatePrompt(longPrompt);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('less than 500 characters');
  });

  it('should reject empty prompts', () => {
    const result = validatePrompt('');
    expect(result.valid).toBe(false);
  });

  it('should trim whitespace before validation', () => {
    const result = validatePrompt('  Valid prompt here  ');
    expect(result.valid).toBe(true);
  });
});

describe('validateJobId', () => {
  it('should validate correct job IDs', () => {
    const result = validateJobId('video_abc1234567');
    expect(result.valid).toBe(true);
  });

  it('should reject job IDs without video_ prefix', () => {
    const result = validateJobId('abc1234567');
    expect(result.valid).toBe(false);
  });

  it('should reject job IDs that are too short', () => {
    const result = validateJobId('video_abc');
    expect(result.valid).toBe(false);
  });

  it('should reject empty job IDs', () => {
    const result = validateJobId('');
    expect(result.valid).toBe(false);
  });
});

describe('validateEnvVars', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (originalApiKey) {
      process.env.OPENAI_API_KEY = originalApiKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it('should validate when OPENAI_API_KEY is set correctly', () => {
    process.env.OPENAI_API_KEY = 'sk-test123';
    const result = validateEnvVars();
    expect(result.valid).toBe(true);
  });

  it('should reject when OPENAI_API_KEY is not set', () => {
    delete process.env.OPENAI_API_KEY;
    const result = validateEnvVars();
    expect(result.valid).toBe(false);
    expect(result.error).toContain('not set');
  });

  it('should reject when OPENAI_API_KEY does not start with sk-', () => {
    process.env.OPENAI_API_KEY = 'invalid-key';
    const result = validateEnvVars();
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must start with "sk-"');
  });
});
