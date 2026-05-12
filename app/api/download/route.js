import { DEFAULT_API, KNOWN_APIS, UA, pickApi } from '@/lib/config';

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch {}

  const { jwt, payload, api } = body;
  if (!jwt || !payload?.url) {
    return Response.json(
      { status: 'error', error: { code: 'request.missing' } },
      { status: 400 }
    );
  }

  const apiBase = pickApi(api);

  try {
    const r = await fetch(apiBase + '/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
        'User-Agent': UA,
      },
      body: JSON.stringify(payload),
    });
    const res = await r.json();
    const st = (res.status || '').toLowerCase();

    if (st === 'redirect' || st === 'tunnel') {
      const tunnelUrl = res.url || '';
      const fn = res.filename || 'video.mp4';
      res.proxyUrl = `/api/stream?u=${encodeURIComponent(tunnelUrl)}&fn=${encodeURIComponent(fn)}`;
    } else if (st === 'picker') {
      for (const item of res.picker || []) {
        if (item.url) {
          item.proxyUrl = `/api/stream?u=${encodeURIComponent(item.url)}&fn=${encodeURIComponent(item.filename || 'media')}`;
        }
      }
    }

    return Response.json(res, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return Response.json(
      { status: 'error', error: { code: 'network', message: String(e) } },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
