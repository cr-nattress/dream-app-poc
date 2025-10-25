'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

const EXAMPLE_PROMPTS = [
  'A serene dream of floating through cherry blossom trees',
  'Swimming with bioluminescent dolphins in a starlit ocean',
  'Flying over a futuristic city at sunset',
  'Walking through a forest where trees are made of crystal',
];

export interface DreamInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export function DreamInput({ onSubmit, isLoading }: DreamInputProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const charCount = prompt.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValid) {
      setError(`Prompt must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`);
      return;
    }

    try {
      await onSubmit(prompt);
      setPrompt(''); // Clear input on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create video');
    }
  };

  const useExample = () => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200 p-6 transition-shadow duration-base"
      role="region"
      aria-label="Dream video creation form"
    >
      <h2 className="text-xl font-semibold mb-4 text-neutral-900" id="dream-input-heading">
        Describe Your Dream
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="dream-input-heading">
        <div>
          <label htmlFor="dream-prompt" className="sr-only">
            Dream description (minimum {MIN_LENGTH} characters, maximum {MAX_LENGTH} characters)
          </label>
          <textarea
            id="dream-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your dream description..."
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all duration-fast bg-neutral-50 focus:bg-white focus:shadow-lg focus:shadow-primary/10 hover:border-neutral-400"
            rows={5}
            disabled={isLoading}
            aria-describedby="char-count dream-info"
            aria-invalid={error ? 'true' : 'false'}
            required
            minLength={MIN_LENGTH}
            maxLength={MAX_LENGTH}
          />

          <div className="flex justify-between items-center mt-2">
            <p
              id="char-count"
              className={`text-sm font-medium transition-colors duration-fast ${
                charCount > MAX_LENGTH
                  ? 'text-error'
                  : charCount >= MIN_LENGTH
                    ? 'text-success'
                    : 'text-neutral-500'
              }`}
              aria-live="polite"
            >
              {charCount} / {MAX_LENGTH} characters
            </p>

            <button
              type="button"
              onClick={useExample}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-fast disabled:opacity-50 focus:outline-none focus:underline"
              disabled={isLoading}
              aria-label="Fill textarea with an example dream description"
            >
              Use example
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" aria-live="assertive">
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          </div>
        )}

        <Button type="submit" disabled={!isValid || isLoading} loading={isLoading} className="w-full">
          Generate Dream Video
        </Button>
      </form>

      <p id="dream-info" className="text-xs text-neutral-500 mt-4 flex items-center gap-1">
        <span aria-hidden="true">⏱️</span>
        <span>Video generation takes approximately 3-5 minutes</span>
      </p>
    </div>
  );
}
