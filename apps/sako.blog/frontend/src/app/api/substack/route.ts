import { NextResponse } from 'next/server';

export interface SubstackArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content?: string;
}

export async function GET() {
  try {
    // Substack RSS feed URL
    const rssUrl = 'https://vurghun.substack.com/feed';
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { articles: [], error: `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const xmlText = await response.text();
    
    if (!xmlText || xmlText.trim().length === 0) {
      console.error('RSS feed returned empty content');
      return NextResponse.json(
        { articles: [], error: 'RSS feed is empty' },
        { status: 500 }
      );
    }
    
    // Parse RSS XML
    const articles = parseRSSFeed(xmlText);
    
    console.log(`Successfully parsed ${articles.length} articles from Substack`);
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching Substack articles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { articles: [], error: `Failed to fetch Substack articles: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function parseRSSFeed(xmlText: string): SubstackArticle[] {
  const articles: SubstackArticle[] = [];
  
  // RSS parser using regex - handles CDATA and regular text
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract title (handles CDATA and regular format)
    const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/title>/s);
    
    // Extract link
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
    
    // Extract pubDate
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
    
    // Extract description (handles CDATA and regular format, can be multi-line)
    const descriptionMatch = itemContent.match(/<description>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/description>/s);
    
    // Extract content:encoded (full article content)
    const contentMatch = itemContent.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/s);
    
    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const link = (linkMatch[1] || '').trim();
      const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
      
      // Clean description - remove HTML tags and limit length
      let description = '';
      if (descriptionMatch) {
        const rawDescription = descriptionMatch[1] || descriptionMatch[2] || '';
        description = rawDescription
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
      
      const content = contentMatch ? contentMatch[1].trim() : '';
      
      // Only add if we have at least a title and link
      if (title && link) {
        articles.push({
          title,
          link,
          pubDate,
          description,
          content,
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

