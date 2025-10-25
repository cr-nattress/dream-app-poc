export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'video';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = ''
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'video':
        return 'rounded-lg aspect-[9/16]';
      default:
        return 'rounded';
    }
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] animate-shimmer ${getVariantClasses()} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
}

// Video player skeleton
export function VideoPlayerSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-in fade-in duration-base">
      <Skeleton variant="text" width="40%" height={28} className="mb-6" />

      <div className="space-y-4">
        {/* Dream prompt skeleton */}
        <div>
          <Skeleton variant="text" width="30%" height={16} className="mb-2" />
          <Skeleton variant="text" width="80%" height={20} />
        </div>

        {/* Video skeleton */}
        <div className="mx-auto" style={{ maxWidth: '400px' }}>
          <Skeleton variant="video" />
        </div>

        {/* Button skeleton */}
        <Skeleton variant="rectangular" width="100%" height={44} />

        {/* Job ID skeleton */}
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="20%" height={14} />
            <Skeleton variant="text" width="30%" height={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
