import { UA } from '@/lib/config';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tunnel = searchParams.get('u') || '';
  const filename = searchParams.get('fn') || 'video';

  if (!tunnel.startsWith('https://') && !tunnel.startsWith('http://')) {
    return new Response('bad tunnel', { status: 400 });
  }

  try {
    const upstreamHeaders = new Headers({
      'User-Agent': UA,
      'Accept': '*/*',
    });
    const rng = request.headers.get('range');
    if (rng) upstreamHeaders.set('Range', rng);

    const up = await fetch(tunnel, { headers: upstreamHeaders, redirect: 'manual' });

    const safeName = encodeURIComponent(filename);
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${safeName}"; filename*=UTF-8''${safeName}`);
    headers.set('Cache-Control', 'no-store');

    for (const h of ['Content-Type', 'Content-Length', 'Accept-Ranges', 'Content-Range', 'Last-Modified', 'ETag']) {
      const v = up.headers.get(h);
      if (v) headers.set(h, v);
    }

    return new Response(up.body, {
      status: up.status,
      headers,
    });
  } catch (e) {
    return new Response(`stream error: ${e}`, { status: 502 });
  }
}
