import { LIVE_URL } from './church';

export type NavItem = { label: string; href: string; external?: boolean };
export type NavGroup = { id: string; label: string; href: string; items: NavItem[] };

// Discover | ONEFORGE | Listen | Visit. Each word is an invitation to experience
// something, not a church-insider label.
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'discover',
    label: 'Discover',
    href: '/about',
    items: [
      { label: 'Who We Are', href: '/about#who' },
      { label: 'What We Believe', href: '/about#believe' },
      { label: 'Leadership', href: '/about#leadership' },
    ],
  },
  {
    id: 'listen',
    label: 'Listen',
    href: '/listen',
    items: [
      { label: 'Messages', href: '/listen#messages' },
      { label: 'Join Us Live', href: LIVE_URL, external: true },
    ],
  },
  {
    id: 'visit',
    label: 'Visit',
    href: '/visit',
    items: [
      { label: 'Plan Your Visit', href: '/visit' },
      { label: 'What to Expect', href: '/visit#expect' },
      { label: 'Location', href: '/visit#location' },
    ],
  },
];

// Lives in the menu and footer only — deliberately not on the home page.
export const NAV_MORE: NavItem[] = [
  { label: 'Give', href: '/give' },
  { label: 'Say hello', href: '/connect' },
];
