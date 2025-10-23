import Link from 'next/link';
import { listContent } from '@/lib/content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts, stories, and ideas from the Dream App team',
};

export default async function BlogIndexPage() {
  const posts = await listContent('blog');
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-neutral-600">No posts published yet.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((p) => (
            <li key={p.slug} className="border-b border-neutral-200 pb-6">
              <Link
                className="text-2xl font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                href={`/blog/${p.slug}`}
              >
                {p.data.title}
              </Link>
              <p className="text-sm text-neutral-600 mt-1">
                {p.data.publishedAt?.toLocaleDateString()}
                {p.data.author && ` • ${p.data.author}`}
              </p>
              <p className="text-neutral-700 mt-2">{p.data.description}</p>
              {p.data.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {p.data.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
