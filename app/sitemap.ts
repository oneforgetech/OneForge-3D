import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/church';

const ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/listen', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/visit', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/give', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/connect', changeFrequency: 'monthly', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
