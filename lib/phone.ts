/**
 * Store phone numbers as E.164 (+2348031234567). Fixes the old "+08031234567"
 * entries, which came from putting "+" in front of a local number's digits.
 *
 * Nigerian numbers: 0XXXXXXXXXX, XXXXXXXXXX (lost the 0), 234XXXXXXXXXX, +234…,
 * +0XXXXXXXXXX. Other international numbers that start with + are kept as +digits.
 * Anything that still doesn't look right is returned trimmed, exactly as typed,
 * so nothing is lost and the Hub flags it for a person to check.
 */
export function toE164(raw: string): string {
  const typed = raw.trim();
  if (!typed) return '';
  const plus = typed.startsWith('+');
  // Digits only, so "+0803…" (a local number with a stray +) is read as 0803…
  const d = typed.replace(/\D/g, '');
  if (d.startsWith('00')) return `+${d.slice(2)}`; // 00 international prefix
  if (/^0[789][01]\d{8}$/.test(d)) return `+234${d.slice(1)}`;
  if (/^[789][01]\d{8}$/.test(d)) return `+234${d}`;
  if (/^234[789][01]\d{8}$/.test(d)) return `+${d}`;
  if (plus && !d.startsWith('0') && !d.startsWith('234') && d.length >= 8 && d.length <= 15) return `+${d}`;
  return typed;
}

/** Trim and lower-case. Never "corrects" anything else. */
export function cleanEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
