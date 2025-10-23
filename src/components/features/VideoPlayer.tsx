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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Your Dream Video</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Your dream:</p>
          <p className="text-gray-800 italic">&quot;{prompt}&quot;</p>
        </div>

        <div className="bg-black rounded-lg overflow-hidden max-w-full mx-auto" style={{ maxHeight: 'calc(100vh - 300px)', aspectRatio: '16 / 9' }}>
          <video
            controls
            className="w-full h-full object-contain"
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleDownload} className="flex-1">
            Download Video
          </Button>
        </div>

        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Job ID:</span>
            <span className="font-mono text-gray-800">{jobId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
