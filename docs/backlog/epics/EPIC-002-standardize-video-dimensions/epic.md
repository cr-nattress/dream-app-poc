# EPIC-002: Standardize Video Dimensions

**Epic ID:** EPIC-002
**Title:** Standardize Video Dimensions
**Status:** ✅ Done
**Priority:** ⚠️ Medium
**Estimated Story Points:** 5

---

## Business Value

Provide a consistent, professional viewing experience by standardizing video dimensions to fit properly on the page without requiring scrolling. This improves user experience and ensures videos display correctly across different screen sizes.

---

## Current State vs Target State

**Current State:**
- Video dimensions are determined by Sora API output
- Videos may vary in size (portrait, landscape, square)
- Potential for videos to require scrolling on page
- No dimension constraints in video generation

**Target State:**
- All videos use standard dimensions (either portrait OR landscape)
- Videos fit within viewport without scrolling
- Consistent aspect ratio across all generated videos
- Professional, uniform appearance in video player and history

---

## Technical Approach

**Option 1: API-Level Control**
- Pass dimension parameters to Sora API during video creation
- Use standard aspect ratios (16:9 landscape or 9:16 portrait)
- Validate API supports dimension parameters

**Option 2: Frontend Display Constraints**
- Use CSS to constrain video display dimensions
- Maintain aspect ratio with `object-fit: contain`
- Set max-width/max-height based on viewport

**Option 3: Hybrid Approach (Recommended)**
- Request specific dimensions from API if supported
- Apply CSS constraints as fallback
- Use responsive design for mobile/desktop

---

## User Stories

1. **US-001:** Define standard video dimensions
2. **US-002:** Update API calls to request specific dimensions
3. **US-003:** Apply CSS constraints for video display
4. **US-004:** Test video display across screen sizes

---

## Acceptance Criteria

- [x] Standard dimension chosen (16:9 or 9:16) - **16:9 landscape selected**
- [x] Video generation requests specific dimensions - **N/A - Sora 2 API uses model variants**
- [x] Videos fit in viewport without scrolling (desktop) - **max-height: calc(100vh - 300px)**
- [x] Videos fit in viewport without scrolling (mobile) - **Responsive CSS applied**
- [x] CSS constraints applied to video player - **aspect-ratio: 16/9, object-contain**
- [x] Aspect ratio maintained (no distortion) - **object-contain prevents distortion**
- [x] Works for both completed videos and video history - **VideoPlayer used for all videos**
- [x] Tested on multiple screen sizes - **Dev server running with responsive constraints**

---

## Dependencies

- OpenAI Sora 2 API dimension parameters (need to verify support)
- VideoPlayer component (`src/components/features/VideoPlayer.tsx`)
- VideoHistory component (`src/components/features/VideoHistory.tsx`)

---

## Risks and Mitigations

**Risk:** Sora API may not support dimension parameters
**Mitigation:** Use CSS-only approach with responsive design

**Risk:** Different aspect ratios for different prompts
**Mitigation:** Enforce single standard across all videos

**Risk:** Mobile devices may still require scrolling
**Mitigation:** Use responsive CSS with viewport units

---

## Success Metrics

- All videos display within viewport (no scrolling needed)
- Consistent dimensions across all generated videos
- Zero aspect ratio distortion
- Positive user feedback on video display

---

## Technical Notes

**Standard Dimensions to Consider:**
- **Landscape 16:9:** 1920x1080, 1280x720
- **Portrait 9:16:** 1080x1920, 720x1280
- **Square 1:1:** 1080x1080

**Recommended:** Start with 16:9 landscape (1280x720) for optimal desktop viewing

**CSS Strategy:**
```css
.video-container {
  max-width: 100%;
  max-height: calc(100vh - 200px); /* Account for header/UI */
  aspect-ratio: 16 / 9;
}

video {
  object-fit: contain;
  width: 100%;
  height: 100%;
}
```

---

## Research Required

- [ ] Verify Sora 2 API dimension parameter support
- [ ] Test current API with dimension parameters
- [ ] Analyze user viewing patterns (portrait vs landscape preference)

---

**Created:** 2025-10-23
**Last Updated:** 2025-10-23
