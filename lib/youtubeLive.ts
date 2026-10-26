/**
 * Picks the ONEFORGE livestream "Join us live" should open, using the YouTube Data API
 * (YOUTUBE_API_KEY). Each lookup costs 2 of the 10,000 free daily quota units, and answers are
 * reused for a minute, so even a busy Sunday stays far inside the free allowance.
 *
 * Kept free of other site imports so it can be tested on its own.
 */

const API = 'https://www.googleapis.com/youtube/v3';
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
/** A scheduled stream counts as "starting soon" from an hour before its start time... */
const SOON_BEFORE_MS = 60 * 60_000;
/** ...until two hours after it (a late start), so an old stream that never happened can't take over. */
const SOON_AFTER_MS = 2 * 60 * 60_000;

export type YouTubeVideo = {
  id: string;
  snippet?: { liveBroadcastContent?: string };
  liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string; scheduledStartTime?: string };
};

export const channelLivePage = (channelId: string) => `https://www.youtube.com/channel/${channelId}/live`;

/**
 * In order: the stream that's live now; a stream scheduled to start within the hour (its waiting room);
 * the most recently finished livestream. null if the channel has none of these among its last 50 videos.
 */
export function chooseLiveVideo(videos: YouTubeVideo[], now: number): string | null {
  const valid = videos.filter((v) => VIDEO_ID.test(v.id));

  const live = valid.find((v) => v.snippet?.liveBroadcastContent === 'live');
  if (live) return live.id;

  const soon = valid
    .filter((v) => v.snippet?.liveBroadcastContent === 'upcoming')
    .map((v) => ({ id: v.id, at: Date.parse(v.liveStreamingDetails?.scheduledStartTime ?? '') }))
    .filter((v) => v.at - now <= SOON_BEFORE_MS && now - v.at <= SOON_AFTER_MS)
    .sort((a, b) => a.at - b.at)[0];
  if (soon) return soon.id;

  const last = valid
    .filter((v) => v.liveStreamingDetails?.actualEndTime)
    .map((v) => ({ id: v.id, at: Date.parse(v.liveStreamingDetails?.actualStartTime ?? '') }))
    .filter((v) => !Number.isNaN(v.at))
    .sort((a, b) => b.at - a.at)[0];
  return last?.id ?? null;
}

async function youtube<T>(path: string, params: Record<string, string>, key: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/${path}?${new URLSearchParams({ ...params, key })}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[live] YouTube ${path} answered ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch {
    console.error(`[live] YouTube ${path} could not be reached`);
    return null;
  }
}

/** The address "Join us live" should go to right now. Falls back to the channel's live page. */
export async function liveTarget(channelId: string, now = Date.now()): Promise<string> {
  const fallback = channelLivePage(channelId);
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return fallback;

  // Every channel's uploads (live streams included) are in a playlist whose ID swaps "UC" for "UU".
  const uploads = await youtube<{ items?: { contentDetails?: { videoId?: string } }[] }>(
    'playlistItems',
    { part: 'contentDetails', playlistId: `UU${channelId.slice(2)}`, maxResults: '50' },
    key,
  );
  const ids = (uploads?.items ?? []).map((i) => i.contentDetails?.videoId ?? '').filter((id) => VIDEO_ID.test(id));
  if (!ids.length) return fallback;

  const details = await youtube<{ items?: YouTubeVideo[] }>('videos', { part: 'snippet,liveStreamingDetails', id: ids.join(',') }, key);
  const id = chooseLiveVideo(details?.items ?? [], now);
  return id ? `https://www.youtube.com/watch?v=${id}` : fallback;
}
