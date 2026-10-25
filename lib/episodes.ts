export interface Episode {
  id: string;
  title: string;
  uri: string;
  publishDate: string;
  artworkUrl: string;
}

export const SPOTIFY_SHOW_ID = '033Qs7sZ92DcGPDmYQUQEe';
export const SPOTIFY_SHOW_URL = `https://open.spotify.com/show/${SPOTIFY_SHOW_ID}`;
export const SPOTIFY_SHOW_EMBED_URL = `https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}?utm_source=generator&theme=0`;

/**
 * Latest episode of the OneForge show, taken from Spotify's public embed data.
 * Spotify only lists a show's full episode catalogue through its authenticated
 * Web API, so the up-to-date list is shown via the official show embed; this
 * entry is only the fallback: the site fetches the newest episode itself
 * (lib/spotifyLatest.ts, served at /api/latest-episode).
 */
export const latestEpisode: Episode = {
  id: '3BAyad89Z1Et0uwXO4NQGE',
  title: 'Deeper Than That, Ep.3 | Talk Back',
  uri: 'spotify:episode:3BAyad89Z1Et0uwXO4NQGE',
  publishDate: 'Oct 13, 2026',
  artworkUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab6765630000ba8a3ccb16cea6dfd8b0adfd3611',
};
