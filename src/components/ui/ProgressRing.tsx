export interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressRing({ progress, size = 'md', showLabel = true }: ProgressRingProps) {
  const sizeConfig = {
    sm: { dimension: 80, strokeWidth: 6, fontSize: 'text-sm' },
    md: { dimension: 120, strokeWidth: 8, fontSize: 'text-lg' },
    lg: { dimension: 160, strokeWidth: 10, fontSize: 'text-2xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={config.dimension}
        height={config.dimension}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          fill="none"
          className="text-neutral-200"
        />

        {/* Progress circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-slow"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary-600)" />
            <stop offset="100%" stopColor="var(--secondary-500)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent ${config.fontSize}`}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}
