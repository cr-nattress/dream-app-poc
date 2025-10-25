# US-001: Define Color Palette with CSS Custom Properties

**User Story ID:** US-001
**Epic:** EPIC-006 - Design System Foundation
**Priority:** 🔴 Critical
**Story Points:** 5
**Status:** 📋 To Do

---

## User Story

**As a** developer
**I want** a comprehensive color palette defined as CSS custom properties
**So that** I can use consistent colors throughout the application and easily support theming

---

## Acceptance Criteria

- [ ] Primary purple color scale (50-900) defined
- [ ] Secondary teal color scale (50-900) defined
- [ ] Neutral gray color scale (50-900) defined
- [ ] Semantic colors defined (success, warning, error, info)
- [ ] Semantic tokens created (background, surface, text, border)
- [ ] All colors have WCAG AA contrast ratios
- [ ] Colors defined in `src/app/globals.css`
- [ ] Tailwind config updated to reference custom properties
- [ ] Color palette documented with examples

---

## Technical Details

### File to Modify
- `src/app/globals.css`
- `tailwind.config.ts`

### Implementation

Add to globals.css after Tailwind directives:

```css
:root {
  /* Primary - Dream Purple */
  --primary-50: #f5f3ff;
  --primary-100: #ede9fe;
  --primary-200: #ddd6fe;
  --primary-300: #c4b5fd;
  --primary-400: #a78bfa;
  --primary-500: #8b5cf6;
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

  /* Semantic Colors */
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
  --color-border-hover: var(--neutral-300);
}
```

Update tailwind.config.ts:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        50: 'var(--primary-50)',
        100: 'var(--primary-100)',
        // ... (all shades)
        900: 'var(--primary-900)',
      },
      secondary: {
        // ... (all shades)
      },
      neutral: {
        // ... (all shades)
      },
    },
  },
},
```

---

## Tasks

1. **TASK-001:** Add primary purple color scale to globals.css
2. **TASK-002:** Add secondary teal color scale to globals.css
3. **TASK-003:** Add neutral gray color scale to globals.css
4. **TASK-004:** Add semantic colors (success, warning, error, info)
5. **TASK-005:** Create semantic tokens (background, surface, text, border)
6. **TASK-006:** Update Tailwind config to use CSS custom properties
7. **TASK-007:** Test all color combinations for WCAG AA contrast
8. **TASK-008:** Document color palette in design-system.md

---

## Testing

**Manual Testing:**
- [ ] Verify all CSS variables are accessible in browser DevTools
- [ ] Test Tailwind classes work (bg-primary-500, text-secondary-600, etc.)
- [ ] Check semantic tokens resolve correctly

**Contrast Testing:**
- [ ] Run axe DevTools contrast checker
- [ ] Verify primary-600 on white >= 4.5:1
- [ ] Verify text-primary on background >= 4.5:1
- [ ] Verify text-secondary on background >= 4.5:1

---

## Definition of Done

- [ ] All color variables defined in globals.css
- [ ] Tailwind config references custom properties
- [ ] All WCAG AA contrast requirements met
- [ ] Colors documented with hex values and use cases
- [ ] Pull request approved and merged

---

**Estimated Time:** 3-4 hours
**Dependencies:** None
**Blocks:** US-002 (typography needs colors for documentation)
