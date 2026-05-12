import { DEFAULT_API, KNOWN_APIS, UA, pickApi } from '@/lib/config';

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch {}

  const apiBase = pickApi(body.api);
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': UA,
  };
  if (body.turnstileToken) headers['cf-turnstile-response'] = body.turnstileToken;
  if (body['cf-turnstile-response']) headers['cf-turnstile-response'] = body['cf-turnstile-response'];

  try {
    const r = await fetch(apiBase + '/session', {
      method: 'POST',
      headers,
      body: '{}',
    });
    const data = await r.json();
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return Response.json(
      { status: 'error', error: { code: 'network', message: String(e) } },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
