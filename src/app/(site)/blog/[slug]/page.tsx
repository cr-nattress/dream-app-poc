import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/lib/content';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const { listContent } = await import('@/lib/content');
  const items = await listContent('blog');
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = await getContentBySlug('blog', params.slug);
  if (!item) return {};
  const { title, description, canonicalUrl, coverImage } = item.data;
  return {
    title,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: coverImage ? { images: [{ url: coverImage }] } : undefined,
  } satisfies Metadata;
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const item = await getContentBySlug('blog', params.slug);
  if (!item) notFound();
  return (
    <article className="prose prose-neutral max-w-3xl mx-auto py-8 px-4">
      <h1>{item.data.title}</h1>
      {item.data.author && (
        <p className="text-sm text-neutral-600">
          By {item.data.author}
          {item.data.publishedAt && (
            <> on {item.data.publishedAt.toLocaleDateString()}</>
          )}
        </p>
      )}
      {item.data.tags.length > 0 && (
        <div className="flex gap-2 my-4">
          {item.data.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-xs bg-neutral-200 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: item.html }} />
    </article>
  );
}
