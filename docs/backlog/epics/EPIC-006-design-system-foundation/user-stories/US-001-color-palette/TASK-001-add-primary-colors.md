# TASK-001: Add Primary Purple Color Scale

**Task ID:** TASK-001
**User Story:** US-001 - Color Palette
**Epic:** EPIC-006 - Design System Foundation
**Estimated Time:** 30 minutes

---

## Objective

Add the complete primary purple color scale (shades 50-900) to the application's global CSS file using CSS custom properties. This will establish the main brand color for DreamIt.

---

## Context

DreamIt currently uses a basic Tailwind blue color (blue-600). We're upgrading to a sophisticated purple palette that better represents the "dream" theme and provides more visual interest. Purple evokes creativity, imagination, and dreams.

---

## Implementation Steps

### Step 1: Open globals.css

Navigate to and open: `src/app/globals.css`

### Step 2: Add Primary Color Scale

After the existing `:root {` declaration (around line 5), add the following CSS custom properties:

```css
:root {
  /* Existing variables */
  --background: #fafafa;
  --foreground: #171717;

  /* PRIMARY - Dream Purple (Add this section) */
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
}
```

### Step 3: Verify in Browser

1. Save the file
2. Open the app in browser (http://localhost:8888)
3. Open DevTools → Elements → :root
4. Verify all `--primary-*` variables are present
5. Test in console: `getComputedStyle(document.documentElement).getPropertyValue('--primary-500')`
   - Should return: `#8b5cf6`

---

## Acceptance Criteria

- [ ] All 10 primary color shades (50-900) added to globals.css
- [ ] CSS custom properties use the exact hex values specified
- [ ] Comment added identifying "PRIMARY - Dream Purple"
- [ ] Main brand color (500 shade) has inline comment
- [ ] No syntax errors in CSS
- [ ] Variables accessible in browser DevTools
- [ ] File saved and changes committed

---

## Testing

**Manual Test:**
```bash
# In browser console
getComputedStyle(document.documentElement).getPropertyValue('--primary-50')
# Expected: #f5f3ff (or  #f5f3ff with whitespace)

getComputedStyle(document.documentElement).getPropertyValue('--primary-500')
# Expected: #8b5cf6

getComputedStyle(document.documentElement).getPropertyValue('--primary-900')
# Expected: #4c1d95
```

**Visual Test:**
- Temporarily add to a component: `style={{ backgroundColor: 'var(--primary-500)' }}`
- Should show purple background

---

## Files to Modify

- `src/app/globals.css` - Add primary color scale

---

## Related Tasks

- **TASK-002**: Add Secondary Teal Colors (depends on this pattern)
- **TASK-003**: Add Neutral Gray Colors (depends on this pattern)

---

## Notes

- Purple chosen for dream/imagination theme
- Color values from Tailwind violet palette (proven contrast ratios)
- 500 shade is the main brand color
- Will be used for primary buttons, links, accents
- Dark mode variants will be added in EPIC-013

---

## Rollback

If this causes issues:
```bash
git checkout src/app/globals.css
```

---

**Priority:** Critical (foundation for all other color work)
**Complexity:** Low (straightforward CSS addition)
