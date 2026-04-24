import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || process.env.GRABMAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  try {
    // Official Documented Parameters for Nearby (v2) from 05 Search & Discover Places.md
    // Note: radius is in KM, not meters.
    const url = new URL('https://maps.grab.com/api/v1/maps/place/v2/nearby');
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', '5'); // 5km radius
    url.searchParams.set('limit', '20');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: 'Grab Nearby Failed', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy fetch failed', message: error.message }, { status: 500 });
  }
}
