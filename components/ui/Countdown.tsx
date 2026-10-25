'use client';

import { useEffect, useState } from 'react';
import { type Countdown as CountdownT, getCountdown, hasLaunched } from '@/lib/launch';

const UNITS: { key: keyof CountdownT; label: string }[] = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
];

/** Ticking clock to the first Sunday. Renders nothing after launch (and on the server). */
export function Countdown({ className, unitClass, numClass, labelClass }: { className?: string; unitClass?: string; numClass?: string; labelClass?: string }) {
  const [c, setC] = useState<CountdownT | null>(null);

  useEffect(() => {
    if (hasLaunched()) return;
    const frame = requestAnimationFrame(() => setC(getCountdown()));
    const id = setInterval(() => setC(getCountdown()), 1000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(id);
    };
  }, []);

  if (!c || hasLaunched()) return null;
  return (
    <div className={className} role="timer" aria-label={`${c.days} days, ${c.hours} hours, ${c.minutes} minutes and ${c.seconds} seconds until our first Sunday`}>
      {UNITS.map((u) => (
        <div key={u.key} className={unitClass} aria-hidden="true">
          <span className={numClass}>{String(c[u.key]).padStart(2, '0')}</span>
          <span className={labelClass}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}
