import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  
  const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || process.env.GRABMAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  try {
    // Official Documented Parameters from 05 Search & Discover Places.md
    const url = new URL('https://maps.grab.com/api/v1/maps/poi/v1/search');
    url.searchParams.set('keyword', keyword || '');
    url.searchParams.set('country', 'SGP'); // Must be 3-letter alpha-3
    url.searchParams.set('location', '1.3521,103.8198'); // Singapore bias center
    url.searchParams.set('limit', '10');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: 'Grab Search Failed', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy fetch failed', message: error.message }, { status: 500 });
  }
}
