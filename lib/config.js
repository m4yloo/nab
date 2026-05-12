export const DEFAULT_API = process.env.COBALT_API || 'https://cobalt-api-production-f5b2.up.railway.app';
export const KNOWN_APIS = [DEFAULT_API, 'https://api.cobalt.tools'];
export const UA = 'nab/1.0';

export function pickApi(value) {
  if (!value) return DEFAULT_API;
  const v = value.trim().replace(/\/$/, '');
  if ((v.startsWith('https://') || v.startsWith('http://')) && KNOWN_APIS.includes(v)) return v;
  return DEFAULT_API;
}
