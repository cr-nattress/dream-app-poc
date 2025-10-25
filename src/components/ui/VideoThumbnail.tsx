import Image from 'next/image';

export interface VideoThumbnailProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  prompt: string;
  duration?: number;
  onClick?: () => void;
  className?: string;
}

export function VideoThumbnail({
  videoUrl: _videoUrl,
  thumbnailUrl,
  prompt,
  duration = 8,
  onClick,
  className = '',
}: VideoThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative group overflow-hidden rounded-lg
        bg-gradient-to-br from-primary-100 to-secondary-100
        aspect-[9/16] w-full
        transition-all duration-base
        hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
    >
      {/* Thumbnail or Placeholder */}
      <div className="absolute inset-0">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`Thumbnail for: ${prompt}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        ) : (
          /* Placeholder with gradient */
          <div className="w-full h-full bg-gradient-to-br from-primary-200 via-secondary-100 to-primary-100 animate-pulse-slow">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-base" />

      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="
          w-16 h-16 rounded-full
          bg-white/90 backdrop-blur-sm
          flex items-center justify-center
          shadow-lg
          transform transition-all duration-base
          group-hover:scale-110 group-hover:bg-primary-600
          group-active:scale-95
        ">
          <svg
            className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-base ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Duration badge */}
      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
        {duration}s
      </div>

      {/* Prompt overlay (visible on hover) */}
      <div className="
        absolute bottom-0 left-0 right-0
        p-3
        bg-gradient-to-t from-black/80 to-transparent
        transform translate-y-full group-hover:translate-y-0
        transition-transform duration-base
      ">
        <p className="text-white text-sm font-medium line-clamp-2">
          {prompt}
        </p>
      </div>
    </button>
  );
}

// Grid container component for thumbnails
export function VideoThumbnailGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
