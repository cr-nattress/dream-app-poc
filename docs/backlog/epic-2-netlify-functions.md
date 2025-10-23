# Epic 2: Core Netlify Functions

## Overview
Implement serverless functions to interact with the Sora 2 API and manage video storage using Netlify Blob storage. These functions handle video creation, status polling, and video retrieval.

## Goals
- Create Netlify Function to submit video generation requests to Sora 2 API
- Implement status checking function for video generation jobs
- Build video retrieval function from Netlify Blob storage
- Ensure proper error handling and logging
- Keep functions small and focused (single responsibility)

## User Stories

### US-2.1: Create Video Function
**As a** frontend application
**I want** to submit a dream description to create a video
**So that** the Sora 2 API generates a video and stores it in Netlify Blob

**Acceptance Criteria:**
- POST endpoint `/api/create-video` accepts dream prompt
- Function formats prompt for optimal Sora 2 results
- Function calls Sora 2 API to create video job
- Function returns job ID to frontend
- Function handles API errors gracefully
- Function validates input parameters

**Tasks:**
- [ ] Create `/netlify/functions/create-video.ts`
- [ ] Implement prompt validation (max length, required field)
- [ ] Format dream prompt with cinematic enhancements
- [ ] Call OpenAI Sora 2 API endpoint
- [ ] Return job ID and initial status
- [ ] Add error handling with descriptive messages
- [ ] Add logging for debugging

**Function Signature:**
```typescript
// Request
POST /api/create-video
{
  "prompt": "A serene dream of flying over mountains at sunset"
}

// Response (Success)
{
  "jobId": "video_abc123",
  "status": "pending",
  "createdAt": "2025-10-22T21:00:00Z"
}

// Response (Error)
{
  "error": "Invalid prompt: must be between 10 and 500 characters"
}
```

**Implementation Notes:**
- Enhance prompts with "cinematic dream sequence" prefix
- Use `sora-2` model for POC (faster, cheaper)
- Set default duration to 10 seconds
- Set default resolution to 720p
- Validate OPENAI_API_KEY exists

**Code Structure:**
```typescript
// netlify/functions/create-video.ts
import { Handler } from '@netlify/functions';
import { createVideoJob } from '../../lib/sora-api';
import { validatePrompt } from '../../lib/validators';

export const handler: Handler = async (event) => {
  // Implementation split into small helper functions
};
```

---

### US-2.2: Check Video Status Function
**As a** frontend application
**I want** to check the status of a video generation job
**So that** I know when the video is ready for download

**Acceptance Criteria:**
- GET endpoint `/api/video-status/:jobId` accepts job ID
- Function queries Sora 2 API for job status
- Function returns current status (pending/processing/completed/failed)
- When completed, function downloads video from OpenAI
- Function stores completed video in Netlify Blob with job ID as filename
- Function returns blob URL for completed videos
- Function caches status to reduce API calls

**Tasks:**
- [ ] Create `/netlify/functions/video-status.ts`
- [ ] Implement job ID validation
- [ ] Call OpenAI status endpoint
- [ ] Check if video already exists in Netlify Blob (cache)
- [ ] Download completed video from OpenAI
- [ ] Store video in Netlify Blob storage
- [ ] Return status with download URL when ready
- [ ] Handle rate limiting gracefully

**Function Signature:**
```typescript
// Request
GET /api/video-status/video_abc123

// Response (Pending)
{
  "jobId": "video_abc123",
  "status": "processing",
  "progress": 45
}

// Response (Completed)
{
  "jobId": "video_abc123",
  "status": "completed",
  "videoUrl": "https://blob.storage.netlify.com/...",
  "completedAt": "2025-10-22T21:05:00Z"
}

// Response (Failed)
{
  "jobId": "video_abc123",
  "status": "failed",
  "error": "Video generation failed: content policy violation"
}
```

**Implementation Notes:**
- First check Netlify Blob storage for existing video
- Only call OpenAI API if video not in blob storage
- Use exponential backoff for retries
- Store metadata alongside video in blob

---

### US-2.3: Get Video Function
**As a** frontend application
**I want** to retrieve a video from storage by job ID
**So that** users can re-download or replay their videos

**Acceptance Criteria:**
- GET endpoint `/api/get-video/:jobId` returns video file
- Function retrieves video from Netlify Blob storage
- Function returns appropriate Content-Type headers
- Function handles missing videos gracefully
- Function supports video streaming (range requests)

**Tasks:**
- [ ] Create `/netlify/functions/get-video.ts`
- [ ] Implement job ID validation
- [ ] Retrieve video from Netlify Blob by job ID
- [ ] Set correct Content-Type: video/mp4
- [ ] Set Content-Disposition for download
- [ ] Handle 404 for missing videos
- [ ] Add caching headers

**Function Signature:**
```typescript
// Request
GET /api/get-video/video_abc123

// Response (Success)
HTTP 200 OK
Content-Type: video/mp4
Content-Disposition: attachment; filename="dream-video_abc123.mp4"
[binary video data]

// Response (Not Found)
HTTP 404 Not Found
{
  "error": "Video not found for job ID: video_abc123"
}
```

**Implementation Notes:**
- Use streaming for large video files
- Add ETag for caching
- Support range requests for video seeking
- Consider implementing signed URLs for security

---

### US-2.4: Shared API Client Library
**As a** developer
**I want** reusable API client functions
**So that** Netlify functions don't duplicate code

**Acceptance Criteria:**
- Shared library for OpenAI Sora 2 API calls
- Shared library for Netlify Blob operations
- Error handling utilities
- Logging utilities
- Type-safe interfaces

**Tasks:**
- [ ] Create `/lib/sora-api.ts` for OpenAI API client
- [ ] Create `/lib/blob-storage.ts` for Netlify Blob operations
- [ ] Create `/lib/errors.ts` for error handling
- [ ] Create `/lib/logger.ts` for logging
- [ ] Add JSDoc comments to all functions

**Library Structure:**
```typescript
// lib/sora-api.ts
export async function createVideoJob(prompt: string): Promise<CreateVideoResponse>
export async function getVideoStatus(jobId: string): Promise<VideoStatusResponse>
export async function downloadVideo(jobId: string): Promise<Buffer>

// lib/blob-storage.ts
export async function storeVideo(jobId: string, videoData: Buffer): Promise<string>
export async function getVideo(jobId: string): Promise<Buffer | null>
export async function videoExists(jobId: string): Promise<boolean>

// lib/errors.ts
export class VideoGenerationError extends Error
export class StorageError extends Error
export function handleApiError(error: unknown): ErrorResponse
```

---

### US-2.5: Input Validation & Sanitization
**As a** developer
**I want** robust input validation
**So that** invalid requests are rejected before calling external APIs

**Acceptance Criteria:**
- Validate all function inputs
- Sanitize user-provided prompts
- Check for required environment variables
- Validate job ID format
- Return clear error messages

**Tasks:**
- [ ] Create `/lib/validators.ts`
- [ ] Implement prompt validation (length, content)
- [ ] Implement job ID format validation
- [ ] Add environment variable checks
- [ ] Create validation error responses

**Validation Rules:**
```typescript
// Prompt validation
- Min length: 10 characters
- Max length: 500 characters
- No empty strings or only whitespace
- No special characters that might break API

// Job ID validation
- Format: video_[alphanumeric]
- Length: 10-50 characters

// Environment variables
- OPENAI_API_KEY: Required, starts with "sk-"
- NETLIFY_BLOB_TOKEN: Required
```

---

## Definition of Done
- [ ] All three Netlify functions are implemented and working
- [ ] Functions can be called locally via `netlify dev`
- [ ] Error handling covers common failure scenarios
- [ ] Shared libraries reduce code duplication
- [ ] All functions have proper TypeScript types
- [ ] Functions log important events for debugging
- [ ] Input validation prevents invalid requests
- [ ] Videos are successfully stored in Netlify Blob
- [ ] Functions can be tested independently

## Dependencies
- Epic 1: Project Setup & Infrastructure (must be complete)

## Estimated Effort
6-8 hours

## Technical Notes

### Sora 2 API Endpoints
```
POST https://api.openai.com/v1/videos
GET  https://api.openai.com/v1/videos/{job_id}
GET  https://api.openai.com/v1/videos/{job_id}/content
```

### Netlify Blob Storage
```typescript
import { getStore } from '@netlify/blobs';

const store = getStore('videos');
await store.set(jobId, videoBuffer);
const video = await store.get(jobId);
```

### Error Handling Strategy
- Return 400 for invalid input
- Return 404 for missing resources
- Return 500 for server/API errors
- Return 503 for rate limiting
- Always include error message in response

### Security Considerations
- Never expose OPENAI_API_KEY to frontend
- Validate all inputs server-side
- Rate limit function calls if needed
- Use CORS headers appropriately
