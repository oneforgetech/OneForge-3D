const isDev = process.env.NODE_ENV !== 'production';

// Inline scripts are needed (pre-paint script, JSON-LD, Next's own bootstrap), so 'unsafe-inline'
// stays on script-src; everything else is locked to what the site actually uses.
// Google Analytics: the hosts Google lists for GA4 (https://developers.google.com/tag-platform/security/guides/csp).
// gtag.js also sends a copy of each hit to google.com, and Google signals uses the visitor's country
// domain: google.com.ng covers Nigeria. Any other country domain being blocked only loses demographics.
const GA_SCRIPT = 'https://*.googletagmanager.com';
const GA_HOSTS =
  'https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://*.google.com.ng';
const GA_IMG = GA_HOSTS;
const GA_CONNECT = GA_HOSTS;
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://open.spotify.com https://*.spotifycdn.com ${GA_SCRIPT}${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://*.spotifycdn.com https://i.scdn.co ${GA_IMG}`,
  "font-src 'self' data:",
  `connect-src 'self' https://open.spotify.com https://*.spotify.com https://*.spotifycdn.com ${GA_CONNECT}` + (isDev ? ' ws: wss:' : ''),
  "frame-src https://open.spotify.com https://www.youtube-nocookie.com https://www.youtube.com",
  "media-src 'self' https://*.spotifycdn.com https://*.scdn.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    // Only in production: the dev server, tunnels and LAN testing need to stay unrestricted.
    return isDev ? [] : [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  // lets a production build live beside the dev server's .next (NEXT_DIST_DIR=.next-prod)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Dev-only: let the site load its JS when opened through a tunnel / port forward
  // (otherwise hydration is blocked and client effects like the cursor fire never run).
  allowedDevOrigins: [
    // phones/tablets/laptops on the same Wi-Fi (home and office networks)
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    "*.local",
    "**.devtunnels.ms",
    "**.github.dev",
    "**.app.github.dev",
    "**.ngrok-free.app",
    "**.ngrok-free.dev",
    "**.ngrok.app",
    "**.ngrok.io",
    "**.trycloudflare.com",
    "**.loca.lt",
    "**.localtunnel.me",
    "**.lhr.life",
    "**.serveousercontent.com",
  ],
};

export default nextConfig;
