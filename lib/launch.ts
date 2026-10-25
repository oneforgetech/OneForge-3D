// Weekly Sunday gatherings begin at this date (Africa/Lagos, UTC+1). Any copy
// that says "we meet" is untrue before then, so copy switches on this date
// instead of needing a manual edit on launch day.
export const LAUNCH_DATE = new Date('2026-11-01T00:00:00+01:00');

export function hasLaunched(now: Date = new Date()): boolean {
  return now.getTime() >= LAUNCH_DATE.getTime();
}

/** Picks `before` or `after` copy depending on whether LAUNCH_DATE has passed. */
export function launchCopy<T>(before: T, after: T, now?: Date): T {
  return hasLaunched(now) ? after : before;
}

export type Countdown = { days: number; hours: number; minutes: number; seconds: number };

/** Time remaining until LAUNCH_DATE, floored at zero once it's passed. */
export function getCountdown(now: Date = new Date()): Countdown {
  const diff = Math.max(0, LAUNCH_DATE.getTime() - now.getTime());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}
