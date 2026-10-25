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
 * single entry powers the hero's "Listen now" widget and should be refreshed
 * (or replaced by an API/RSS fetch) when a new episode is released.
 */
export const latestEpisode: Episode = {
  id: '4XDglIp6EEynVwpj0TlnZW',
  title: 'Get Better, Ep.2 | Know Your Work',
  uri: 'spotify:episode:4XDglIp6EEynVwpj0TlnZW',
  publishDate: 'Sep 18, 2026',
  artworkUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab6765630000ba8a3ccb16cea6dfd8b0adfd3611',
};
