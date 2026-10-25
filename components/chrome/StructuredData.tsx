import { churchSchema, websiteSchema } from '@/lib/structuredData';

// Rendered once, site-wide (app/layout.tsx) — repeating Church/WebSite JSON-LD
// on every page is correct and standard, so any page a crawler lands on
// first is fully self-describing.
export function StructuredData() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(churchSchema()).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()).replace(/</g, '\\u003c') }} />
    </>
  );
}
