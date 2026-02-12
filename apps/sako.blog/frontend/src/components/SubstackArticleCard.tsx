import Link from 'next/link';
import { format } from 'date-fns';

export interface SubstackArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface SubstackArticleCardProps {
  article: SubstackArticle;
}

export default function SubstackArticleCard({ article }: SubstackArticleCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden">
      <a 
        href={article.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block p-8"
      >
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mb-4">
          <time dateTime={article.pubDate} className="font-medium">
            {format(new Date(article.pubDate), 'MMMM d, yyyy')}
          </time>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
            Substack
          </span>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
          {article.title}
        </h2>

        {article.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-[15px] line-clamp-2">
            {article.description}
          </p>
        )}

        <div className="flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:gap-2 gap-1 transition-all duration-200">
          <span>Read on Substack</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
        </div>
      </a>
    </article>
  );
}

