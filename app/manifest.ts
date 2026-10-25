import type { MetadataRoute } from 'next';
import { CHURCH_FORMAL_NAME, CHURCH_NAME } from '@/lib/church';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: CHURCH_FORMAL_NAME,
    short_name: CHURCH_NAME,
    description: 'A church in Ogudu, Lagos, meeting Sundays at 9 AM. Come as you are.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d2b2b',
    theme_color: '#0d2b2b',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  };
}
