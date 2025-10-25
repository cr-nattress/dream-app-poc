/**
 * Video compression utilities using FFmpeg
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { logger } from './logger';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoaded = false;

/**
 * Get or initialize FFmpeg instance
 */
async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance;
  }

  ffmpegInstance = new FFmpeg();

  // Load FFmpeg core
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegLoaded = true;
  return ffmpegInstance;
}

export interface CompressionOptions {
  crf?: number; // Quality: 18-23 recommended (higher = smaller file, lower quality)
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow';
  maxDimension?: number; // Scale down if larger than this
  audioBitrate?: string; // Audio bitrate (e.g., '64k', '96k')
}

/**
 * Compress a video buffer using FFmpeg
 *
 * @param videoBuffer - Input video as Buffer
 * @param options - Compression options
 * @returns Compressed video as Buffer
 */
export async function compressVideo(
  videoBuffer: Buffer,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const {
    crf = 23, // Sweet spot for quality/size (industry standard for web)
    preset = 'medium', // Better compression than 'fast'
    maxDimension = 854, // Match our 720p height
    audioBitrate = '64k', // Lower audio bitrate for mobile
  } = options;

  const startTime = Date.now();
  const inputSize = videoBuffer.length;

  logger.info('[Video Compressor] Starting compression', {
    inputSize,
    inputSizeKB: Math.round(inputSize / 1024),
    inputSizeMB: Math.round(inputSize / 1024 / 1024 * 100) / 100,
    crf,
    preset,
  });

  try {
    const ffmpeg = await getFFmpeg();

    // Write input file
    await ffmpeg.writeFile('input.mp4', new Uint8Array(videoBuffer));

    logger.debug('[Video Compressor] Running FFmpeg compression');

    // Compress with H.264, optimized for mobile playback
    // - CRF 23 for quality/size balance (industry standard)
    // - medium preset for better compression
    // - fastdecode tune for mobile playback
    // - AAC audio at 64k for mobile
    // - faststart for web playback
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-c:v', 'libx264',
      '-crf', crf.toString(),
      '-preset', preset,
      '-tune', 'fastdecode',
      '-vf', `scale='min(${maxDimension},iw)':min(${maxDimension},ih):force_original_aspect_ratio=decrease`,
      '-c:a', 'aac',
      '-b:a', audioBitrate,
      '-movflags', '+faststart',
      'output.mp4',
    ]);

    logger.debug('[Video Compressor] Reading compressed file');

    // Read compressed file
    const compressedData = await ffmpeg.readFile('output.mp4');
    const compressedBuffer = Buffer.from(compressedData as Uint8Array);

    // Cleanup
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile('output.mp4');

    const duration = Date.now() - startTime;
    const outputSize = compressedBuffer.length;
    const compressionRatio = ((1 - outputSize / inputSize) * 100).toFixed(1);

    logger.info('[Video Compressor] Compression complete', {
      duration,
      inputSize,
      outputSize,
      inputSizeMB: Math.round(inputSize / 1024 / 1024 * 100) / 100,
      outputSizeMB: Math.round(outputSize / 1024 / 1024 * 100) / 100,
      compressionRatio: `${compressionRatio}%`,
      savedBytes: inputSize - outputSize,
    });

    return compressedBuffer;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('[Video Compressor] Compression failed', {
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
    });
    throw new Error(`Video compression failed: ${errorMsg}`);
  }
}

/**
 * Download and compress a video from a URL
 *
 * @param url - Video URL
 * @param options - Compression options
 * @returns Compressed video as Buffer
 */
export async function downloadAndCompress(
  url: string,
  options: CompressionOptions = {}
): Promise<Buffer> {
  logger.info('[Video Compressor] Downloading video', { url });

  const startTime = Date.now();

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    const downloadDuration = Date.now() - startTime;

    logger.info('[Video Compressor] Video downloaded', {
      url,
      size: videoBuffer.length,
      sizeMB: Math.round(videoBuffer.length / 1024 / 1024 * 100) / 100,
      downloadDuration,
    });

    // Compress the downloaded video
    const compressedBuffer = await compressVideo(videoBuffer, options);

    return compressedBuffer;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('[Video Compressor] Download and compress failed', {
      url,
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - startTime,
    });
    throw new Error(`Download and compress failed: ${errorMsg}`);
  }
}
