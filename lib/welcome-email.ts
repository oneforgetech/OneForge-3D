import { CHURCH_ADDRESS, SITE_URL } from './church';

/**
 * The short auto-reply someone gets after filling in "Connect with us" on /welcome.
 * Built as email-safe HTML (tables and inline styles, which every email app understands) in the
 * site's colours and type, plus a plain-text version for apps that don't show formatting.
 * Preview it locally at /welcome/thank-you-email.
 */

const BODY_LINE = "Thanks for letting us know you came. We've got it, and a real person on our team will follow up if you asked us to.";
const SIGNOFF = 'See you around,';
const SIGNER = 'The ONEFORGE Team';
const TAGLINE = 'Forged to lead. Called to impact.';

// Site colours, flattened to solid colours (email apps don't blend transparent ones reliably).
const C = {
  page: '#0a1519', // --of-ink
  card: '#0d2b2b', // --of-forest-black
  line: '#304c4b', // --glass-border-on-dark over the card
  heading: '#e8f8f5', // --of-mint-white
  body: '#cfe2df',
  muted: '#9fb4b3', // --of-slate
  teal: '#00e5a0',
  orange: '#ff8c00',
};
const DISPLAY = "'Sora', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const BODY_FONT = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function welcomeConnectReplyEmail({ firstName, assetBase = SITE_URL }: { firstName: string; assetBase?: string }) {
  const first = firstName.trim();
  const subject = first ? `Thanks, ${first} — we've got it.` : "Thanks — we've got it.";
  const greeting = `Hi ${first || 'there'},`;
  const site = SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const text = [greeting, BODY_LINE, `${SIGNOFF}\n${SIGNER}`, TAGLINE, `—\nONEFORGE · ${CHURCH_ADDRESS}\n${SITE_URL}`].join('\n\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; background: ${C.page}; -webkit-text-size-adjust: 100%; }
  a { color: ${C.teal}; }
  @media (max-width: 620px) {
    .card { padding: 32px 22px 30px !important; border-radius: 22px !important; }
    .title { font-size: 32px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(BODY_LINE)}${'&#8199;&#65279;&#847; '.repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page};">
  <tr>
    <td align="center" style="padding:36px 12px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td align="center" style="padding:0 0 26px;">
            <a href="${SITE_URL}" style="text-decoration:none;"><img src="${assetBase}/brand/oneforge-logo.png" width="88" alt="ONEFORGE" style="display:block;width:88px;height:auto;border:0;"></a>
          </td>
        </tr>
        <tr>
          <td class="card" bgcolor="${C.card}" style="background:${C.card};background-image:radial-gradient(circle at 100% 0%, rgba(255,140,0,0.16), rgba(255,140,0,0) 46%), linear-gradient(165deg, #10393a 0%, ${C.card} 55%, #0b2424 100%);border:1px solid ${C.line};border-radius:28px;padding:40px 40px 36px;">
            <h1 class="title" style="margin:0 0 24px;font-family:${DISPLAY};font-weight:800;font-size:36px;line-height:1.08;letter-spacing:-0.03em;color:${C.heading};">${esc(subject)}</h1>
            <p style="margin:0 0 18px;font-family:${BODY_FONT};font-size:17px;line-height:1.65;color:${C.body};">${esc(greeting)}</p>
            <p style="margin:0 0 28px;font-family:${BODY_FONT};font-size:17px;line-height:1.65;color:${C.body};">${esc(BODY_LINE)}</p>
            <p style="margin:0;font-family:${BODY_FONT};font-size:17px;line-height:1.5;color:${C.body};">${esc(SIGNOFF)}<br><strong style="color:${C.heading};">${esc(SIGNER)}</strong></p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
              <tr>
                <td style="padding-top:24px;border-top:1px solid ${C.line};">
                  <div style="width:32px;height:3px;border-radius:3px;background:${C.orange};margin:0 0 14px;line-height:3px;font-size:0;">&nbsp;</div>
                  <p style="margin:0;font-family:${DISPLAY};font-weight:800;font-size:22px;line-height:1.2;letter-spacing:-0.02em;color:${C.teal};">${TAGLINE}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:26px 20px 0;font-family:${BODY_FONT};font-size:13px;line-height:1.6;color:${C.muted};">
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
