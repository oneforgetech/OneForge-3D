import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/church';

// Allow everything on the real domain; block crawlers everywhere else
// (local dev, tunnels, a future staging host) so pre-launch pages don't get
// indexed under the wrong address. Matches the apex domain or a `www.`
// prefix of it — not a plain substring check, which would silently fail to
// recognize `www.oneforge.org` as production (or worse, match hosts that
// merely contain the domain as a substring).
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host') ?? '';
  const siteHost = new URL(SITE_URL).hostname;
  const isProduction = host === siteHost || host === `www.${siteHost}`;

  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
