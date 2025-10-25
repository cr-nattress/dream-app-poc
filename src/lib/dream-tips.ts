export interface DreamTip {
  id: number;
  tip: string;
  category: 'did-you-know' | 'video-tip' | 'dream-fact' | 'ai-insight';
}

export const DREAM_TIPS: DreamTip[] = [
  // Dream Recall & Recording Tips
  {
    id: 1,
    tip: 'Physical movement upon waking erases dream memories within seconds.',
    category: 'dream-fact',
  },
  {
    id: 2,
    tip: 'Delay equals forgetting; make dream recording your first morning activity without exception.',
    category: 'dream-fact',
  },
  {
    id: 3,
    tip: 'Engage prospective memory by programming your mind to remember dreams before sleep.',
    category: 'dream-fact',
  },
  {
    id: 4,
    tip: 'Jarring alarms spike stress hormones that inhibit dream recall; wake naturally when possible.',
    category: 'dream-fact',
  },
  {
    id: 5,
    tip: 'Maintain detailed records with consistent structure to identify patterns and improve recall over time.',
    category: 'dream-fact',
  },
  {
    id: 6,
    tip: 'Track recurring themes, symbols, and impossible elements that signal you&apos;re dreaming.',
    category: 'dream-fact',
  },
  {
    id: 7,
    tip: 'Engage with dream memories throughout the day to strengthen recall pathways and recover forgotten fragments.',
    category: 'dream-fact',
  },
  {
    id: 8,
    tip: 'Dream recall depends fundamentally on sleep quality—prioritize consistent schedules and restorative conditions.',
    category: 'dream-fact',
  },
  {
    id: 9,
    tip: 'Capture nocturnal dreams with minimal disruption using voice memos, then transcribe to journal later.',
    category: 'dream-fact',
  },
  {
    id: 10,
    tip: 'Vitamin B6 and other supplements can enhance dream vividness and recall when used appropriately.',
    category: 'dream-fact',
  },

  // Lucid Dreaming Tips
  {
    id: 11,
    tip: 'The most evidence-based lucid dreaming technique uses prospective memory to recognize dream states.',
    category: 'dream-fact',
  },
  {
    id: 12,
    tip: 'Strategic sleep interruption during REM-rich periods dramatically increases lucid dreaming success rates.',
    category: 'dream-fact',
  },
  {
    id: 13,
    tip: 'Build daytime habits of questioning reality that transfer into dreams, revealing you&apos;re dreaming.',
    category: 'dream-fact',
  },
  {
    id: 14,
    tip: 'Maintain consciousness while your body falls asleep for immediate entry into lucid dreams.',
    category: 'dream-fact',
  },
  {
    id: 15,
    tip: 'The most successful lucid dreamers use integrated protocols combining multiple complementary techniques.',
    category: 'dream-fact',
  },
  {
    id: 16,
    tip: 'Regular meditation builds the awareness of awareness that directly transfers to dream lucidity.',
    category: 'dream-fact',
  },
  {
    id: 17,
    tip: 'REM periods lengthen through the night—final REM periods last 45-60 minutes, first only 5-10 minutes.',
    category: 'dream-fact',
  },
  {
    id: 18,
    tip: 'Galantamine is the only supplement with robust scientific validation for lucid dreaming.',
    category: 'dream-fact',
  },
  {
    id: 19,
    tip: 'SSILD technique uses sensory focus cycles with research validation comparable to other methods.',
    category: 'dream-fact',
  },
  {
    id: 20,
    tip: 'Lucid dreaming is a learnable skill requiring consistent practice balanced with sleep quality protection.',
    category: 'dream-fact',
  },

  // Video Tips
  {
    id: 21,
    tip: 'Video Tip: More descriptive prompts tend to produce more detailed and accurate videos.',
    category: 'video-tip',
  },
  {
    id: 22,
    tip: 'Video Tip: Include specific details like colors, movements, and emotions for better results.',
    category: 'video-tip',
  },
  {
    id: 23,
    tip: 'Video Tip: Your video will be 8 seconds long - perfect for capturing a dream moment!',
    category: 'video-tip',
  },
  {
    id: 24,
    tip: 'Video Tip: Videos are generated in vertical 9:16 format, ideal for mobile viewing.',
    category: 'video-tip',
  },
  {
    id: 25,
    tip: 'Video Tip: Try adding atmosphere words like "serene", "mysterious", or "vibrant" to enhance the mood.',
    category: 'video-tip',
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
