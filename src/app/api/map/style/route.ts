import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || process.env.GRABMAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
  }

  try {
    const styleUrl = 'https://maps.grab.com/api/style.json?theme=dark';
    const response = await fetch(styleUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) throw new Error(`Grab Style API returned ${response.status}`);
    
    let styleText = await response.text();
    
    // REWRITE URLS to use our proxy
    // 1. Vector Tiles: https://maps.grab.com/maps/tiles/v2/vector/ -> /api/map/assets/vector/
    styleText = styleText.replace(/https:\/\/maps\.grab\.com\/maps\/tiles\/v2\/vector\//g, '/api/map/assets/vector/');
    
    // 2. Glyphs/Sprites: https://maps.grab.com/maps/tiles/v1/ -> /api/map/assets/
    styleText = styleText.replace(/https:\/\/maps\.grab\.com\/maps\/tiles\/v1\//g, '/api/map/assets/');

    const style = JSON.parse(styleText);
    
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
