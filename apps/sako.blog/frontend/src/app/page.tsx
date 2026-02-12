import { blogApi, Post } from '@/lib/api';
import PostCard from '@/components/PostCard';
import SubstackArticleCard, { SubstackArticle } from '@/components/SubstackArticleCard';
import TwitterTweetCard, { TwitterTweet } from '@/components/TwitterTweetCard';
import Link from 'next/link';
import Image from 'next/image';

function parseRSSFeed(xmlText: string): SubstackArticle[] {
  const articles: SubstackArticle[] = [];
  
  // Allowed tags/categories
  const allowedTags = ['Tech', 'Business & Strategy'];
  
  // RSS parser using regex - handles CDATA and regular text
  // Using [\s\S] instead of . with 's' flag for compatibility
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract title (handles CDATA and regular format)
    const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/);
    
    // Extract link
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
    
    // Extract pubDate
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
    
    // Extract description (handles CDATA and regular format, can be multi-line)
    // In Substack RSS, description contains the category/tag
    const descriptionMatch = itemContent.match(/<description>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/);
    
    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const link = (linkMatch[1] || '').trim();
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
      
      // Extract category from description (first line/part is usually the category)
      let category = '';
      let description = '';
      if (descriptionMatch) {
        const rawDescription = descriptionMatch[1] || descriptionMatch[2] || '';
        // Category is typically the first part of the description
        // Split by newline or take first part
        const parts = rawDescription.split(/\n/).map(p => p.trim()).filter(p => p);
        category = parts[0] || '';
        
        // Use the rest as description, or if no category, use the whole thing
        if (parts.length > 1) {
          description = parts.slice(1).join(' ');
        } else if (!allowedTags.includes(category)) {
          description = rawDescription;
        }
        
        // Clean description - remove HTML tags and limit length
        description = description
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
          .substring(0, 300); // Limit to 300 chars
      }
      
      // Only add if category matches allowed tags
      if (title && link && allowedTags.includes(category)) {
        articles.push({
          title,
          link,
          pubDate,
          description,
        });
      }
    }
  }
  
  // Sort by date, newest first
  articles.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    return dateB - dateA;
  });
  
  return articles.slice(0, 10); // Return latest 10 articles
}

async function getSubstackArticles(): Promise<SubstackArticle[]> {
  try {
    // Fetch RSS feed directly from Substack
    const rssUrl = 'https://vurghun.substack.com/feed';
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch Substack RSS: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const xmlText = await response.text();
    
    if (!xmlText || xmlText.trim().length === 0) {
      console.error('Substack RSS feed returned empty content');
      return [];
    }
    
    // Parse RSS XML
    const articles = parseRSSFeed(xmlText);
    
    console.log(`Successfully parsed ${articles.length} articles from Substack`);
    
    return articles;
  } catch (error) {
    console.error('Error fetching Substack articles:', error);
    return [];
  }
}

async function getTwitterTweets(): Promise<TwitterTweet[]> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.NODE_ENV === 'production' 
                      ? 'https://your-domain.com' 
                      : 'http://localhost:3000');
    const response = await fetch(`${baseUrl}/api/twitter`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.tweets || [];
  } catch (error) {
    console.error('Error fetching Twitter tweets:', error);
    return [];
  }
}

export default async function Home() {
  const [posts, substackArticles, tweets] = await Promise.all([
    blogApi.getPosts({ published: true, limit: 10 }),
    getSubstackArticles(),
    getTwitterTweets(),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-black dark:to-gray-950"></div>
        <div className="relative container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 mb-8 shadow-soft">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Technical Evangelist & Community Builder
                </div>
                <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
              Vurik Blog
            </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-4 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Exploring the intersection of technology, community, and continuous learning
                </p>
                <p className="text-base text-gray-500 dark:text-gray-500 mb-12 font-light max-w-xl mx-auto lg:mx-0">
                  20+ years building enterprise-scale platforms • Writing about Cloud Infrastructure, AI, MLOps, and Community
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Link
                href="/about"
                    className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                  >
                    Learn More
                  </Link>
                  <Link
                href="/coffee-meets"
                    className="px-8 py-3.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
              >
                Coffee Meets
                  </Link>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="relative rounded-3xl overflow-hidden shadow-soft-lg border border-gray-200/50 dark:border-gray-800/50">
                  <Image
                    src="/image.png"
                    alt="Working on technology and code"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">20+</div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Years Experience</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">61</div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Articles Published</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">16</div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Talks & Events</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">1</div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Book in Progress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <Link
                href="/linkedin"
                className="group bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">LinkedIn Impact</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-4">
                  Consistent technical storytelling amplified reach across Cloud Infrastructure, AI, DATA, MLOps, and Community topics.
                </p>
                <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 gap-1 transition-all duration-200">
                  <span>View impact</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
              </Link>

              <Link
                href="/substack"
                className="group bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300/50 dark:hover:border-gray-700/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 p-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V16.5a2.498 2.498 0 0 0 2.498 2.496h7.464v-8.184H1.461zm10.954 0v8.184h7.666a2.498 2.498 0 0 0 2.498-2.496v-5.688H12.414z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Substack Impact</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-4">
                  Writing clarified thinking and built a durable knowledge asset. 61 articles published by end of 2025.
                </p>
                <div className="flex items-center text-sm font-medium text-orange-600 dark:text-orange-400 group-hover:gap-2 gap-1 transition-all duration-200">
                  <span>View impact</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                </div>
              </Link>
            </div>

            {/* Latest Tweets Section */}
            {tweets.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    Latest Tweets
                  </h2>
                  <a
                    href="https://x.com/VurghunH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    View all on X →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tweets.map((tweet) => (
                    <TwitterTweetCard key={tweet.id} tweet={tweet} />
                  ))}
                </div>
              </div>
            )}

            {/* Latest Articles Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Latest Articles
                </h2>
                {(posts.length > 0 || substackArticles.length > 0) && (
                  <a
                    href="https://vurghun.substack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                  >
                    View all on Substack →
                  </a>
                )}
              </div>

              {substackArticles.length === 0 && posts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200/50 dark:border-gray-800/50">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-gray-500 dark:text-gray-500 text-[15px] font-medium">
                    No articles yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
                  {/* Display Substack articles first */}
                  {substackArticles.slice(0, 5).map((article, index) => (
                    <SubstackArticleCard key={`substack-${index}`} article={article} />
                  ))}
                  {/* Then display regular blog posts */}
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
        </div>
      </section>
    </div>
  );
}

