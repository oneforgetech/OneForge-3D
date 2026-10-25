import { NextResponse } from 'next/server';
import { getLatestEpisode } from '@/lib/spotifyLatest';

export const revalidate = 1800;

export async function GET() {
  return NextResponse.json(await getLatestEpisode(), {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600' },
  });
}
