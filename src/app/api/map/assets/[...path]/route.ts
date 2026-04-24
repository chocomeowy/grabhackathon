import { NextRequest, NextResponse } from 'next/server';

/**
 * PulseMap Asset Proxy
 * Tunnels ALL GrabMaps assets (Tiles, Glyphs, Sprites) through our backend.
 * This is the ultimate fix for CORS blocks on localhost.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const apiKey = process.env.NEXT_PUBLIC_GRABMAPS_API_KEY || process.env.GRABMAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Missing Key' }, { status: 401 });

  const pathSegments = (await params).path;
  const assetPath = pathSegments.join('/');
  
  // Reconstruct Grab URL
  // We handle both v2/vector and v1/fonts/sprites
  const baseUrl = assetPath.includes('vector') 
    ? 'https://maps.grab.com/maps/tiles/v2/vector'
    : 'https://maps.grab.com/maps/tiles/v1';
    
  const grabUrl = `${baseUrl}/${assetPath.replace('vector/', '')}`;

  try {
    const response = await fetch(grabUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Referer': 'https://maps.grab.com'
      }
    });

    if (!response.ok) {
       return new NextResponse(null, { status: response.status });
    }

    const data = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
