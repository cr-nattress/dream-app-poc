import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  showExamples?: boolean;
}

const EXAMPLE_DREAMS = [
  '🌸 "Floating through cherry blossom trees"',
  '🐬 "Swimming with glowing dolphins at night"',
  '🏙️ "Flying over a futuristic city at sunset"',
  '💎 "Walking through a crystal forest"',
];

export function EmptyState({
  title = 'No Dream Videos Yet',
  description = "You haven't created any dream videos yet. Start by describing a dream above!",
  actionLabel,
  onAction,
  showExamples = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in duration-slow">
      {/* Animated SVG Illustration */}
      <div className="mb-8 relative">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-float"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="dreamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary-500)" />
              <stop offset="100%" stopColor="var(--secondary-500)" />
            </linearGradient>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary-300)" />
              <stop offset="100%" stopColor="var(--secondary-300)" />
            </linearGradient>
          </defs>

          {/* Cloud base */}
          <ellipse
            cx="100"
            cy="140"
            rx="70"
            ry="15"
            fill="var(--neutral-200)"
            opacity="0.3"
            className="animate-pulse-slow"
          />

          {/* Main video frame */}
          <rect
            x="50"
            y="60"
            width="100"
            height="80"
            rx="8"
            fill="url(#dreamGradient)"
            opacity="0.2"
            className="animate-pulse-slow"
          />
          <rect
            x="50"
            y="60"
            width="100"
            height="80"
            rx="8"
            stroke="url(#dreamGradient)"
            strokeWidth="3"
            fill="none"
            className="animate-draw"
          />

          {/* Play icon */}
          <circle cx="100" cy="100" r="20" fill="white" opacity="0.9" />
          <path
            d="M95 90 L95 110 L110 100 Z"
            fill="url(#dreamGradient)"
            className="animate-pulse-slow"
          />

          {/* Floating stars */}
          <g className="animate-twinkle">
            <path
              d="M30 40 L32 45 L37 45 L33 48 L35 53 L30 50 L25 53 L27 48 L23 45 L28 45 Z"
              fill="url(#starGradient)"
              opacity="0.6"
            />
            <path
              d="M170 50 L172 55 L177 55 L173 58 L175 63 L170 60 L165 63 L167 58 L163 55 L168 55 Z"
              fill="url(#starGradient)"
              opacity="0.8"
            />
            <path
              d="M160 100 L162 105 L167 105 L163 108 L165 113 L160 110 L155 113 L157 108 L153 105 L158 105 Z"
              fill="url(#starGradient)"
              opacity="0.5"
            />
          </g>

          {/* Sparkles */}
          <circle cx="40" cy="70" r="2" fill="var(--primary-400)" className="animate-ping-slow" />
          <circle cx="160" cy="80" r="2" fill="var(--secondary-400)" className="animate-ping-slow" style={{ animationDelay: '0.5s' }} />
          <circle cx="80" cy="45" r="2" fill="var(--primary-300)" className="animate-ping-slow" style={{ animationDelay: '1s' }} />
        </svg>
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-neutral-900 mb-3 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-neutral-600 max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {/* Example prompts */}
      {showExamples && (
        <div className="w-full max-w-md mb-8">
          <p className="text-sm font-semibold text-neutral-700 mb-3 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Try these dream ideas:
          </p>
          <div className="space-y-2">
            {EXAMPLE_DREAMS.map((dream, index) => (
              <div
                key={index}
                className="text-sm text-neutral-600 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-lg border border-primary-100 animate-in slide-in-from-left duration-base"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {dream}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action button */}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" className="shadow-lg hover:shadow-primary">
          {actionLabel}
        </Button>
      )}

      {/* Hint text */}
      <p className="text-xs text-neutral-400 mt-6 italic">
        ✨ Describe your dream in the form above to get started
      </p>
    </div>
  );
}
