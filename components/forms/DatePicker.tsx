'use client';

import { useEffect, useRef, useState } from 'react';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@/components/ui/icons';
import styles from './DatePicker.module.css';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromISO(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function sameDay(a: Date | null, b: Date, m: number, y: number) {
  return !!a && a.getFullYear() === y && a.getMonth() === m && a.getDate() === b.getDate();
}

/**
 * dd/mm/yyyy display, with an inline popover calendar — replaces the native
 * date input, whose format follows browser locale (usually mm/dd/yyyy) and
 * has no visible grid until clicked.
 */
export function DatePicker({
  value,
  onChange,
  id,
  placeholder = 'dd/mm/yyyy',
  minDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  id?: string;
  placeholder?: string;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? fromISO(value) : null;
  const [viewDate, setViewDate] = useState(selected ?? minDate ?? new Date());
  const [focusedDay, setFocusedDay] = useState(selected?.getDate() ?? 1);

  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first

  const cells: (number | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function isDisabled(d: number) {
    if (!minDate) return false;
    const date = new Date(year, month, d);
    const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return date < min;
  }

  function selectDay(d: number) {
    if (isDisabled(d)) return;
    onChange(toISO(new Date(year, month, d)));
    setOpen(false);
    triggerRef.current?.focus();
  }

  function changeMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setViewDate(next);
    setFocusedDay((d) => Math.min(d, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  }

  function handleGridKeyDown(e: React.KeyboardEvent) {
    const deltas: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectDay(focusedDay);
      return;
    }
    const delta = deltas[e.key];
    if (!delta) return;
    e.preventDefault();
    const next = focusedDay + delta;
    if (next < 1 || next > daysInMonth) {
      changeMonth(next < 1 ? -1 : 1);
      return;
    }
    setFocusedDay(next);
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus();
    });
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? styles.value : styles.placeholder}>{value ? formatDisplay(value) : placeholder}</span>
        <IconCalendar />
      </button>

      {open && (
        <div className={styles.popover} role="dialog" aria-label="Choose a date">
          <div className={styles.popoverHeader}>
            <button type="button" className={styles.navButton} onClick={() => changeMonth(-1)} aria-label="Previous month">
              <IconChevronLeft size={15} />
            </button>
            <span className={styles.monthLabel}>
              {MONTHS[month]} {year}
            </span>
            <button type="button" className={styles.navButton} onClick={() => changeMonth(1)} aria-label="Next month">
              <IconChevronRight size={15} />
            </button>
          </div>

          <div className={styles.weekdays}>
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className={styles.grid} ref={gridRef} onKeyDown={handleGridKeyDown}>
            {cells.map((d, i) =>
              d === null ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  data-day={d}
                  disabled={isDisabled(d)}
                  tabIndex={d === focusedDay ? 0 : -1}
                  className={`${styles.day} ${sameDay(selected, new Date(year, month, d), month, year) ? styles.selected : ''}`}
                  onClick={() => selectDay(d)}
                  onFocus={() => setFocusedDay(d)}
                >
                  {d}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDisplay(iso: string) {
  const d = fromISO(iso);
  if (!d) return '';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
