import { CHURCH_ADDRESS, SITE_URL } from './church';
import { PARTNER_GIFT_OPTIONS } from './partner';

/**
 * The thank-you email a giver gets from Boye after sending the /partner page form.
 * Built as email-safe HTML (tables and inline styles, which every email app understands) in the
 * site's colours and type, plus a plain-text version for apps that don't show formatting.
 * Preview it locally at /partner/thank-you-email.
 */

/** One line per need, from how the partner page describes it. */
const GIFT_THANKS: Record<string, string> = {
  LAUNCH:
    "By giving where it's needed most, you've let us put your gift to work wherever it will do the most good as we open our doors.",
  SOUND:
    'Your gift toward sound, light and screens means every word will be heard and every face seen, in the room and by everyone joining us online.',
  ROOM: 'Your gift toward the room will help turn a bare hall into a warm, welcoming place every Sunday, from the stage to the welcome lounge.',
  JUNIOR:
    'Your gift toward Junior Church gives children in all four of our age groups safe, bright rooms, with secure check-in so their parents can worship with peace of mind.',
  BASE: 'Your gift toward a working base gives our team a place to plan, meet people and care for them through the week, not just on Sundays.',
  WORD: "Your gift toward getting the word out will help us reach people who've stopped coming to church, or never came, through our launch campaign and Launch Sunday.",
  GROW: 'Your gift toward growth and foundations keeps GROUNDED, our growth course, free for everyone who takes it, and puts our registration, legal work and systems on solid ground.',
  YEAR1: 'Your gift toward our first year carries our running costs while giving grows, so we can give our attention to people from day one.',
  RESERVE: "Your gift toward our safety net builds a reserve of three months' running costs, so what we build together holds.",
  MONTHLY:
    'Your monthly partnership is what will let ONEFORGE pay its own way from our second year. Thank you for choosing to stand with us month after month.',
};

const OPENING = 'I wanted to write to you personally to thank you for your generosity, and for your willingness to partner with ONEFORGE.';
const SUPPORT =
  "Your support is helping us build a strong foundation and shape lives that will make a difference in every room that matters. Thank you for believing in what we're building.";
const BLESSING = 'May God bless you richly.';
const SIGNER = 'Boye Oloyede';
const SIGNER_ROLE = 'Lead Pastor, ONEFORGE';
const TAGLINE = 'Forged to lead. Called to impact.';

// Titles people often type before their name; the greeting skips them.
const TITLES = new Set([
  'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'pastor', 'pst', 'rev', 'revd', 'engr', 'barr', 'chief', 'hon', 'sir',
  'dcn', 'deacon', 'deaconess', 'elder', 'bro', 'sis', 'alhaji', 'alhaja', 'evang', 'apostle', 'bishop',
]);

/**
 * The first name to greet someone by: the first word of what they typed, split at spaces or full stops
 * ("Ada.Okafor" and "Dr. Ada Okafor" both give "Ada"). Titles and initials are skipped, a name typed all in
 * lower or upper case is tidied ("ADA" → "Ada"), and anything that isn't a letter is left out.
 * Returns '' when there's nothing usable, and the email then says "Dear friend".
 */
export function firstNameFrom(fullName: string): string {
  for (const word of fullName.split(/[\s.,]+/)) {
    const letters = (word.match(/^[\p{L}\p{M}'’-]+/u)?.[0] ?? '').replace(/^['’-]+|['’-]+$/g, '').slice(0, 40);
    if (letters.length < 2 || TITLES.has(letters.toLowerCase())) continue;
    const allOneCase = letters === letters.toLowerCase() || letters === letters.toUpperCase();
    return allOneCase ? letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase() : letters;
  }
  return '';
}

// Site colours, flattened to solid colours (email apps don't blend transparent ones reliably).
const C = {
  page: '#0a1519', // --of-ink
  card: '#0d2b2b', // --of-forest-black
  glass: '#1f3b3b', // --glass-bg-on-dark over the card
  line: '#304c4b', // --glass-border-on-dark over the card
  heading: '#e8f8f5', // --of-mint-white
  body: '#cfe2df',
  muted: '#9fb4b3', // --of-slate
  teal: '#00e5a0',
  orange: '#ff8c00',
};
const DISPLAY = "'Sora', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const BODY = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', 'SFMono-Regular', Menlo, Consolas, monospace";

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function partnerThanksEmail({ name, gift, assetBase = SITE_URL }: { name: string; gift: string; assetBase?: string }) {
  const first = firstNameFrom(name);
  const giftTitle = (PARTNER_GIFT_OPTIONS.find((o) => o.value === gift)?.label ?? gift).replace(/\s*\([^)]*\)$/, '');
  const giftLine = GIFT_THANKS[gift] ?? '';
  const subject = first ? `Thank you, ${first}` : 'Thank you';
  const greeting = `Dear ${first || 'friend'},`;
  const site = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const text = [
    greeting,
    OPENING,
    giftLine,
    SUPPORT,
    BLESSING,
    `${SIGNER}\n${SIGNER_ROLE}`,
    TAGLINE,
    `—\nONEFORGE · ${CHURCH_ADDRESS}\n${SITE_URL}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const p = (content: string, extra = '') =>
    `<p style="margin:0 0 20px;font-family:${BODY};font-size:17px;line-height:1.65;color:${C.body};${extra}">${content}</p>`;

  const giftCard = giftLine
    ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 26px;">
                <tr>
                  <td bgcolor="${C.glass}" style="background:${C.glass};border:1px solid ${C.line};border-radius:20px;padding:24px;">
                    <p style="margin:0 0 12px;font-family:${DISPLAY};font-weight:700;font-size:22px;line-height:1.2;color:${C.heading};">${esc(giftTitle)}</p>
                    <p style="margin:0;font-family:${BODY};font-size:16px;line-height:1.6;color:${C.body};">${esc(giftLine)}</p>
                  </td>
                </tr>
              </table>`
    : '';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; background: ${C.page}; -webkit-text-size-adjust: 100%; }
  a { color: ${C.teal}; }
  @media (max-width: 620px) {
    .card { padding: 32px 22px 30px !important; border-radius: 22px !important; }
    .title { font-size: 38px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(OPENING)}${'&#8199;&#65279;&#847; '.repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page};">
  <tr>
    <td align="center" style="padding:36px 12px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
        <tr>
          <td align="center" style="padding:0 0 26px;">
            <a href="${SITE_URL}" style="text-decoration:none;"><img src="${assetBase}/brand/oneforge-logo.png" width="96" alt="ONEFORGE" style="display:block;width:96px;height:auto;border:0;"></a>
          </td>
        </tr>
        <tr>
          <td class="card" bgcolor="${C.card}" style="background:${C.card};background-image:radial-gradient(circle at 100% 0%, rgba(255,140,0,0.16), rgba(255,140,0,0) 46%), linear-gradient(165deg, #10393a 0%, ${C.card} 55%, #0b2424 100%);border:1px solid ${C.line};border-radius:28px;padding:44px 44px 40px;">
            <h1 class="title" style="margin:0 0 30px;font-family:${DISPLAY};font-weight:800;font-size:46px;line-height:1.02;letter-spacing:-0.035em;color:${C.heading};">${esc(subject)}.</h1>
            ${p(esc(greeting))}
            ${p(esc(OPENING))}${giftCard}
            ${p(esc(SUPPORT))}
            ${p(esc(BLESSING), 'margin-bottom:30px;')}
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="padding-right:16px;">
                  <img src="${assetBase}/email/boye-oloyede.jpg" width="64" height="64" alt="${SIGNER}" style="display:block;width:64px;height:64px;border-radius:50%;border:2px solid ${C.teal};">
                </td>
                <td valign="middle">
                  <p style="margin:0 0 4px;font-family:${DISPLAY};font-weight:700;font-size:19px;color:${C.heading};">${SIGNER}</p>
                  <p style="margin:0;font-family:${MONO};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">${SIGNER_ROLE}</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:34px;">
              <tr>
                <td style="padding-top:26px;border-top:1px solid ${C.line};">
                  <div style="width:32px;height:3px;border-radius:3px;background:${C.orange};margin:0 0 14px;line-height:3px;font-size:0;">&nbsp;</div>
                  <p style="margin:0;font-family:${DISPLAY};font-weight:800;font-size:24px;line-height:1.2;letter-spacing:-0.02em;color:${C.teal};">${TAGLINE}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:26px 20px 0;font-family:${BODY};font-size:13px;line-height:1.6;color:${C.muted};">
            ONEFORGE · ${esc(CHURCH_ADDRESS)}<br>
            <a href="${SITE_URL}" style="color:${C.teal};text-decoration:none;">${esc(site)}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
