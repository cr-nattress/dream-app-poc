# Epic 3: Basic Frontend UI

## Overview
Build a simple, functional Next.js frontend that allows users to enter dream descriptions, generate videos, monitor progress, and play completed videos. Uses local storage to track video history.

## Goals
- Create clean, intuitive UI for dream input
- Implement video generation flow with status updates
- Build video player for completed videos
- Add job history with local storage
- Keep components small and reusable
- Ensure responsive design for mobile and desktop

## User Stories

### US-3.1: Dream Input Form
**As a** user
**I want** to enter a description of my dream
**So that** I can generate a video of it

**Acceptance Criteria:**
- Text area for dream description input
- Character counter (10-500 characters)
- Submit button to generate video
- Button disabled when input invalid
- Clear visual feedback for validation errors
- Form clears after successful submission

**Tasks:**
- [ ] Create `/components/features/DreamInput.tsx`
- [ ] Add textarea with placeholder text
- [ ] Implement character counter
- [ ] Add validation (min/max length)
- [ ] Style with Tailwind CSS
- [ ] Add loading state during submission
- [ ] Show error messages inline

**Component Interface:**
```typescript
interface DreamInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}
```

**UI Mockup:**
```
┌──────────────────────────────────────────┐
│ Describe Your Dream                       │
├──────────────────────────────────────────┤
│ ┌────────────────────────────────────┐   │
│ │ Enter your dream description...    │   │
│ │                                    │   │
│ │                                    │   │
│ └────────────────────────────────────┘   │
│ 150 / 500 characters                     │
│                                          │
│ [ Generate Dream Video ]                 │
└──────────────────────────────────────────┘
```

---

### US-3.2: Video Generation Status Display
**As a** user
**I want** to see the status of my video generation
**So that** I know when it's ready

**Acceptance Criteria:**
- Display current status (pending, processing, completed)
- Show progress indicator while generating
- Poll status every 5 seconds during generation
- Automatically stop polling when complete or failed
- Show estimated time remaining (if available)
- Display errors clearly

**Tasks:**
- [ ] Create `/components/features/VideoStatus.tsx`
- [ ] Implement status polling with useEffect
- [ ] Add progress bar or spinner
- [ ] Display status messages
- [ ] Add auto-refresh logic
- [ ] Handle completion and error states
- [ ] Add cancel/abort option

**Component Interface:**
```typescript
interface VideoStatusProps {
  jobId: string;
  onComplete: (videoUrl: string) => void;
  onError: (error: string) => void;
}
```

**Status States:**
```typescript
type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';

const statusMessages = {
  pending: 'Initializing video generation...',
  processing: 'Creating your dream video...',
  completed: 'Video ready!',
  failed: 'Generation failed'
};
```

**UI Mockup:**
```
┌──────────────────────────────────────────┐
│ Generating Video                          │
├──────────────────────────────────────────┤
│ Status: Processing                        │
│ ████████████░░░░░░░░ 60%                  │
│                                          │
│ This usually takes 3-5 minutes...        │
│                                          │
│ Job ID: video_abc123                     │
└──────────────────────────────────────────┘
```

---

### US-3.3: Video Player Component
**As a** user
**I want** to watch my generated dream video
**So that** I can see the result

**Acceptance Criteria:**
- HTML5 video player with controls
- Play/pause functionality
- Volume control
- Full screen option
- Download button
- Responsive sizing

**Tasks:**
- [ ] Create `/components/features/VideoPlayer.tsx`
- [ ] Implement HTML5 video element
- [ ] Add custom controls if needed
- [ ] Add download functionality
- [ ] Style player container
- [ ] Handle video loading errors
- [ ] Add poster image/placeholder

**Component Interface:**
```typescript
interface VideoPlayerProps {
  videoUrl: string;
  jobId: string;
  prompt: string;
}
```

**UI Mockup:**
```
┌──────────────────────────────────────────┐
│ Your Dream Video                          │
├──────────────────────────────────────────┤
│ ┌────────────────────────────────────┐   │
│ │                                    │   │
│ │        [VIDEO PLAYER]              │   │
│ │                                    │   │
│ └────────────────────────────────────┘   │
│ ▶ ━━━━━━━━━━━━━━━━━━ 🔊 ⛶             │
│                                          │
│ "A serene dream of flying..."            │
│ [ Download Video ]                       │
└──────────────────────────────────────────┘
```

---

### US-3.4: Video History with Local Storage
**As a** user
**I want** to see my previously generated videos
**So that** I can access them again

**Acceptance Criteria:**
- List of previous video job IDs stored in local storage
- Dropdown or list showing video history
- Click to load and play previous videos
- Show prompt text for each video
- Option to clear history
- Persist across browser sessions

**Tasks:**
- [ ] Create `/lib/storage.ts` for local storage utilities
- [ ] Create `/components/features/VideoHistory.tsx`
- [ ] Implement save/load from localStorage
- [ ] Create list/dropdown UI
- [ ] Add click handlers to load videos
- [ ] Implement clear history function
- [ ] Handle empty state

**Storage Interface:**
```typescript
interface VideoHistoryItem {
  jobId: string;
  prompt: string;
  createdAt: string;
  status: VideoStatus;
}

// lib/storage.ts
export function saveVideoToHistory(item: VideoHistoryItem): void
export function getVideoHistory(): VideoHistoryItem[]
export function clearVideoHistory(): void
```

**UI Mockup:**
```
┌──────────────────────────────────────────┐
│ Your Dream Videos                         │
├──────────────────────────────────────────┤
│ ┌────────────────────────────────────┐   │
│ │ ▼ Select a previous dream...       │   │
│ └────────────────────────────────────┘   │
│                                          │
│ Recent Videos:                           │
│ • Flying over mountains (10/22/25)       │
│ • Swimming with dolphins (10/21/25)      │
│ • Dancing in the clouds (10/20/25)       │
│                                          │
│ [ Clear History ]                        │
└──────────────────────────────────────────┘
```

---

### US-3.5: Main Page Layout
**As a** user
**I want** an organized, clean interface
**So that** I can easily navigate the application

**Acceptance Criteria:**
- Clear page title and description
- Logical flow: Input → Status → Video
- Responsive layout (mobile and desktop)
- Consistent spacing and typography
- Loading states for all async operations
- Error boundaries for graceful failure

**Tasks:**
- [ ] Create `/app/page.tsx` main page component
- [ ] Implement responsive layout
- [ ] Add header with app title
- [ ] Organize components in logical sections
- [ ] Add global loading indicator
- [ ] Implement error boundary
- [ ] Style with Tailwind CSS

**Page Structure:**
```typescript
export default function HomePage() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  return (
    <main>
      <Header />
      <DreamInput onSubmit={handleSubmit} />
      {currentJobId && <VideoStatus jobId={currentJobId} />}
      {videoUrl && <VideoPlayer videoUrl={videoUrl} />}
      <VideoHistory onSelect={handleHistorySelect} />
    </main>
  );
}
```

---

### US-3.6: API Integration Layer
**As a** developer
**I want** clean API client functions in the frontend
**So that** components don't handle fetch logic directly

**Acceptance Criteria:**
- Type-safe API client functions
- Error handling and retries
- Loading state management
- Response validation

**Tasks:**
- [ ] Create `/lib/api-client.ts`
- [ ] Implement `createVideo()` function
- [ ] Implement `getVideoStatus()` function
- [ ] Implement `getVideo()` function
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Add JSDoc comments

**API Client Interface:**
```typescript
// lib/api-client.ts
export async function createVideo(prompt: string): Promise<CreateVideoResponse>
export async function getVideoStatus(jobId: string): Promise<VideoStatusResponse>
export async function getVideoUrl(jobId: string): string

export class ApiError extends Error {
  constructor(public status: number, message: string)
}
```

---

### US-3.7: Reusable UI Components
**As a** developer
**I want** small, reusable UI components
**So that** the codebase is maintainable

**Acceptance Criteria:**
- Button component with variants
- Input/Textarea component
- Loading spinner component
- Error message component
- Card/Container component

**Tasks:**
- [ ] Create `/components/ui/Button.tsx`
- [ ] Create `/components/ui/Input.tsx`
- [ ] Create `/components/ui/Spinner.tsx`
- [ ] Create `/components/ui/ErrorMessage.tsx`
- [ ] Create `/components/ui/Card.tsx`
- [ ] Add TypeScript props interfaces
- [ ] Style with Tailwind CSS

**Component Examples:**
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

// components/ui/Spinner.tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}
```

---

## Definition of Done
- [ ] User can enter dream description and generate video
- [ ] Status updates appear every 5 seconds
- [ ] Completed videos can be played
- [ ] Video history is saved in local storage
- [ ] UI is responsive on mobile and desktop
- [ ] All components are properly typed
- [ ] Loading and error states are handled
- [ ] Code follows React best practices
- [ ] No excessive file sizes (components < 200 lines)

## Dependencies
- Epic 1: Project Setup & Infrastructure
- Epic 2: Core Netlify Functions

## Estimated Effort
8-10 hours

## Technical Notes

### State Management
- Use React useState for local component state
- Use useEffect for polling status
- Consider React Context for global state if needed
- Keep state close to where it's used

### Styling
- Use Tailwind CSS for utility-first styling
- Keep inline styles minimal
- Use consistent spacing scale (4px grid)
- Ensure dark mode compatibility if desired

### Performance
- Debounce input validation
- Cancel polling when component unmounts
- Lazy load video player
- Optimize re-renders with React.memo if needed

### Accessibility
- Add ARIA labels to form inputs
- Ensure keyboard navigation works
- Add alt text for images
- Test with screen readers

### Local Storage Schema
```typescript
const STORAGE_KEY = 'dream-videos-history';

interface StoredData {
  version: 1;
  videos: VideoHistoryItem[];
}
```
