/**
 * Prompt Template Utilities for Dream Video Generation
 *
 * This module provides a specialized prompt template system designed to transform
 * user dream notes into rich, cinematic video prompts for the Sora 2 API.
 */

/**
 * Configuration for prompt customization
 * Future versions will allow dynamic parameter toggling
 */
export interface PromptConfig {
  /** Tone/mood of the dream video (future: user-selectable) */
  tone?: 'ethereal' | 'dark' | 'whimsical' | 'nostalgic';
  /** Visual style approach (future: user-selectable) */
  style?: 'realistic' | 'surreal' | 'abstract';
  /** Target video length (future: user-selectable) */
  length?: '15s' | '30s' | '60s';
  /** Custom mood override (future: user input) */
  mood?: string;
  // Future: add more configurable parameters
  // - cameraMovement?: 'static' | 'slow' | 'dynamic'
  // - colorPalette?: 'warm' | 'cool' | 'monochrome'
  // - soundStyle?: 'ambient' | 'orchestral' | 'electronic'
}

/**
 * Dream-focused prompt template for Sora 2 video generation
 *
 * This template provides comprehensive guidance to Sora 2 on:
 * - Interpretation approach (feeling > literal events)
 * - Tone & mood (ethereal, introspective, uncanny)
 * - Visual style (cinematic realism + surreal effects)
 * - Camera movement (slow, fluid, dreamlike)
 * - Sound direction (ambient, emotional)
 * - Length specification (15-30 seconds)
 * - Ending instruction (fade-out)
 *
 * Placeholder: {{user_dream_notes}} - replaced with user's dream description
 */
const DREAM_PROMPT_TEMPLATE = `Create a short cinematic video inspired by this dream:

{{user_dream_notes}}

The video should capture the feeling, imagery, and emotion of the dream more than the literal events. Use rich visual symbolism, smooth transitions, and dreamlike logic — blending realism with surrealism.

Tone & Mood: ethereal, introspective, and slightly uncanny — like a lucid dream that shifts between familiar places and impossible landscapes.

Style: cinematic realism with subtle surreal effects (floating objects, gravity shifts, morphing architecture, glowing light sources).

Camera: slow, fluid movement — like the viewer is drifting through the dream. Use shallow depth of field, dynamic lighting, and organic motion.

Sound: ambient, emotional score — matching the tone of the dream.

Length: 15–30 seconds.

End with a smooth fade-out, as if the dream is slipping away on waking.`;

/**
 * Renders the dream-focused prompt template with user notes
 *
 * @param userNotes - The user's dream description/notes
 * @param config - Optional configuration for future customization
 * @returns Fully rendered prompt ready for Sora 2 API
 *
 * @example
 * ```typescript
 * const prompt = renderDreamPrompt("I was flying over a city made of glass");
 * // Returns full template with user notes injected
 * ```
 */
export function renderDreamPrompt(
  userNotes: string,
  config?: PromptConfig
): string {
  // Validate user notes
  if (!userNotes || userNotes.trim().length === 0) {
    throw new Error('User dream notes cannot be empty');
  }

  // Sanitize user notes (trim whitespace, preserve newlines)
  const sanitizedNotes = userNotes.trim();

  // Replace placeholder with user notes
  let renderedPrompt = DREAM_PROMPT_TEMPLATE.replace(
    '{{user_dream_notes}}',
    sanitizedNotes
  );

  // Future: Apply configuration overrides
  // if (config?.tone) {
  //   renderedPrompt = applyToneOverride(renderedPrompt, config.tone);
  // }
  // if (config?.style) {
  //   renderedPrompt = applyStyleOverride(renderedPrompt, config.style);
  // }
  // if (config?.length) {
  //   renderedPrompt = applyLengthOverride(renderedPrompt, config.length);
  // }

  return renderedPrompt;
}

/**
 * Gets the raw template (for testing/debugging)
 * @internal
 */
export function getTemplateRaw(): string {
  return DREAM_PROMPT_TEMPLATE;
}

/**
 * Validates that a prompt was properly rendered
 * @internal
 */
export function isPromptRendered(prompt: string): boolean {
  // Check that placeholder was replaced
  return !prompt.includes('{{user_dream_notes}}');
}
