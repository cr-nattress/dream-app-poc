import { z } from 'zod';

export const Frontmatter = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().min(1),
  published: z.boolean().default(false),
  publishedAt: z.coerce.date().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  lang: z.string().default('en'),
  series: z.string().optional(),
  order: z.number().optional(),
  canonicalUrl: z.string().url().optional(),
});

export type FrontmatterT = z.infer<typeof Frontmatter>;
