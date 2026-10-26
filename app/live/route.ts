import { YOUTUBE_CHANNEL_ID } from '@/lib/church';
import { liveTarget } from '@/lib/youtubeLive';

/**
 * oneforge.org/live — every "Join us live" link points here. It sends people on to the ONEFORGE stream
 * that's live now, starting within the hour, or most recently finished (see lib/youtubeLive.ts).
 */
export async function GET() {
  const target = await liveTarget(YOUTUBE_CHANNEL_ID);
  return new Response(null, { status: 307, headers: { Location: target, 'Cache-Control': 'no-store' } });
}
