import { DEFAULT_API, KNOWN_APIS, UA, pickApi } from '@/lib/config';

const cache = new Map(); // api -> { data, ts }

async function fetchInstanceInfo(apiBase) {
  const cached = cache.get(apiBase);
  if (cached && Date.now() - cached.ts < 300_000) return cached.data;
  try {
    const r = await fetch(apiBase + '/', { headers: { 'User-Agent': UA }, next: { revalidate: 0 } });
    const data = await r.json();
    cache.set(apiBase, { data, ts: Date.now() });
    return data;
  } catch (e) {
    return { error: String(e) };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const apiBase = pickApi(searchParams.get('api'));
  const info = await fetchInstanceInfo(apiBase);
  const cobalt = info.cobalt || {};
  return Response.json({
    api: apiBase,
    defaultApi: DEFAULT_API,
    knownApis: KNOWN_APIS,
    version: cobalt.version || null,
    services: cobalt.services || [],
    turnstileSitekey: cobalt.turnstileSitekey || null,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
