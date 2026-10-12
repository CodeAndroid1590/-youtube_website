module.exports = [
"[project]/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/site.ts [app-rsc] (ecmascript)");
;
;
;
const SITE_URL = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSiteUrl"])();
const metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Claude Code, AI Coding & Free AI Tool Tutorials | AIWiredOfficial",
        template: "%s | AIWiredOfficial"
    },
    description: "Step-by-step tutorials on Claude Code, free AI coding tools, local AI models, and web development — with full video transcripts you can search and read.",
    verification: {
        google: "B_EJK-6YeAu2xpggIdHK1RQK5RDMd7ImfdTf4dBV5Tc"
    },
    alternates: {
        canonical: "/"
    }
};
function RootLayout({ children }) {
    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "AIWiredOfficial",
        url: SITE_URL,
        description: "Step-by-step tutorials on Claude Code, free AI coding tools, local AI models, and web development, with full video transcripts."
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "en",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            className: "antialiased bg-white text-gray-900 min-h-screen",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("script", {
                    type: "application/ld+json",
                    dangerouslySetInnerHTML: {
                        __html: JSON.stringify(websiteJsonLd)
                    }
                }, void 0, false, {
                    fileName: "[project]/app/layout.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/app/layout.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/layout.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/lib/site.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSiteUrl",
    ()=>getSiteUrl
]);
/**
 * Resolves the canonical site URL used for the sitemap, canonical tags, and
 * structured data. This exists because a misconfigured
 * NEXT_PUBLIC_SITE_URL in the hosting environment (e.g. a stray internal
 * Vercel value instead of the real domain) silently produces a broken
 * sitemap and wrong canonical URLs — which stops Google from indexing
 * pages at all, with no visible error anywhere. We validate the value
 * instead of trusting it blindly, and fall back to the known-good
 * production domain if it looks malformed.
 */ const FALLBACK_SITE_URL = "https://devnesthub.com";
function isValidSiteUrl(value) {
    try {
        const parsed = new URL(value);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
        // Underscores are not valid in real hostnames, and a bare hostname with
        // no dot (other than localhost) is almost never a real public domain —
        // both are strong signals of a misconfigured env var rather than an
        // actual deployment URL.
        if (parsed.hostname.includes("_")) return false;
        if (parsed.hostname !== "localhost" && !parsed.hostname.includes(".")) return false;
        return true;
    } catch  {
        return false;
    }
}
function getSiteUrl() {
    const raw = ("TURBOPACK compile-time value", "https://devnesthub.com/");
    if (raw && isValidSiteUrl(raw)) {
        return raw.replace(/\/$/, "");
    }
    return FALLBACK_SITE_URL;
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-rsc] (ecmascript)").vendored['react-rsc'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_0hzmgsw._.js.map