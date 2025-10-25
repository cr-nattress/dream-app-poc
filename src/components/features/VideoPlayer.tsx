'use client';

import { Button } from '../ui/Button';

export interface VideoPlayerProps {
  videoUrl: string;
  jobId: string;
  prompt: string;
}

export function VideoPlayer({ videoUrl, jobId, prompt }: VideoPlayerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `dream-video-${jobId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <article
      className="bg-white rounded-lg shadow-md p-6"
      role="region"
      aria-label="Completed dream video"
    >
      <h2 className="text-xl font-semibold mb-4" id="video-player-heading">
        Your Dream Video
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-neutral-600 mb-2 font-medium">Your dream:</p>
          <p className="text-neutral-800 italic bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-medium">
            &quot;{prompt}&quot;
          </p>
        </div>

        <div className="bg-black rounded-lg overflow-hidden mx-auto" style={{ maxWidth: '400px', maxHeight: 'calc(100vh - 300px)', aspectRatio: '9 / 16' }}>
          <video
            controls
            className="w-full h-full object-contain"
            preload="metadata"
            aria-label={`Dream video: ${prompt}`}
            aria-describedby="video-player-heading"
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

        <div className="flex space-x-3">
          <Button
            onClick={handleDownload}
            className="flex-1"
            aria-label={`Download video: ${prompt}`}
          >
            Download Video
          </Button>
        </div>

        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Job ID:</span>
            <span className="font-mono text-neutral-800 font-medium" aria-label={`Job ID: ${jobId}`}>
              {jobId}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
