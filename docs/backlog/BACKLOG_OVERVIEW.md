# Dream Video POC - Backlog Overview

**Created:** 2025-10-23
**Total Epics:** 4
**Total Estimated Story Points:** 23

---

## Quick Summary

This backlog contains enhancements for the Dream Video POC application focusing on:
1. Improving data consistency in local storage
2. Standardizing video display dimensions
3. Enhancing video history navigation
4. Optimizing API polling frequency

---

## Epic Summary

| Epic ID | Title | Priority | Story Points | Status |
|---------|-------|----------|--------------|--------|
| EPIC-001 | Local Storage Management for Completed Videos | 🔴 High | 8 | 📋 To Do |
| EPIC-002 | Standardize Video Dimensions | ⚠️ Medium | 5 | 📋 To Do |
| EPIC-003 | Display Dream Videos List | 🔴 High | 8 | 📋 To Do |
| EPIC-004 | Update Polling Frequency | 💡 Low | 2 | 📋 To Do |

---

## Recommended Implementation Order

### Phase 1: Data Foundation (Week 1)
**Goal:** Ensure data consistency and integrity

1. **EPIC-004: Update Polling Frequency** ⚡ Quick Win
   - **Effort:** 2 story points (~30 minutes)
   - **Why First:** Simple change, immediate value, reduces API load
   - **Files:** `src/components/features/VideoStatus.tsx`

2. **EPIC-001: Local Storage Management** 🎯 High Priority
   - **Effort:** 8 story points (~1 day)
   - **Why Second:** Foundation for other features, prevents data issues
   - **Files:** `src/lib/storage.ts`
   - **Dependencies:** None
   - **Deliverable:** Clean, deduplicated video storage

### Phase 2: User Experience (Week 2)
**Goal:** Improve video viewing and navigation

3. **EPIC-003: Display Dream Videos List** 🎯 High Priority
   - **Effort:** 8 story points (~1 day)
   - **Why Third:** Depends on EPIC-001 for clean data
   - **Files:** `src/components/features/VideoHistory.tsx`, `src/app/page.tsx`
   - **Dependencies:** EPIC-001
   - **Deliverable:** Clickable, ordered video list

4. **EPIC-002: Standardize Video Dimensions** ⚠️ Medium Priority
   - **Effort:** 5 story points (~4-6 hours)
   - **Why Last:** Research needed, less critical than data fixes
   - **Files:** `src/lib/sora-api.ts`, `src/components/features/VideoPlayer.tsx`
   - **Dependencies:** Need to verify Sora API capabilities
   - **Deliverable:** Consistent video dimensions

---

## Implementation Sprint Plan

### Sprint 1 (Week 1): Foundation
**Goal:** Data integrity and quick wins
**Story Points:** 10

**Day 1:**
- ✅ EPIC-004: Update polling to 10 seconds (30 min)
- 🏗️ EPIC-001: Local storage management (6 hours)

**Day 2:**
- ✅ EPIC-001: Complete and test (2 hours)
- 📝 Documentation updates

### Sprint 2 (Week 2): Enhancement
**Goal:** Improved UX and consistency
**Story Points:** 13

**Day 1-2:**
- 🏗️ EPIC-003: Display dream videos list (1 day)

**Day 3:**
- 🔬 EPIC-002: Research Sora API dimensions
- 🏗️ EPIC-002: Implement dimension standardization (4-6 hours)

---

## Dependencies Graph

```
EPIC-004 (Polling)
    ↓ (no dependencies)
    ✅ Can start immediately

EPIC-001 (Storage)
    ↓ (no dependencies)
    ✅ Can start immediately

EPIC-003 (Display List)
    ↓ (depends on EPIC-001)
    ⚠️ Start after EPIC-001 complete

EPIC-002 (Dimensions)
    ↓ (no dependencies, but research needed)
    💡 Can start anytime, best done last
```

---

## Detailed Epic Breakdown

### EPIC-001: Local Storage Management for Completed Videos
**Priority:** 🔴 High | **Effort:** 8 points

**What:** Ensure completed videos stored without duplicates, ordered by completedAt descending.

**Why:** Data consistency is critical for reliable history tracking.

**Files Affected:**
- `src/lib/storage.ts` - Add deduplication and sorting logic

**Key Requirements:**
- No duplicate jobId entries
- Ordered by completedAt descending
- Maintain data structure:
  ```json
  {
    "jobId": "video_68f9bf...",
    "status": "completed",
    "videoUrl": "/api/get-video/...",
    "completedAt": "2025-10-23T05:38:30.047Z"
  }
  ```

**User Stories:**
1. Store completed videos without duplicates
2. Order videos by completion timestamp
3. Add utility functions for video array management

---

### EPIC-002: Standardize Video Dimensions
**Priority:** ⚠️ Medium | **Effort:** 5 points

**What:** Keep video dimensions consistent (standard portrait or landscape) to fit page without scrolling.

**Why:** Professional appearance, better UX, consistent layout.

**Files Affected:**
- `src/lib/sora-api.ts` - Add dimension parameters to API calls
- `src/components/features/VideoPlayer.tsx` - CSS constraints
- `src/components/features/VideoHistory.tsx` - Thumbnail sizing

**Key Requirements:**
- Choose standard aspect ratio (16:9 landscape recommended)
- Videos fit viewport without scrolling
- Maintain aspect ratio (no distortion)

**Research Needed:**
- ❓ Does Sora 2 API support dimension parameters?
- ❓ What dimensions are optimal for target use case?

**User Stories:**
1. Define standard video dimensions
2. Update API calls to request specific dimensions
3. Apply CSS constraints for video display
4. Test video display across screen sizes

---

### EPIC-003: Display Dream Videos List
**Priority:** 🔴 High | **Effort:** 8 points

**What:** Display each video in "Your Dream Videos" as clickable link, ordered by completedAt descending.

**Why:** Easy access to video history, improved navigation.

**Files Affected:**
- `src/components/features/VideoHistory.tsx` - Display as linked list
- `src/app/page.tsx` - Handle video selection

**Key Requirements:**
- Clickable links to view each video
- Ordered by completedAt descending (newest first)
- Visual indication of active/selected video
- Show prompt preview and timestamp

**User Stories:**
1. Display videos as clickable list items
2. Order list by completion timestamp (descending)
3. Navigate to video on click
4. Show visual indication of active video
5. Display prompt preview in list item

---

### EPIC-004: Update Polling Frequency
**Priority:** 💡 Low | **Effort:** 2 points | ⚡ **Quick Win**

**What:** Change polling interval from 5 seconds to 10 seconds.

**Why:** Reduce API load and costs by 50%.

**Files Affected:**
- `src/components/features/VideoStatus.tsx` - Change POLLING_INTERVAL constant

**Key Requirements:**
- Poll every 10 seconds (instead of 5)
- Still detect completion promptly
- No negative UX impact

**User Stories:**
1. Change polling interval to 10 seconds

---

## Testing Strategy

### EPIC-001 Testing
- [ ] Unit tests for deduplication logic
- [ ] Unit tests for sorting by completedAt
- [ ] Integration test: Save multiple videos with same jobId
- [ ] Manual test: Verify localStorage structure

### EPIC-002 Testing
- [ ] Test video display on desktop (1920x1080, 1366x768)
- [ ] Test video display on mobile (375x667, 414x896)
- [ ] Verify no scrolling required
- [ ] Check aspect ratio maintained

### EPIC-003 Testing
- [ ] Click video link loads correct video
- [ ] Active video visually indicated
- [ ] List ordered correctly (newest first)
- [ ] Long prompts truncated properly
- [ ] Works on mobile and desktop

### EPIC-004 Testing
- [ ] Verify 10-second interval with browser devtools
- [ ] Confirm completion still detected
- [ ] Check no polling after completion

---

## Success Criteria

**EPIC-001:** ✅ Zero duplicate jobIds in localStorage
**EPIC-002:** ✅ All videos fit viewport without scrolling
**EPIC-003:** ✅ Users can access any video within 2 clicks
**EPIC-004:** ✅ API requests reduced by 50%

---

## Risk Assessment

| Epic | Risk Level | Primary Risk | Mitigation |
|------|-----------|--------------|------------|
| EPIC-001 | 🟢 Low | Breaking existing storage | Backward compatibility |
| EPIC-002 | 🟡 Medium | API may not support dimensions | CSS fallback |
| EPIC-003 | 🟢 Low | Performance with many videos | Already limited to 50 |
| EPIC-004 | 🟢 Low | Users feel less responsive | 10s still acceptable |

---

## Technical Debt

After implementing these epics, consider addressing:
- [ ] Add unit tests for all new storage logic
- [ ] Add E2E tests for video history interaction
- [ ] Consider virtualizing video list for performance
- [ ] Add analytics to track video viewing patterns
- [ ] Implement video thumbnail generation

---

## Future Enhancements (Not in Scope)

- Search/filter videos by prompt
- Delete individual videos
- Favorite/star videos
- Share video functionality
- Export history as JSON
- Video thumbnails in list
- WebSocket for real-time updates
- Exponential backoff for polling

---

## Quick Start

To begin implementation:

1. **Start with EPIC-004** (quick win, ~30 min)
   ```bash
   # Edit src/components/features/VideoStatus.tsx
   # Change POLLING_INTERVAL from 5000 to 10000
   ```

2. **Then EPIC-001** (foundation, ~1 day)
   ```bash
   # Edit src/lib/storage.ts
   # Add deduplication and sorting logic
   ```

3. **Then EPIC-003** (depends on EPIC-001, ~1 day)
   ```bash
   # Edit src/components/features/VideoHistory.tsx
   # Add clickable links and styling
   ```

4. **Finally EPIC-002** (research + implement, ~0.5 day)
   ```bash
   # Research Sora API dimensions
   # Update src/lib/sora-api.ts and CSS
   ```

---

## Questions?

- **For EPIC details:** See individual epic files in `backlog/epics/EPIC-XXX/`
- **For architecture:** See `README.md` and `docs/`
- **For API details:** See `src/lib/sora-api.ts`

---

**Backlog Owner:** Development Team
**Last Updated:** 2025-10-23
**Next Review:** After Sprint 1 completion
