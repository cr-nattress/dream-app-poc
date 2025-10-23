# EPIC-004: Update Polling Frequency

**Epic ID:** EPIC-004
**Title:** Change Video Status Polling to 10 Second Intervals
**Status:** ✅ Done
**Priority:** 💡 Low
**Estimated Story Points:** 2

---

## Business Value

Reduce API request frequency from every 5 seconds to every 10 seconds. This reduces server load, lowers costs, and provides a more reasonable polling interval while still keeping users informed of video generation progress.

---

## Current State vs Target State

**Current State:**
- Video status polled every 5 seconds
- Frequent API requests during video generation
- Higher server load and API costs

**Target State:**
- Video status polled every 10 seconds
- Reduced API request frequency (50% reduction)
- Lower server load and costs
- Still responsive enough for good user experience

---

## Technical Approach

1. Locate polling interval configuration in VideoStatus component
2. Update interval from 5000ms to 10000ms
3. Test to ensure video completion still detected promptly
4. Update any documentation mentioning polling frequency
5. Consider making interval configurable via environment variable (optional)

---

## User Stories

1. **US-001:** Change polling interval to 10 seconds

---

## Acceptance Criteria

- [x] Polling interval changed from 5 seconds to 10 seconds - **POLL_INTERVAL = 10000**
- [x] Video status updates every 10 seconds during generation - **Verified in VideoStatus.tsx:64**
- [x] Video completion detected within 10 seconds - **Working correctly**
- [x] No negative impact on user experience - **3-5 min generation time, 10s is acceptable**
- [x] Documentation updated (if applicable) - **User message updated to "every 10 seconds"**
- [x] Manual testing confirms new interval works correctly - **Tested with dev server**

---

## Dependencies

- VideoStatus component (`src/components/features/VideoStatus.tsx`)

---

## Technical Details

**File to Modify:** `src/components/features/VideoStatus.tsx`

**Current Implementation (estimated):**
```typescript
const POLLING_INTERVAL = 5000; // 5 seconds
```

**Target Implementation:**
```typescript
const POLLING_INTERVAL = 10000; // 10 seconds
```

**Alternative: Make Configurable**
```typescript
const POLLING_INTERVAL = process.env.NEXT_PUBLIC_POLLING_INTERVAL || 10000;
```

---

## Impact Analysis

**Positive Impacts:**
- ✅ 50% reduction in API requests
- ✅ Lower server costs
- ✅ Reduced database/blob storage queries
- ✅ Better for rate limiting

**Potential Concerns:**
- ⚠️ Slight delay in detecting video completion (5 seconds longer)
- ⚠️ User may perceive slower response

**Mitigation:**
- Video generation typically takes 2-5 minutes
- 10 seconds is still frequent enough for good UX
- Consider showing "last checked" timestamp to user

---

## Risks and Mitigations

**Risk:** Users feel the app is less responsive
**Mitigation:** 10 seconds is still frequent; most video generation takes minutes

**Risk:** Missing time-sensitive status updates
**Mitigation:** Video generation is inherently slow; 10s is acceptable

---

## Success Metrics

- API request volume reduced by ~50%
- No user complaints about responsiveness
- Video completion detection works correctly
- Server load reduced measurably

---

## Testing Checklist

- [x] Start video generation
- [x] Verify status updates every 10 seconds (not 5)
- [x] Verify video completion detected promptly
- [x] Check browser console for timing
- [x] Test with slow network connection
- [x] Verify no polling continues after completion

---

## Optional Enhancements

- [ ] Make polling interval configurable via env variable
- [ ] Add exponential backoff (start at 5s, increase to 10s, then 15s)
- [ ] Show "Last checked X seconds ago" indicator to user
- [ ] Add manual "Refresh Status" button for impatient users
- [ ] Use WebSocket for real-time updates (future consideration)

---

## Documentation Updates

**Files to Update:**
- [ ] README.md (if polling interval mentioned)
- [ ] Architecture documentation (if exists)
- [ ] API documentation (if exists)

---

## Rollback Plan

If issues arise, simply change interval back to 5000ms and redeploy.

---

**Created:** 2025-10-23
**Last Updated:** 2025-10-23
**Effort:** ~15-30 minutes (trivial change)
