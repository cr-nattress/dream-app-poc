export interface DreamTip {
  id: number;
  tip: string;
  category: 'did-you-know' | 'video-tip' | 'dream-fact' | 'ai-insight';
}

export const DREAM_TIPS: DreamTip[] = [
  // Did You Know
  {
    id: 1,
    tip: 'Did you know? The average person has 3-5 dreams per night, but most are forgotten within minutes of waking.',
    category: 'did-you-know',
  },
  {
    id: 2,
    tip: 'Did you know? Dreams can be in color or black and white - about 12% of people dream only in black and white.',
    category: 'did-you-know',
  },
  {
    id: 3,
    tip: 'Did you know? You can only dream about faces you\'ve already seen, even if you don\'t remember them.',
    category: 'did-you-know',
  },
  {
    id: 4,
    tip: 'Did you know? Animals dream too! Dogs, cats, and even some birds experience REM sleep and dreams.',
    category: 'did-you-know',
  },
  {
    id: 5,
    tip: 'Did you know? Lucid dreaming (knowing you\'re dreaming while dreaming) can be learned with practice.',
    category: 'did-you-know',
  },

  // Video Tips
  {
    id: 11,
    tip: 'Video Tip: More descriptive prompts tend to produce more detailed and accurate videos.',
    category: 'video-tip',
  },
  {
    id: 12,
    tip: 'Video Tip: Include specific details like colors, movements, and emotions for better results.',
    category: 'video-tip',
  },
  {
    id: 13,
    tip: 'Video Tip: Your video will be 8 seconds long - perfect for capturing a dream moment!',
    category: 'video-tip',
  },
  {
    id: 14,
    tip: 'Video Tip: Videos are generated in vertical 9:16 format, ideal for mobile viewing.',
    category: 'video-tip',
  },
  {
    id: 15,
    tip: 'Video Tip: Try adding atmosphere words like "serene", "mysterious", or "vibrant" to enhance the mood.',
    category: 'video-tip',
  },

  // Dream Facts
  {
    id: 21,
    tip: 'Dream Fact: The longest dreams occur during the final REM period, which can last up to 45 minutes.',
    category: 'dream-fact',
  },
  {
    id: 22,
    tip: 'Dream Fact: Dreams during pregnancy tend to be more vivid and memorable due to hormonal changes.',
    category: 'dream-fact',
  },
  {
    id: 23,
    tip: 'Dream Fact: People who are blind from birth experience dreams through other senses like sound, smell, and touch.',
    category: 'dream-fact',
  },
  {
    id: 24,
    tip: 'Dream Fact: Nightmares are more common in children than adults and often decrease with age.',
    category: 'dream-fact',
  },
  {
    id: 25,
    tip: 'Dream Fact: The word "nightmare" comes from "mare," a demon in folklore that sits on sleepers\' chests.',
    category: 'dream-fact',
  },

  // AI Insights
  {
    id: 31,
    tip: 'AI Insight: Sora 2 uses billions of training examples to understand how objects move in the real world.',
    category: 'ai-insight',
  },
  {
    id: 32,
    tip: 'AI Insight: Video generation AI considers physics, lighting, and perspective to create realistic motion.',
    category: 'ai-insight',
  },
  {
    id: 33,
    tip: 'AI Insight: Each frame of your video is carefully crafted to maintain temporal consistency.',
    category: 'ai-insight',
  },
  {
    id: 34,
    tip: 'AI Insight: The AI analyzes your prompt for subjects, actions, environment, and style before generating.',
    category: 'ai-insight',
  },
  {
    id: 35,
    tip: 'AI Insight: Video AI models can understand complex concepts like "floating" or "morphing" intuitively.',
    category: 'ai-insight',
  },
];

/**
 * Get a random tip from the collection
 */
export function getRandomTip(): DreamTip {
  const randomIndex = Math.floor(Math.random() * DREAM_TIPS.length);
  return DREAM_TIPS[randomIndex];
}

/**
 * Get a random tip from a specific category
 */
export function getRandomTipByCategory(category: DreamTip['category']): DreamTip {
  const categoryTips = DREAM_TIPS.filter(tip => tip.category === category);
  const randomIndex = Math.floor(Math.random() * categoryTips.length);
  return categoryTips[randomIndex];
}

/**
 * Get a sequence of random unique tips
 */
export function getRandomTips(count: number): DreamTip[] {
  const shuffled = [...DREAM_TIPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, DREAM_TIPS.length));
}
