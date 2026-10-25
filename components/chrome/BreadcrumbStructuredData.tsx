import { breadcrumbSchema } from '@/lib/structuredData';

/** `items`: ordered list of `{ label, path }` for everything after Home. */
export function BreadcrumbStructuredData({ items }: { items: { label: string; path: string }[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(items)).replace(/</g, '\\u003c') }}
    />
  );
}
