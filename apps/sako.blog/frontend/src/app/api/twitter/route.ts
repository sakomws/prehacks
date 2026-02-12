import { NextResponse } from 'next/server';

export interface TwitterTweet {
  id: string;
  text: string;
  url: string;
  createdAt: string;
  author: string;
}

export async function GET() {
  try {
    // Using Nitter RSS feed as Twitter removed their RSS support
    // Nitter is a free and open source alternative Twitter front-end
    // Format: https://nitter.net/[username]/rss
    const username = 'VurghunH';
    const nitterUrl = `https://nitter.net/${username}/rss`;
    
    // Alternative: If you have Twitter API keys, use Twitter API v2 instead
    // For now, we'll use Nitter RSS feed
    
    const response = await fetch(nitterUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      // If Nitter fails, try alternative instance
      const altUrl = `https://nitter.pussthecat.org/${username}/rss`;
      const altResponse = await fetch(altUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
        },
        next: { revalidate: 1800 },
      });
      
      if (!altResponse.ok) {
        throw new Error(`Failed to fetch Twitter feed: ${response.statusText}`);
      }
      
      const xmlText = await altResponse.text();
      const tweets = parseTwitterRSS(xmlText, username);
      return NextResponse.json({ tweets });
    }

    const xmlText = await response.text();
    const tweets = parseTwitterRSS(xmlText, username);
    
    return NextResponse.json({ tweets });
  } catch (error) {
    console.error('Error fetching Twitter tweets:', error);
    // Return empty array instead of error to prevent page breakage
    return NextResponse.json({ tweets: [] });
  }
}

function parseTwitterRSS(xmlText: string, username: string): TwitterTweet[] {
  const tweets: TwitterTweet[] = [];
  
  // Parse RSS XML from Nitter
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
    const descriptionMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>(.*?)<\/description>/);
    
    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim();
      const link = linkMatch[1] || '';
      const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();
      
      // Extract tweet text from title (Nitter format: "Tweet text" - @username)
      let tweetText = title;
      if (tweetText.includes(' - @')) {
        tweetText = tweetText.split(' - @')[0].trim();
      }
      
      // Extract tweet ID from link
      const tweetIdMatch = link.match(/\/status\/(\d+)/);
      const tweetId = tweetIdMatch ? tweetIdMatch[1] : Date.now().toString();
      
      // Clean up tweet text - remove HTML entities and extra whitespace
      tweetText = tweetText
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      
      // Convert Nitter link to Twitter/X link
      const twitterLink = link.replace(/nitter\.(net|pussthecat\.org)/g, 'x.com');
      
      tweets.push({
        id: tweetId,
        text: tweetText,
        url: twitterLink || `https://x.com/${username}/status/${tweetId}`,
        createdAt: pubDate.trim(),
        author: username,
      });
    }
  }
  
  // Sort by date, newest first
  tweets.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
  
  return tweets.slice(0, 5); // Return latest 5 tweets
}

