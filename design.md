# OneForge — Technical Design Guide

*Distilled from `concept-note.md`. This is the build spec — if you need the reasoning behind a decision, it's in the concept note; if you need to know what to build, it's here.*

---

## 1. Site Structure

**This is a single landing page.** No multi-page routing for the current build. Five nav items; two are in-page scroll sections, three open modals.

| Nav item | Type | Behavior |
|---|---|---|
| *(Home/logo)* | Scroll target | Scrolls to top/hero |
| About OneForge | **Section** | Scrolls to in-page section |
| Plan a Visit | **Modal** | Opens modal — service times, location, what to expect |
| Listen | **Modal** | Opens modal — latest 10 podcast episodes + player |
| Next Steps | **Section** | Scrolls to in-page section |
| Give | **Modal** | Opens modal — account details + online giving link |

**Page sections, top to bottom:** Hero → About OneForge → Next Steps → Footer. (A hero isn't in your list of named sections, but every landing page needs an entry moment — flag this assumption for sign-off if a hero wasn't intended.)

**Modals are overlays, not routes.** They open above the current scroll position and return the user exactly where they were on close. Do not implement them as separate pages or change the URL path (a `#hash` or query param for deep-linking/sharing is fine and encouraged — see §4.4).

---

## 2. Design Tokens

```css
:root {
  /* Brand colors */
  --of-teal: #00E5A0;
  --of-teal-logo: #06EDC3;   /* wordmark-only tint */
  --of-teal-deep: #009B8D;
  --of-navy: #1B3A4B;
  --of-orange: #FF8C00;
  --of-yellow: #FFD700;
  --of-coral: #FF4D4D;       /* accent only */
  --of-violet: #7B2FBE;      /* accent only */
  --of-forest-black: #0D2B2B;
  --of-mint-white: #E8F8F5;
  --of-ivory: #F5F0E1;

  /* Typography */
  --font-display: 'Sora', sans-serif;   /* headings */
  --font-body: 'Inter', sans-serif;     /* body copy */
  --font-mono: 'IBM Plex Mono', monospace; /* labels, kickers, timestamps */

  /* Spacing — generous by default; see §3 principle */
  --space-unit: 8px;
  --section-padding-desktop: 140px;
  --section-padding-mobile: 72px;
  --content-max-width: 1240px;
  --content-text-max-width: 640px;  /* caps line length on body-copy blocks */
  --card-gap: 32px;
  --section-heading-gap: 28px;      /* space between a heading and the copy under it */

  /* Motion */
  --ease-standard: cubic-bezier(.22,1,.36,1);
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 700ms;
}
```

**Color usage — dark-forward:** Forge Navy / Forest Black are the default section backgrounds (including hero). Ivory/white/mint sections are used deliberately as periodic rest points (every 2–3 sections, and for any dense-reading content) — not the default. Orange = primary CTA. Teal = links, active states, focus rings, secondary accents. Coral/Violet = badges only, never a section background.

**Gradients — only these three, never a new one:**
- `linear-gradient(135deg, var(--of-navy) 0%, var(--of-navy) 26%, var(--of-teal-deep) 54%, var(--of-orange) 84%, var(--of-yellow) 100%)` — "Full Forge," hero/feature use
- `linear-gradient(160deg, var(--of-navy), var(--of-teal-deep))` — "Deep Forge," secondary dark sections
- `linear-gradient(160deg, var(--of-ivory), var(--of-teal))` — "Light Forge," light rest-point sections

**Accessibility:** every text/background pairing — including text over any gradient — must pass WCAG AA contrast. Test light text on the lightest point of a gradient and dark text on the darkest point.

---

## 3. Typography Scale

**Principle: text runs large and sections breathe.** This isn't a minor style note — it's a hard requirement. Undersized type and cramped sections are the fastest way to make this feel like a generic template rather than a considered site. When in doubt, size up and add space, not the reverse.

| Role | Font | Weight | Size |
|---|---|---|---|
| H1 (hero) | Sora | ExtraBold (800) | 44–72px, clamp() fluid — err toward the top of this range, not the bottom |
| H2 (section) | Sora | Bold (700) | 30–46px, clamp() fluid |
| H3 (card/sub) | Sora | Bold (700) | 18–22px |
| Body | Inter | Regular/Medium | 17–19px — never drop below 16px for primary reading copy |
| Kicker/label/timestamp | IBM Plex Mono | Regular | 11–13px, letter-spacing .06–.08em |

- Line length for body copy: keep to roughly 60–75 characters per line even at the larger size — width the text block, don't let it run edge-to-edge.
- Line height: 1.5–1.6 for body copy, 1.1–1.2 for display headings — generous enough that large type doesn't feel dense.
- Section headings get real room above and below them (see spacing update below) — never let a heading sit tight against the paragraph before it and the content after it in the same way; the gap above a heading should read as a clear break from the previous section.

Logo wordmark is a custom script mark (not a system font) — see §6. Placeholder only until the real asset is supplied.

---

## 4. Core Components

### 4.1 Navigation
- Sticky top bar, translucent dark background with backdrop-blur (`rgba(13,43,43,.88)` + `backdrop-filter: blur(8px)`) — stays legible over any section it scrolls above.
- Active-state indicator (teal underline) driven by scrollspy for the two scroll-section items (About, Next Steps); modal-trigger items (Plan a Visit, Listen, Give) don't take an "active" scroll state — they're actions, not destinations.
- Collapses to a hamburger/menu icon under ~940px; standard slide-in or full-screen mobile nav pattern.

### 4.2 Section template
- Full-bleed background (color or gradient per §2), inner content constrained to `--content-max-width`, generous vertical padding (`--section-padding-desktop` / `-mobile`) — don't tighten these to fit more on screen; the breathing room is the point.
- Text blocks within a section (headings, paragraphs, kickers) are further constrained to `--content-text-max-width` so large type doesn't run into uncomfortably long lines.
- One CTA per section maximum — never two competing asks in the same viewport.
- Section enters view with a single subtle fade/slide-up reveal (`IntersectionObserver`, threshold ~0.12) — not per-element stagger unless the section is a card grid (see §4.3).

### 4.3 Cards
- Used for: pillar/value cards, podcast episode cards (§4.6), testimony cards.
- Base: rounded 4px corners, 1px border (`rgba(255,255,255,.14)` on dark sections, `rgba(27,58,75,.1)` on light), hover = lift (`translateY(-4px)`) + border shifts to teal.
- Card grids reveal with a light stagger (~80ms offset per card), capped at 4 items staggering — don't stagger a long list.

### 4.4 Modal system (shared shell — build once, reuse for all three)
- **Trigger:** nav item click (and any in-page secondary CTA that should open the same modal, e.g. a "Give" button in the footer).
- **Overlay:** full-viewport dim scrim (`rgba(13,43,43,.7)`), modal panel centered on desktop, full-height bottom sheet on mobile (< 600px).
- **Entrance/exit:** scale + fade (~250ms, `--ease-standard`); mobile sheet slides up from bottom.
- **Dismissal:** click outside panel, `Esc` key, and an explicit close (×) button — all three must work.
- **Focus management:** trap focus inside the modal while open; return focus to the triggering nav item on close. Required for accessibility, not optional.
- **Deep-linking:** update the URL with a query param or hash when a modal opens (e.g. `?modal=listen`) so a link can open directly into a modal state; remove it on close. Use `history.replaceState`, not `pushState`, so the back button doesn't stack modal states unexpectedly.
- **Scroll lock:** background page shouldn't scroll while a modal is open.

### 4.5 "Plan a Visit" modal — content spec
- Service time(s) and day (e.g., "Sundays · 10:00 AM").
- Location — address text, and ideally a static or embedded map.
- A short "What to Expect" blurb (2–3 sentences, plain, per brand voice).
- Optional: a single CTA inside the modal (e.g., "Get Directions") — still respects one-CTA-per-surface.

### 4.6 "Listen" modal — content spec
- Header: show title/art, short description, subscribe links (Spotify at minimum).
- Body: **latest 10 episodes**, each as a card containing:
  - Episode artwork (thumbnail)
  - Episode title + publish date (Plex Mono kicker)
  - Play/pause button (drives the floating player — see §4.7)
  - Secondary actions as needed (e.g., share, view show notes)
- Footer/header action: **"Open in Spotify"** button — links to the show's `open.spotify.com` URL, opened in a new tab. On mobile, this URL's universal link will natively prompt the OS to open the Spotify app if installed, falling back to the mobile web player if not — no manual device-sniffing needed.
- **Playback implementation — open technical decision, flag for dev lead:**
  1. **RSS/enclosure approach (recommended for full custom control):** pull episode metadata + direct audio URLs from the podcast's public RSS feed (every Spotify-hosted show has one via Anchor/Spotify for Podcasters). Play via a standard HTML5 `<audio>` element — gives full control over the floating player's UI (§4.7) with no auth required.
  2. **Spotify embed approach (simpler, less control):** embed Spotify's official `open.spotify.com/embed/episode/{id}` iframe per card. Faster to implement, but playback UI is Spotify's own chrome, not the custom floating glass player — this option **does not fully satisfy the floating-player requirement** and should only be a fallback if the RSS feed isn't available.
  - Recommendation: confirm the show's RSS feed URL with the client before starting build; default to approach 1.

### 4.7 Floating glass player
- Appears once any episode starts playing; **persists across modal open/close and section scroll** — this is a global/app-level UI element, not a child of the Listen modal. Closing the modal must not unmount the audio element or interrupt playback.
- Position: fixed, bottom-right (desktop) / full-width bottom bar (mobile).
- Visual: glassmorphism — translucent dark surface (`rgba(13,43,43,.55)`), `backdrop-filter: blur(16px)`, subtle 1px light border (`rgba(255,255,255,.14)`).
- Contents: episode artwork thumbnail, episode title (truncate with ellipsis), play/pause toggle, progress/seek bar, close (×) button that stops playback and dismisses the player.
- State: lives in a top-level store/context (not component-local state scoped to the modal) so it survives navigation between sections and modal open/close cycles.

### 4.8 "Give" modal — content spec
- Bank/account details for direct transfer (account name, number, bank name) — plain text, easily copyable (consider a tap-to-copy affordance on each field).
- A single **"Give Online"** button/link to an external payment link (Paystack, Flutterwave, Stripe, or similar — confirm provider with client) — opens in a new tab.
- No urgency or scarcity language anywhere in this modal, per brand voice (see `concept-note.md` §2) — state the ask plainly and let the visitor choose.
- Optional: a brief, one-sentence "where this goes" line — no more; save fuller FAQ content for later iteration if needed.

---

## 5. Motion & Interaction

- One signature moment per page load (e.g., a staggered hero headline reveal) — everywhere else, motion is quiet: fade/slide-up on scroll reveal, lift-on-hover for cards, standard modal scale/fade.
- Respect `prefers-reduced-motion: reduce` globally — disable decorative animation (drifting textures, staggered reveals, marquees) and fall back to instant/static states. This is not optional.
- Any auto-advancing motion (e.g., a testimony marquee, if used) must pause on hover/focus and be pausable/dismissible for accessibility.

---

## 6. Logo & Imagery

- Wordmark: custom cursive script mark with an integrated cross in the "F" ascender — **awaiting real asset**; current mockups use a placeholder Google Font ("Sacramento"). Do not ship the placeholder to production.
- Minimum sizes: full wordmark 120px digital / OF monogram 40px digital.
- Photography: real, professionally-lit portrait photography once available; current mockups use gradient placeholders for copyright-safety — replace before launch.
- Flame-pattern texture (derived motif): available as a low-opacity decorative layer (hero background, section dividers) — never behind body copy at meaningful opacity.

---

## 7. Accessibility & Performance Baseline

- Keyboard-navigable throughout: nav, modals (with focus trap), episode cards, player controls.
- Visible focus states on every interactive element (`:focus-visible`, teal outline).
- Color contrast: WCAG AA minimum, including text-over-gradient and text-over-photo cases.
- Lazy-load episode artwork and any below-the-fold imagery.
- Audio element should not autoplay on page load or modal open — playback starts only on explicit user action (tap/click play).

---

## 8. Open Items for Client/Dev Sign-off

- [ ] Confirm podcast RSS feed URL (or confirm fallback to Spotify embed) — see §4.6.
- [ ] Confirm payment provider/link for the Give modal — see §4.8.
- [ ] Confirm bank account details text for direct transfer.
- [ ] Confirm exact service time(s)/location copy for Plan a Visit modal.
- [ ] Supply real logo asset (vector) and real photography.
- [ ] Confirm whether a hero section is wanted above "About OneForge," since it wasn't named explicitly in the section list.
