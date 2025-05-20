import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // You can replace this with any search API of your choice
    // For example: Google Custom Search, Bing Web Search, etc.
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
    );
    
    const data = await response.json();
    
    // Format suggestions from the API response
    const suggestions = data.RelatedTopics
      ?.map((topic: any) => topic.Text)
      .filter(Boolean)
      .slice(0, 5) || [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ suggestions: [] });
  }
} 