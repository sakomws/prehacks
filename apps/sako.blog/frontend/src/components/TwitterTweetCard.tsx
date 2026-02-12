import { format } from 'date-fns';

export interface TwitterTweet {
  id: string;
  text: string;
  url: string;
  createdAt: string;
  author: string;
}

interface TwitterTweetCardProps {
  tweet: TwitterTweet;
}

// Helper function to parse tweet text into segments (text, URLs, mentions, hashtags)
function parseTweetText(text: string): Array<{ type: 'text' | 'url' | 'mention' | 'hashtag'; content: string; href?: string }> {
  const segments: Array<{ type: 'text' | 'url' | 'mention' | 'hashtag'; content: string; href?: string }> = [];
  let lastIndex = 0;
  
  // Combined regex to match URLs, mentions, and hashtags
  const combinedRegex = /(https?:\/\/[^\s]+)|@(\w+)|#(\w+)/g;
  let match;
  
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    
    // Add the matched segment
    if (match[1]) {
      // URL
      segments.push({
        type: 'url',
        content: match[1],
        href: match[1],
      });
    } else if (match[2]) {
      // Mention
      segments.push({
        type: 'mention',
        content: `@${match[2]}`,
        href: `https://x.com/${match[2]}`,
      });
    } else if (match[3]) {
      // Hashtag
      segments.push({
        type: 'hashtag',
        content: `#${match[3]}`,
        href: `https://x.com/hashtag/${match[3]}`,
      });
    }
    
    lastIndex = combinedRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }
  
  // If no matches, return the whole text as a single segment
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: text,
    });
  }
  
  return segments;
}

export default function TwitterTweetCard({ tweet }: TwitterTweetCardProps) {
  const segments = parseTweetText(tweet.text);
  const formattedDate = format(new Date(tweet.createdAt), 'MMMM d, yyyy');

  return (
    <article className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 overflow-hidden">
      <a 
        href={tweet.url} 
        target="_blank"
        rel="noopener noreferrer"
        className="block p-8"
      >
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mb-4">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <time dateTime={tweet.createdAt} className="font-medium">
            {formattedDate}
          </time>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
            Twitter
          </span>
        </div>

        <p className="text-gray-900 dark:text-white mb-6 leading-relaxed text-[15px] whitespace-pre-wrap break-words">
          {segments.map((segment, index) => {
            if (segment.type === 'text') {
              return <span key={index}>{segment.content}</span>;
            }
            
            return (
              <a
                key={index}
                href={segment.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {segment.content}
              </a>
            );
          })}
        </p>

        <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 gap-1 transition-all duration-200">
          <span>View on X</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
        </div>
      </a>
    </article>
  );
}

