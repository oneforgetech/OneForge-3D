export const CHURCH_NAME = 'ONEFORGE';
export const CHURCH_FORMAL_NAME = 'ONEFORGE Church';
export const CHURCH_EMAIL = 'hello@oneforge.org';
export const CHURCH_ADDRESS = "Detutu's Event Place, 2 Association Close, Ogudu, Lagos";
export const CHURCH_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CHURCH_ADDRESS)}`;
export const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/DBHMV3xIBag8zw2EJpSIR5';
export const CHURCH_SUNDAY_TIME = '9:00 AM';

// Broken out for structured data (PostalAddress) — kept alongside the
// display string above rather than derived from it, so neither has to be
// parsed out of the other. No postal code: not reliably used for this
// address, and not worth guessing for a schema field that's optional.
export const CHURCH_ADDRESS_STRUCTURED = {
  streetAddress: "Detutu's Event Place, 2 Association Close",
  addressLocality: 'Ogudu',
  addressRegion: 'Lagos',
  addressCountry: 'NG',
} as const;

// Venue coordinates (Detutu's Event Place), for the structured-data `geo`
// field — local/map SEO.
export const CHURCH_GEO = { latitude: 6.575596, longitude: 3.396663 } as const;

// The site's public address. Override with NEXT_PUBLIC_SITE_URL only for
// local/tunnel testing — share tags, canonical URLs, the sitemap and
// structured data should otherwise always point at the real domain, not
// wherever the dev server happens to be forwarded from.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oneforge.org';

// Shown exactly as the bank registered it — the one exception to the ONEFORGE
// running-text casing rule.
export const GIVING_ACCOUNT_NAME = 'Oneforge Global Ministries';
export const GIVING_ACCOUNTS = [
  { bank: 'FCMB', number: '1047269330' },
  { bank: 'Providus Unity Bank', number: '1310548972' },
  { bank: 'Premium Trust Bank', number: '0010246634' },
] as const;

/** The ONEFORGE YouTube channel (used for live services; messages stay on Spotify). */
export const YOUTUBE_CHANNEL_ID = 'UC54QXOmFbgFNhWnjRWd-3_Q';

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/one.forge' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61575405565738' },
  { label: 'YouTube', href: `https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}` },
] as const;

// "Join us live": app/live/route.ts sends people to the stream that's on now, starting within the
// hour, or most recently finished (it needs YOUTUBE_API_KEY; without it, the channel's live page).
export const LIVE_URL = '/live';

// YouTube Music. NOTE: this is the channel's page on YouTube Music; replace with the exact
// podcast/playlist URL if the team has one.
export const YOUTUBE_MUSIC_URL = 'https://music.youtube.com/channel/UC54QXOmFbgFNhWnjRWd-3_Q';

/**
 * The "Here's Your Invitation" film on the home hero. Paste its YouTube link here (watch, youtu.be,
 * /live/, /shorts/ or /embed/ forms all work); NEXT_PUBLIC_INVITATION_VIDEO_URL overrides it.
 * While empty, the button is not shown.
 */
export const INVITATION_VIDEO_URL = process.env.NEXT_PUBLIC_INVITATION_VIDEO_URL || 'https://www.youtube.com/watch?v=BauFAdTf_kY';
