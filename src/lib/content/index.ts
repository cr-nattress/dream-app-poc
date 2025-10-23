import path from 'node:path';
import { readFileUtf8, joinContentPath, listMarkdownFiles } from './fs';
import { parseMarkdown } from './markdown';
import type { Frontmatter } from './schema';

export type ContentItem = {
  slug: string;
  html: string;
  data: ReturnType<typeof Frontmatter.parse>;
  filePath: string;
};

export async function getContentBySlug(
  baseDir: string,
  slug: string
): Promise<ContentItem | null> {
  const mdPath = joinContentPath(baseDir, `${slug}.md`);
  try {
    const raw = await readFileUtf8(mdPath);
    const parsed = await parseMarkdown(raw);
    return { slug, html: parsed.html, data: parsed.data, filePath: mdPath };
  } catch {
    return null;
  }
}

export async function listContent(baseDir: string): Promise<ContentItem[]> {
  const files = await listMarkdownFiles(baseDir);
  const items: ContentItem[] = [];
  for (const file of files) {
    const raw = await readFileUtf8(joinContentPath(file));
    const parsed = await parseMarkdown(raw);
    const slug = path.basename(file, '.md');
    items.push({
      slug,
      html: parsed.html,
      data: parsed.data,
      filePath: joinContentPath(file),
    });
  }
  return items
    .filter((i) => i.data.published)
    .sort(
      (a, b) =>
        (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0)
    );
}
