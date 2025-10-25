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

const DREAM_STYLES = [
  {
    emoji: '🌑',
    name: 'Nightmare',
    description: 'Distorted, disorienting, tense with sharp contrast and flickering lights',
  },
  {
    emoji: '🌌',
    name: 'Surreal',
    description: 'Otherworldly, illogical, dreamlike with floating objects and impossible geometry',
  },
  {
    emoji: '✨',
    name: 'Vivid',
    description: 'Hyper-real, emotional, cinematic clarity with rich saturation',
  },
  {
    emoji: '🕯',
    name: 'Dark / Gothic',
    description: 'Brooding, mysterious, shadow-heavy with candlelight and mist',
  },
  {
    emoji: '☁️',
    name: 'Ethereal',
    description: 'Soft, weightless, peaceful with hazy glows and flowing fabrics',
  },
];

export interface DreamInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export function DreamInput({ onSubmit, isLoading }: DreamInputProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

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
      // Add style prefix (default to "normal dream" if no style selected)
      const style = selectedStyle || 'normal dream';
      const finalPrompt = `[${style} style] ${prompt}`;

      await onSubmit(finalPrompt);
      setPrompt(''); // Clear input on success
      setSelectedStyle(null); // Clear selected style
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create video');
    }
  };

  const useExample = () => {
    const randomPrompt = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  const handleStyleClick = (styleName: string) => {
    setSelectedStyle(selectedStyle === styleName ? null : styleName);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg border border-neutral-200 p-6 transition-shadow duration-base"
      role="region"
      aria-label="Dream video creation form"
    >
      {/* Dream Style Buttons */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {DREAM_STYLES.map((style) => (
            <button
              key={style.name}
              type="button"
              onClick={() => handleStyleClick(style.name)}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-fast border-2 ${
                selectedStyle === style.name
                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-pressed={selectedStyle === style.name}
              title={style.description}
            >
              <span className="mr-1">{style.emoji}</span>
              {style.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="dream-input-heading">
        <div>
          <label htmlFor="dream-prompt" className="sr-only">
            Dream description (minimum {MIN_LENGTH} characters, maximum {MAX_LENGTH} characters)
          </label>
          <textarea
            id="dream-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tell me about your dream..."
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all duration-fast bg-neutral-50 focus:bg-white focus:shadow-lg focus:shadow-primary/10 hover:border-neutral-400"
            rows={13}
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
          Create
        </Button>
      </form>

      <p id="dream-info" className="text-xs text-neutral-500 mt-4 flex items-center gap-1">
        <span aria-hidden="true">⏱️</span>
        <span>Video generation takes approximately 3-5 minutes</span>
      </p>
    </div>
  );
}
