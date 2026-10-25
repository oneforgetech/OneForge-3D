import { CHURCH_ADDRESS_STRUCTURED, CHURCH_EMAIL, CHURCH_FORMAL_NAME, CHURCH_GEO, CHURCH_NAME, SITE_URL, SOCIAL_LINKS } from './church';
import { SPOTIFY_SHOW_URL } from './episodes';

// Telephone is left out deliberately — no public line to list.
export function churchSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Church', 'LocalBusiness'],
    name: CHURCH_FORMAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/oneforge-logo.png`,
    email: CHURCH_EMAIL,
    address: {
      '@type': 'PostalAddress',
      ...CHURCH_ADDRESS_STRUCTURED,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CHURCH_GEO.latitude,
      longitude: CHURCH_GEO.longitude,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'https://schema.org/Sunday',
      opens: '09:00',
      closes: '10:15',
      validFrom: '2026-11-01',
    },
    sameAs: [...SOCIAL_LINKS.map((s) => s.href), SPOTIFY_SHOW_URL],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: CHURCH_NAME,
    url: SITE_URL,
  };
}

/** `items`: ordered list of `{ label, path }` for everything after Home. */
export function breadcrumbSchema(items: { label: string; path: string }[]) {
  const all = [{ label: 'Home', path: '/' }, ...items];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
