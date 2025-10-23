import matter from 'gray-matter';
import { Frontmatter } from './schema';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';

export type ParsedMarkdown = {
  html: string;
  data: ReturnType<typeof Frontmatter.parse>;
};

export async function parseMarkdown(raw: string): Promise<ParsedMarkdown> {
  const { content, data } = matter(raw);
  const fm = Frontmatter.parse(data);

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkToc, { heading: 'Table of contents', maxDepth: 3 })
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify)
    .process(content);

  return { html: String(file), data: fm };
}
