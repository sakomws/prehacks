import { blogApi } from '@/lib/api';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PageProps) {
  let post;
  try {
    post = await blogApi.getPostBySlug(params.slug);
  } catch (error) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-6 py-16">
        <article className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-12 transition-colors duration-200 font-medium"
          >
            <span>←</span>
            <span>Back to posts</span>
          </Link>

          <header className="mb-12">
            <h1 className="text-5xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500 mb-6">
              <time dateTime={post.created_at} className="font-medium">
                {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </time>
              {post.category && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <Link
                    href={`/categories/${post.category.slug}`}
                    className="font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {post.category.name}
                  </Link>
                </>
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {post.featured_image && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-soft-lg">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full"
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

