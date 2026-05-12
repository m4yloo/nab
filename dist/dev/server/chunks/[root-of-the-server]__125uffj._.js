module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/config.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_API",
    ()=>DEFAULT_API,
    "KNOWN_APIS",
    ()=>KNOWN_APIS,
    "UA",
    ()=>UA,
    "pickApi",
    ()=>pickApi
]);
const DEFAULT_API = process.env.COBALT_API || 'https://cobalt-api-production-f5b2.up.railway.app';
const KNOWN_APIS = [
    DEFAULT_API,
    'https://api.cobalt.tools'
];
const UA = 'nab/1.0';
function pickApi(value) {
    if (!value) return DEFAULT_API;
    const v = value.trim().replace(/\/$/, '');
    if ((v.startsWith('https://') || v.startsWith('http://')) && KNOWN_APIS.includes(v)) return v;
    return DEFAULT_API;
}
}),
"[project]/app/api/config/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/config.js [app-route] (ecmascript)");
;
const dynamic = 'force-static';
const cache = new Map(); // api -> { data, ts }
async function fetchInstanceInfo(apiBase) {
    const cached = cache.get(apiBase);
    if (cached && Date.now() - cached.ts < 300_000) return cached.data;
    try {
        const r = await fetch(apiBase + '/', {
            headers: {
                'User-Agent': __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["UA"]
            },
            next: {
                revalidate: 0
            }
        });
        const data = await r.json();
        cache.set(apiBase, {
            data,
            ts: Date.now()
        });
        return data;
    } catch (e) {
        return {
            error: String(e)
        };
    }
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const apiBase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pickApi"])(searchParams.get('api'));
    const info = await fetchInstanceInfo(apiBase);
    const cobalt = info.cobalt || {};
    return Response.json({
        api: apiBase,
        defaultApi: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_API"],
        knownApis: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$config$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["KNOWN_APIS"],
        version: cobalt.version || null,
        services: cobalt.services || [],
        turnstileSitekey: cobalt.turnstileSitekey || null
    }, {
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__125uffj._.js.map