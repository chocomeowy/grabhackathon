import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coordinates = searchParams.getAll('coordinates');
  const profile = searchParams.get('profile') || 'driving';
  
  const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || process.env.GRABMAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  try {
    const params = new URLSearchParams();
    coordinates.forEach(c => params.append('coordinates', c));
    params.set('profile', profile);
    params.set('overview', 'full');
    params.set('countryCode', 'SG');

    const url = `https://maps.grab.com/api/v1/maps/eta/v1/direction?${params}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Country-Code': 'SG'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Directions Failed', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy fetch failed', message: error.message }, { status: 500 });
  }
}
