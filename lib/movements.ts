import { connectHref } from './connect';
import { launchCopy } from './launch';

export type Movement = {
  slug: string;
  name: string;
  question: string;
  body: string;
  image: string;
  alt: string;
  actions: { label: string; action: { label: string; href: string } }[];
  note?: string;
};

export const MOVEMENTS: Movement[] = [
  {
    slug: 'drawn',
    name: 'Drawn',
    question: 'Is there room for me here?',
    body: "You've just arrived, or you're still deciding. Come on a Sunday, sit where you like, and let a few people get to know you. You can serve from your first week. It's the quickest way to belong.",
    image: '/images/risen/embrace.jpg',
    alt: 'Someone being welcomed at ONEFORGE',
    actions: [
      { label: launchCopy('From 1 November', 'Open now'), action: launchCopy({ label: 'Save my place', href: connectHref('visiting') }, { label: 'Plan a visit', href: '/visit' }) },
      { label: 'Opening February 2027 · sign-ups open', action: { label: 'Sign up now', href: connectHref('group', 'fireside') } },
      { label: 'Open now', action: { label: 'Find your fit', href: connectHref('serving') } },
    ],
  },
  {
    slug: 'kindled',
    name: 'Kindled',
    question: 'What do I actually believe?',
    body: 'Something has started and you want to understand it. GROUNDED: Foundations is eight weeks that begin with your honest questions. Nothing to sign for the first three, and a real way out if it’s not for you.',
    image: '/images/risen/teaching-wide.jpg',
    alt: 'A OneForge teaching gathering',
    actions: [
      { label: 'Opening when ready', action: { label: 'Tell me when it opens', href: connectHref('opening', 'foundations') } },
      { label: 'Opening when ready', action: { label: 'Tell me when it opens', href: connectHref('opening', 'worship') } },
      { label: 'Open now', action: { label: 'Keep serving', href: connectHref('serving') } },
    ],
    note: 'Membership comes at the end of Foundations, for those who want it. You’ll know exactly what you’re agreeing to before you sign anything.',
  },
  {
    slug: 'tempered',
    name: 'Tempered',
    question: 'Will this hold when life gets heavy?',
    body: 'A demanding job, a family, a hard decision: this is where faith meets real weight, and holds. You join a Forge Group, a closed group that meets for a set time and asks a real commitment of you.',
    image: '/images/risen/group-cast.jpg',
    alt: 'The ONEFORGE community gathered together',
    actions: [
      { label: 'Opening February 2027 · sign-ups open', action: { label: 'Sign up now', href: connectHref('group', 'forge') } },
      { label: 'Opening when ready', action: { label: 'Tell me when it opens', href: connectHref('opening', 'depth') } },
      { label: 'Opening mid-2027', action: { label: 'Tell me when it opens', href: connectHref('opening', 'craft') } },
    ],
  },
  {
    slug: 'commissioned',
    name: 'Commissioned',
    question: 'Where am I sent?',
    body: 'You carry your faith into your field and help others do the same. Commissioning is a commitment both ways: we help open doors for you, and you open doors for the next person.',
    image: '/images/risen/worship-team.jpg',
    alt: 'The ONEFORGE worship team leading',
    actions: [
      { label: 'Opening when ready', action: { label: 'Tell me when it opens', href: connectHref('opening', 'calling') } },
      { label: 'Opening when ready', action: { label: 'Tell me when it opens', href: connectHref('opening', 'commissioning') } },
    ],
  },
];

// Per-movement comparison, indexed in MOVEMENTS order. Shared by the Next Steps
// page and the immersive /the-making journey so the copy has one source.
export const COMPARE_ROWS = [
  { label: 'Your group', values: ['A Fireside Group', 'Your Fireside Group and a GROUNDED class', 'A Forge Group', 'Leading a Forge Group'] },
  { label: 'Serving', values: ['On a team from week one', 'On a team', 'Leading a team or a group', 'Coordinating and mentoring'] },
  { label: 'Learning', values: ['Sunday messages and Spotify', 'GROUNDED: Foundations, Worship', 'GROUNDED: Depth, Craft', 'GROUNDED: Calling'] },
  { label: 'The Frontier', values: ['—', 'See the work up close', 'Join others in your field', 'Open doors, and pass them on'] },
];
