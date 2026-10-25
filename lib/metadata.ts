import type { Metadata } from 'next';

// Next.js merges a child route's `metadata` into the parent's *per field* —
// except `openGraph`/`twitter`, which are replaced wholesale when a child
// sets them, but inherited wholesale from the parent when a child doesn't.
// A page with only `title`/`description` therefore shows the *parent's*
// (root layout's — i.e. the homepage's) OG card when shared. This helper
// sets every page's `openGraph`/`twitter` explicitly so that can't happen.
export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'ONEFORGE',
      title,
      description,
      url: path,
      images: [{ url: '/brand/share-card.png', width: 1200, height: 630, alt: 'ONEFORGE' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/brand/share-card.png'],
    },
  };
}
