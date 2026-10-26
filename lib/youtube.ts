/** Pulls the 11-character video id out of any common YouTube link (or a bare id). */
export function youtubeId(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const u = new URL(v);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
    else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      id = u.searchParams.get('v');
      if (!id) {
        const m = /^\/(?:embed|live|shorts|v)\/([\w-]{11})/.exec(u.pathname);
        id = m?.[1] ?? null;
      }
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
