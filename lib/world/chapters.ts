import { canvasImageUrl } from './media';
import { PLACEHOLDERS } from './placeholders';

export type Chapter = {
  id: string;
  /** Short label for the HUD rail. */
  label: string;
  /** Name shown in the portal caption when this chapter is "next". */
  caption: string;
  /** Scroll length of the chapter's own content, in viewport heights. */
  contentVh: number;
  /** Scroll length of the portal that carries you into the next chapter. 0 = last. */
  portalVh: number;
  /** focus: where the subject sits (0..1). Used when the screen is portrait, so a phone's crop keeps the subject in frame. */
  bg: { src: string; video?: boolean; focus?: [number, number]; placeholder?: string };
  /** 0..1 darkening laid over the background while this chapter is on stage. */
  dim: number;
  /** Resting points inside the chapter, as content progress 0..1. One scroll gesture moves one stop. */
  rests: number[];
};

const POSTER = '/images/hero-edit2-poster.jpg';

export const CHAPTERS: Chapter[] = [
  { id: 'arrive', label: 'Arrive', caption: 'Arrive', contentVh: 90, portalVh: 60, bg: { src: POSTER, video: true, focus: [0.5, 0.5], placeholder: PLACEHOLDERS.poster }, dim: 0, rests: [0] },
  { id: 'divided', label: 'Divided', caption: 'Never meant to live divided', contentVh: 150, portalVh: 55, bg: { src: '/images/backdrops/parted.jpg', focus: [0.5, 0.5], placeholder: PLACEHOLDERS.parted }, dim: 0.66, rests: [0.45, 0.86] },
  { id: 'feeling', label: 'The feeling', caption: 'You know the feeling', contentVh: 130, portalVh: 55, bg: { src: '/images/backdrops/frosted.jpg', focus: [0.5, 0.5], placeholder: PLACEHOLDERS.frosted }, dim: 0.7, rests: [0.4, 0.84] },
  { id: 'fronts', label: 'Three fronts', caption: 'Whole on three fronts', contentVh: 170, portalVh: 55, bg: { src: '/images/backdrops/movement.jpg', focus: [0.5, 0.45], placeholder: PLACEHOLDERS.movement }, dim: 0.56, rests: [0.34, 0.84] },
  { id: 'listen', label: 'Listen', caption: 'Listen', contentVh: 110, portalVh: 55, bg: { src: '/images/backdrops/profile.jpg', focus: [0.25, 0.5], placeholder: PLACEHOLDERS.profile }, dim: 0.5, rests: [0.3] },
  { id: 'begin', label: 'Begin', caption: 'Begin', contentVh: 110, portalVh: 0, bg: { src: '/images/backdrops/walking.jpg', focus: [0.5, 0.5], placeholder: PLACEHOLDERS.walking }, dim: 0.7, rests: [0.3] },
];

export const chapterIndex = (id: string) => CHAPTERS.findIndex((c) => c.id === id);

export const bgFocus = (i: number): [number, number] => CHAPTERS[i].bg.focus ?? [0.5, 0.5];

export const bgImageUrl = (i: number) => canvasImageUrl(CHAPTERS[i].bg.src);
