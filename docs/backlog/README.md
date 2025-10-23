# Dream Video POC - Product Backlog

This directory contains the product backlog for Dream Video POC enhancements.

## 📂 Structure

```
docs/backlog/
├── README.md                    # This file
├── BACKLOG_OVERVIEW.md         # Comprehensive backlog overview
└── epics/
    ├── EPIC-001-local-storage-completed-videos/
    │   ├── epic.md             # Epic details
    │   └── user-stories/       # User stories (to be created)
    ├── EPIC-002-standardize-video-dimensions/
    │   ├── epic.md
    │   └── user-stories/
    ├── EPIC-003-display-dream-videos-list/
    │   ├── epic.md
    │   └── user-stories/
    ├── EPIC-004-update-polling-frequency/
    │   ├── epic.md
    │   └── user-stories/
    └── EPIC-005-dream-prompt-template/
        ├── epic.md
        └── user-stories/
```

## 🎯 Quick Reference

| Epic | Title | Priority | Effort | Status |
|------|-------|----------|--------|--------|
| [EPIC-001](epics/EPIC-001-local-storage-completed-videos/epic.md) | Local Storage Management | 🔴 High | 8 pts | ✅ Done |
| [EPIC-002](epics/EPIC-002-standardize-video-dimensions/epic.md) | Standardize Video Dimensions | ⚠️ Medium | 5 pts | ✅ Done |
| [EPIC-003](epics/EPIC-003-display-dream-videos-list/epic.md) | Display Dream Videos List | 🔴 High | 8 pts | ✅ Done |
| [EPIC-004](epics/EPIC-004-update-polling-frequency/epic.md) | Update Polling Frequency | 💡 Low | 2 pts | ✅ Done |
| [EPIC-005](epics/EPIC-005-dream-prompt-template/epic.md) | Dream Prompt Template System | 🔴 High | 13 pts | ✅ Done |

**Total Story Points:** 36 ✅ **ALL COMPLETE**

## 🚀 Getting Started

1. **Read the overview:** Start with [BACKLOG_OVERVIEW.md](BACKLOG_OVERVIEW.md)
2. **Review epics:** Read individual epic files for details
3. **Recommended order:**
   - Start with EPIC-004 (quick win, 30 min)
   - Then EPIC-001 (foundation, 1 day)
   - Then EPIC-003 (depends on EPIC-001, 1 day)
   - Finally EPIC-002 (research + implement, 0.5 day)

## 📋 Epic Summaries

### EPIC-001: Local Storage Management
**Goal:** Ensure completed videos stored without duplicates, ordered by completedAt.

**Key Changes:**
- Remove duplicate jobId entries
- Sort by completedAt descending
- Clean data structure

### EPIC-002: Standardize Video Dimensions
**Goal:** Consistent video dimensions that fit viewport without scrolling.

**Key Changes:**
- Choose standard aspect ratio (16:9 or 9:16)
- Request dimensions from Sora API
- Apply CSS constraints

### EPIC-003: Display Dream Videos List
**Goal:** Clickable video links in "Your Dream Videos" section.

**Key Changes:**
- Display as clickable list
- Order by completedAt descending
- Show prompt preview
- Visual indication of active video

### EPIC-004: Update Polling Frequency
**Goal:** Change polling from 5 seconds to 10 seconds.

**Key Changes:**
- Update POLLING_INTERVAL constant
- Reduce API load by 50%

### EPIC-005: Dream Prompt Template System
**Goal:** Transform user dream notes into cinematic dream videos using a specialized prompt template.

**Key Changes:**
- Create prompt template utility module
- Define comprehensive dream-focused template
- Replace simple enhancement with rich template system
- Add tone, mood, style, camera, and sound guidance
- Design for future dynamic configuration

## 🎨 Design Principles

1. **Data First:** Fix data consistency before UX enhancements
2. **Quick Wins:** Start with easy, high-value changes
3. **User-Centric:** Improve navigation and viewing experience
4. **Performance:** Reduce API load where possible

## 📊 Sprint Planning

### Sprint 1 (Week 1): Foundation
- EPIC-004: Polling frequency
- EPIC-001: Storage management
- **Deliverable:** Clean data, reduced API load

### Sprint 2 (Week 2): Enhancement
- EPIC-003: Video list display
- EPIC-002: Dimension standardization
- **Deliverable:** Better UX, consistent display

## ✅ Definition of Done

Each epic is considered "done" when:
- [ ] All acceptance criteria met
- [ ] Code reviewed and merged
- [ ] Tests pass (unit + integration)
- [ ] Manually tested on desktop and mobile
- [ ] Documentation updated
- [ ] Deployed to production

## 📞 Questions?

- **Backlog Overview:** [BACKLOG_OVERVIEW.md](BACKLOG_OVERVIEW.md)
- **Epic Details:** See individual `epic.md` files
- **Implementation Help:** See main project [README.md](../../README.md)

---

**Created:** 2025-10-23
**Last Updated:** 2025-10-23
