import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || process.env.GRABMAPS_API_KEY;
  
  if (!apiKey) {
    console.error('STYLE PROXY ERROR: API Key missing in environment.');
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  try {
    const styleUrl = 'https://maps.grab.com/api/style.json?theme=dark';
    
    console.log('STYLE PROXY: Fetching Grab style...');
    const response = await fetch(styleUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Grab-API-Key': apiKey // Adding as fallback for some Grab systems
      }
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`STYLE PROXY FATAL (${response.status}):`, err);
      throw new Error(`Grab Style API returned ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('STYLE PROXY: Expected JSON, got:', text);
      throw new Error('Grab Style API returned invalid format');
    }

    const style = await response.json();
    console.log('STYLE PROXY: Success. Returning dark theme.');
    
    return NextResponse.json(style, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('STYLE PROXY EXCEPTION:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
