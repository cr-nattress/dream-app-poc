# EPIC-003: Display Dream Videos List

**Epic ID:** EPIC-003
**Title:** Display Dream Videos List with Clickable Links
**Status:** ✅ Done
**Priority:** 🔴 High
**Estimated Story Points:** 8

---

## Business Value

Enhance the "Your Dream Videos" section by displaying each completed video as a clickable link, ordered by completion time. This provides users with easy access to their video history and improves navigation through previously generated content.

---

## Current State vs Target State

**Current State:**
- VideoHistory component shows basic video history
- Limited interaction with history items
- Unclear visual hierarchy
- No direct "view video" links in list

**Target State:**
- Each video in "Your Dream Videos" section has a clickable link
- Link text shows prompt preview or video title
- Videos ordered by completedAt descending (newest first)
- Clicking link navigates to or displays the video
- Visual indication of current/selected video
- Professional, scannable list design

---

## Technical Approach

1. Update VideoHistory component to display as linked list
2. Add click handlers to load/display selected video
3. Implement ordering by completedAt descending
4. Add visual styling for active/selected video
5. Consider thumbnail previews (optional enhancement)
6. Add loading states and error handling

---

## User Stories

1. **US-001:** Display videos as clickable list items
2. **US-002:** Order list by completion timestamp (descending)
3. **US-003:** Navigate to video on click
4. **US-004:** Show visual indication of active video
5. **US-005:** Display prompt preview in list item

---

## Acceptance Criteria

- [x] Each completed video appears as clickable link in "Your Dream Videos" - **Button elements with onClick handlers (VideoHistory.tsx:65-72)**
- [x] Videos ordered by completedAt (newest at top) - **getCompletedVideos() sorts descending (storage.ts:92-96)**
- [x] Clicking video link displays/navigates to that video - **onSelect callback triggers video display**
- [x] Active/selected video has visual indicator - **Blue border and background when currentJobId matches (VideoHistory.tsx:68-70)**
- [x] Prompt text shown in list (truncated if long) - **CSS truncate class applied (VideoHistory.tsx:76)**
- [x] completedAt timestamp displayed in friendly format - **formatDate() shows "Month DD, YYYY HH:MM" (VideoHistory.tsx:32-41)**
- [x] List updates when new video completes - **useEffect with currentJobId dependency (VideoHistory.tsx:21-23)**
- [x] Works on mobile and desktop - **Responsive design with w-full and flex layouts**
- [x] Smooth transitions when switching videos - **Tailwind transition-colors (VideoHistory.tsx:67)**

---

## Dependencies

- EPIC-001 (Local Storage Management) - ensures proper data structure
- VideoHistory component (`src/components/features/VideoHistory.tsx`)
- VideoPlayer component (`src/components/features/VideoPlayer.tsx`)
- Local storage utilities

---

## Design Considerations

**List Item Format:**
```
┌─────────────────────────────────────────┐
│ 🎬 A cinematic dream of flying...      │
│    Completed: 2 minutes ago             │
│    👁️ View Video                        │
└─────────────────────────────────────────┘
```

**Alternative Format:**
```
┌─────────────────────────────────────────┐
│ [Thumbnail] A cinematic dream of...    │
│             Oct 23, 2025 - 5:38 PM     │
└─────────────────────────────────────────┘
```

---

## Risks and Mitigations

**Risk:** Large number of videos causes performance issues
**Mitigation:** Already limited to 50 videos; implement virtualization if needed

**Risk:** Long prompts break layout
**Mitigation:** Truncate with ellipsis and show full text on hover

**Risk:** Video loading slow when switching between history items
**Mitigation:** Show loading spinner; consider preloading thumbnails

---

## Success Metrics

- Users can access any completed video within 2 clicks
- Video list loads in < 500ms
- Zero layout breaks with long prompts
- Positive user feedback on navigation

---

## Technical Notes

**Ordering Implementation:**
```typescript
const sortedVideos = videos
  .filter(v => v.status === 'completed')
  .sort((a, b) =>
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
```

**Link/Button Component:**
```tsx
<button
  onClick={() => handleSelectVideo(video)}
  className={`video-list-item ${isActive ? 'active' : ''}`}
>
  <div className="prompt-preview">{truncate(video.prompt, 50)}</div>
  <div className="timestamp">{formatRelativeTime(video.completedAt)}</div>
</button>
```

**Time Formatting:**
- Use relative time for recent videos ("2 minutes ago", "1 hour ago")
- Use absolute time for older videos ("Oct 23, 2025 5:38 PM")
- Consider date-fns or similar library for formatting

---

## Optional Enhancements (Future)

- [ ] Video thumbnails in list
- [ ] Search/filter videos by prompt text
- [ ] Favorite/star videos
- [ ] Delete individual videos from history
- [ ] Share video link functionality
- [ ] Export video history as JSON

---

**Created:** 2025-10-23
**Last Updated:** 2025-10-23
