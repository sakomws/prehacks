import Link from 'next/link';
import { format } from 'date-fns';
import { Post } from '@/lib/api';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden">
      <Link href={`/posts/${post.slug}`} className="block p-8">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mb-4">
          <time dateTime={post.created_at} className="font-medium">
            {format(new Date(post.created_at), 'MMMM d, yyyy')}
          </time>
          {post.category && (
            <>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <Link
                href={`/categories/${post.category.slug}`}
                className="font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {post.category.name}
              </Link>
            </>
          )}
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-[15px]">
            {post.excerpt}
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:gap-2 gap-1 transition-all duration-200">
          <span>Read article</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
        </div>
      </Link>
    </article>
  );
}

