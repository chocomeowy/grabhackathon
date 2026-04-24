import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawKeyword = searchParams.get('keyword') || '';
  
  // 1. HARDENING: Sanitize input (Allow only alphanumeric and spaces)
  const keyword = rawKeyword.replace(/[^a-zA-Z0-9\s]/g, "").substring(0, 100);

  const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || process.env.GRABMAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  try {
    const url = new URL('https://maps.grab.com/api/v1/maps/poi/v1/search');
    url.searchParams.set('keyword', keyword);
    url.searchParams.set('country', 'SGP');
    url.searchParams.set('location', '1.3521,103.8198'); 
    url.searchParams.set('limit', '50'); // Increased discovery but capped

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Grab Search Failed' }, { status: response.status });
    }

    const data = await response.json();
    
    // 2. HARDENING: Result Validation (Ensure we only return valid POI arrays)
    if (!data.places || !Array.isArray(data.places)) {
      return NextResponse.json({ places: [] });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'System busy' }, { status: 500 });
  }
}
