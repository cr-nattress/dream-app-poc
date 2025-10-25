# EPIC-006: Design System Foundation

**Epic ID:** EPIC-006
**Title:** Implement Design System Foundation with Expanded Color Palette and Typography
**Status:** 📋 To Do
**Priority:** 🔴 Critical
**Estimated Story Points:** 21
**Phase:** 1 - Foundation

---

## Business Value

Establish a comprehensive design system foundation to ensure visual consistency, improve brand perception, and create a scalable system for future UI enhancements. This design system will transform DreamIt from a basic functional MVP to a polished, professional application that matches the magical nature of AI video generation.

**Impact:**
- Brand perception improvement (from 4/10 to 8/10)
- Design consistency across all components
- Faster development of new features
- Professional, modern aesthetic
- Foundation for dark mode and theming

---

## Current State vs Target State

**Current State:**
- Basic Tailwind default colors (blue-600, gray-scale)
- Limited color palette (3 colors total)
- System fonts only
- No design tokens
- Minimal spacing system
- No elevation/shadow system
- No animation tokens
- Rating: 4/10 design maturity

**Target State:**
- Comprehensive color system (Primary Purple, Secondary Teal, Neutral Gray)
- Semantic color tokens (success, warning, error, info)
- Custom web fonts (Inter variable font)
- 8px spacing grid system
- Elevation system (6 shadow levels)
- Animation system (durations, easing)
- Full type scale (xs through 5xl)
- Responsive typography with clamp()
- Rating: 9/10 design maturity

---

## Technical Approach

### Implementation Strategy

**Step 1: Define Design Tokens**
- Create CSS custom properties for all design tokens
- Implement in `src/app/globals.css`
- Document token usage

**Step 2: Expand Color Palette**
- Primary: Purple (#8b5cf6 family)
- Secondary: Teal (#10b981 family)
- Neutral: Gray (#171717 to #fafafa)
- Semantic: Success, Warning, Error, Info

**Step 3: Typography System**
- Add Inter variable font from Google Fonts
- Define type scale (1.25 ratio)
- Implement responsive typography
- Set up font weight variations

**Step 4: Spacing & Layout**
- Implement 8px grid system
- Define spacing scale (0 to 32)
- Create layout utilities

**Step 5: Elevation & Effects**
- Define shadow scale (xs to 2xl)
- Add colored shadows for CTAs
- Border radius system

**Step 6: Animation Tokens**
- Duration scale (instant to slower)
- Easing functions (spring, bounce)
- Reduced motion support

---

## Design Token Specification

### Color System

```css
/* Primary - Dream Purple */
--primary-50: #f5f3ff;
--primary-100: #ede9fe;
--primary-200: #ddd6fe;
--primary-300: #c4b5fd;
--primary-400: #a78bfa;
--primary-500: #8b5cf6;  /* Main brand color */
--primary-600: #7c3aed;
--primary-700: #6d28d9;
--primary-800: #5b21b6;
--primary-900: #4c1d95;

/* Secondary - Teal */
--secondary-50: #ecfdf5;
--secondary-100: #d1fae5;
--secondary-200: #a7f3d0;
--secondary-300: #6ee7b7;
--secondary-400: #34d399;
--secondary-500: #10b981;
--secondary-600: #059669;
--secondary-700: #047857;
--secondary-800: #065f46;
--secondary-900: #064e3b;

/* Neutral - Gray */
--neutral-50: #fafafa;
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373;
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717;

/* Semantic */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Semantic Tokens */
--color-background: var(--neutral-50);
--color-surface: white;
--color-text-primary: var(--neutral-900);
--color-text-secondary: var(--neutral-600);
--color-text-tertiary: var(--neutral-500);
--color-border: var(--neutral-200);
```

### Typography Scale

```css
/* Type Scale (1.25 ratio) */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System (8px grid)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Elevation (Shadows)

```css
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-primary: 0 10px 40px -10px rgb(139 92 246 / 0.4);
```

### Animation Tokens

```css
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 350ms;

--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## User Stories

1. **US-001:** Define color palette with CSS custom properties
2. **US-002:** Implement Inter variable font from Google Fonts
3. **US-003:** Create typography scale and responsive text
4. **US-004:** Define 8px spacing grid system
5. **US-005:** Create elevation/shadow system
6. **US-006:** Implement animation tokens
7. **US-007:** Update Tailwind config to use design tokens
8. **US-008:** Create design system documentation
9. **US-009:** Migrate existing components to use design system

---

## Acceptance Criteria

- [ ] CSS custom properties defined in globals.css
- [ ] All color tokens (Primary, Secondary, Neutral, Semantic) implemented
- [ ] Inter variable font loaded and applied
- [ ] Full type scale (xs to 5xl) defined
- [ ] 8px spacing system implemented
- [ ] Shadow scale (sm to xl) defined
- [ ] Animation tokens (duration, easing) created
- [ ] Tailwind config extends design tokens
- [ ] Reduced motion support implemented
- [ ] Design system documented in `docs/design-system.md`
- [ ] All existing components use design tokens (not hardcoded values)
- [ ] Visual regression tests pass
- [ ] Accessibility contrast ratios maintained (WCAG AA)

---

## Dependencies

**Required Before:**
- None (foundation epic)

**Blocks:**
- EPIC-007: Accessibility (needs color tokens for contrast)
- EPIC-010: Micro-interactions (needs animation tokens)
- EPIC-013: Dark mode (needs semantic tokens)

---

## Files Affected

### New Files
- `docs/design-system.md` - Design system documentation

### Modified Files
- `src/app/globals.css` - Add all CSS custom properties
- `tailwind.config.ts` - Extend with design tokens
- `src/components/ui/Button.tsx` - Use design tokens
- `src/components/ui/Card.tsx` - Use design tokens
- `src/components/layout/Header.tsx` - Use design tokens

---

## Success Metrics

- Visual consistency score: 4/10 → 9/10
- Design token coverage: 0% → 100%
- WCAG contrast compliance: ~85% → 100%
- Developer velocity: Baseline → +30% (faster styling)
- Brand perception: Amateur → Professional

---

## Risks and Mitigations

**Risk:** Breaking existing styles during migration
**Mitigation:** Migrate components incrementally, test each change

**Risk:** Custom properties not supported in old browsers
**Mitigation:** Only target modern browsers (2023+), provide fallbacks

**Risk:** Inter font loading slow
**Mitigation:** Use font-display: swap, preload critical font weights

**Risk:** Too many design tokens overwhelming
**Mitigation:** Clear documentation, examples for each token

---

## Testing Strategy

### Visual Regression
- Screenshot tests for all components
- Compare before/after design system application
- Test in light mode (dark mode in EPIC-013)

### Accessibility
- Run axe DevTools on all pages
- Verify all color contrast ratios (4.5:1 minimum)
- Test with high contrast mode

### Cross-Browser
- Test in Chrome, Firefox, Safari, Edge
- Verify CSS custom property support
- Test font rendering

### Manual Testing
- Visual inspection of all components
- Verify spacing consistency
- Check typography hierarchy
- Confirm shadow/elevation levels

---

## Implementation Tasks

See user-stories folder for detailed task breakdown:
- `user-stories/US-001-color-palette/` - Color system implementation
- `user-stories/US-002-typography/` - Font and type scale
- `user-stories/US-003-spacing/` - Spacing grid
- `user-stories/US-004-elevation/` - Shadow system
- `user-stories/US-005-animation/` - Animation tokens
- `user-stories/US-006-migration/` - Component migration

---

## Related Epics

- **EPIC-007**: Accessibility Improvements (depends on this)
- **EPIC-010**: Micro-interactions (depends on this)
- **EPIC-013**: Dark Mode Implementation (depends on this)

---

**Created:** 2025-10-24
**Last Updated:** 2025-10-24
**Estimated Effort:** 3-4 days
**Complexity:** Medium (systematic, well-defined)
