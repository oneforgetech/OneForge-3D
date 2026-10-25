# ONEFORGE 3D

A ground-up rebuild of the ONEFORGE Church site as one continuous, scroll-driven 3D world.

- **Home (`/`)** — a sticky stage driven by scroll position. Six chapters (Arrive, Divided, The feeling, Three fronts, Listen, Begin) fly in from depth; between chapters a canvas *portal* window opens, tilts toward the pointer and expands to swallow the screen. The Making is a CSS-3D tunnel you fly through. Embers stream past as you scroll.
- **Inner pages** — `/about`, `/visit`, `/give`, `/grounded`, `/next-steps`, `/connect`, in the same visual language (depth reveals, tilting slabs, parallax hero).
- **No new dependencies** — CSS 3D + two 2D canvases. Next 16 / React 19 / zustand only.

## Where things live
- `lib/world/` — `controller.ts` (scroll → chapter variables, portal, backgrounds), `portal.ts` (canvas window), `embers.ts`, `chapters.ts` (the chapter list: lengths, backgrounds, dimming).
- `components/world/` — `World.tsx`, `Chapters.tsx`, `World.module.css` (the 3D layer system).
- `components/chrome/` — HUD + chapter rail, 3D menu, cursor, preloader, footer.
- `lib/content.ts` — copy shared by home and inner pages. `lib/launch.ts` flips pre/post-launch copy on 1 Nov 2026.

## Behaviour worth knowing
- Everything on the home stage is a pure function of scroll position, so it plays backwards as it plays forwards.
- Reduced motion (or no JS) switches off the world: the home page becomes a tall, normal, readable page.
- The preloader shows once per session, is skippable, and never on repeat visits, hash links, reduced motion or Save-Data.
- Hash links (`/#making`, `/#listen`) land on their chapter.

```bash
npm install
npm run dev   # http://localhost:3000
```

## Parked for after launch
`app/_parked/` holds the GROUNDED and "Find where you are" pages. They are not routed (Next.js ignores underscore folders) and are not in the nav or sitemap. See `app/_parked/README.md` to bring them back.

## Scrolling
- **Mouse / keyboard:** one wheel flick or key press moves one stop (`lib/world/controller.ts`, `lib/pager.ts` for inner pages).
- **Touch:** native scrolling; on release the page glides to the next stop in the direction you swiped.
