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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Describe Your Dream</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your dream description..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={5}
            disabled={isLoading}
          />

          <div className="flex justify-between items-center mt-2">
            <p
              className={`text-sm ${
                charCount > MAX_LENGTH
                  ? 'text-red-600'
                  : charCount >= MIN_LENGTH
                    ? 'text-green-600'
                    : 'text-gray-500'
              }`}
            >
              {charCount} / {MAX_LENGTH} characters
            </p>

            <button
              type="button"
              onClick={useExample}
              className="text-sm text-blue-600 hover:text-blue-700"
              disabled={isLoading}
            >
              Use example
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

        <Button type="submit" disabled={!isValid || isLoading} loading={isLoading} className="w-full">
          Generate Dream Video
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-4">
        ⏱️ Video generation takes approximately 3-5 minutes
      </p>
    </div>
  );
}
