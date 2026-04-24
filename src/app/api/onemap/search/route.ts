import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  const apiKey = process.env.NEXT_PUBLIC_ONEMAP_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'OneMap API Key missing' }, { status: 500 });
  }

  try {
    const url = new URL('https://www.onemap.gov.sg/api/common/elastic/search');
    url.searchParams.set('searchVal', query || '');
    url.searchParams.set('returnGeom', 'Y');
    url.searchParams.set('getAddrDetails', 'Y');
    url.searchParams.set('pageNum', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: 'OneMap Search Failed', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    // Transform OneMap results to match our internal POI format
    const places = (data.results || []).map((res: any) => ({
      poi_id: `om-${res.POSTAL}-${res.BUILDING}`,
      name: res.BUILDING !== 'NIL' ? res.BUILDING : res.ROAD_NAME,
      location: {
        latitude: parseFloat(res.LATITUDE),
        longitude: parseFloat(res.LONGITUDE)
      },
      formatted_address: res.ADDRESS,
      postal_code: res.POSTAL,
      source: 'onemap'
    }));

    return NextResponse.json({ places });
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy fetch failed', message: error.message }, { status: 500 });
  }
}
