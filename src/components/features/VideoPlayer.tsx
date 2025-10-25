'use client';

export interface VideoPlayerProps {
  videoUrl: string;
  jobId: string;
  prompt: string;
}

export function VideoPlayer({ videoUrl, jobId, prompt }: VideoPlayerProps) {
  return (
    <article
      className="bg-white rounded-lg shadow-md p-6"
      role="region"
      aria-label="Completed dream video"
    >
      <div className="space-y-4">
        <div>
          <p className="text-neutral-800 italic bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-medium text-center">
            &quot;{prompt}&quot;
          </p>
        </div>

        <div className="bg-black rounded-lg overflow-hidden mx-auto" style={{ maxWidth: '400px', maxHeight: 'calc(100vh - 300px)', aspectRatio: '9 / 16' }}>
          <video
            controls
            className="w-full h-full object-contain"
            preload="metadata"
            aria-label={`Dream video: ${prompt}`}
          >
            <source src={videoUrl} type="video/mp4" />
            <p>
              Your browser does not support the video tag.
              <a href={videoUrl} download={`dream-video-${jobId}.mp4`} className="text-primary-600 underline">
                Download the video instead
              </a>
            </p>
          </video>
        </div>
      </div>
    </article>
  );
}
