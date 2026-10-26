// Content for the unlisted /partner page (the partner letter links to it). Copy is final as
// supplied: change it only when the team sends new wording.

export const PARTNER_PHONE = '+2348033804161';
export const PARTNER_PHONE_DISPLAY = '+234 803 380 4161';

/** Partner-form submissions go here (CONNECT_FROM_EMAIL still sends them; replies go to the giver). */
export const PARTNER_EMAIL = 'boye.oloyede@oneforge.org';

export type PartnerArea = { title: string; code: string; text: string; icon: string };

export const PARTNER_AREAS: PartnerArea[] = [
  {
    title: 'Sound, light and screens',
    code: 'SOUND',
    text: 'Instruments, sound, lighting, cameras and LED screens, so every word is heard and every face is seen, in the room and online.',
    icon: 'M4 9v6h4l5 4V5L8 9H4z M16 9a4 4 0 0 1 0 6 M19 6a8 8 0 0 1 0 12',
  },
  {
    title: 'The room',
    code: 'ROOM',
    text: 'Stage, set, signs and a welcome lounge that turn a bare hall into a warm room every Sunday.',
    icon: 'M3 21h18 M5 21V8l7-5 7 5v13 M10 21v-6h4v6',
  },
  {
    title: 'Junior Church',
    code: 'JUNIOR',
    text: 'Safe, bright rooms for four age groups, with secure check-in.',
    icon: 'M12 3a3 3 0 1 0 0.01 0 M6 21v-4a6 6 0 0 1 12 0v4',
  },
  {
    title: 'A working base',
    code: 'BASE',
    text: 'An office where the team plans, meets people and gives care through the week.',
    icon: 'M4 21V5h10v16 M14 9h6v12 M8 9h2 M8 13h2 M8 17h2',
  },
  {
    title: 'Getting the word out',
    code: 'WORD',
    text: "Our launch campaign and Launch Sunday, to reach people who've stopped coming or never came.",
    icon: 'M3 11v2l12 5V6L3 11z M15 9h2a3 3 0 0 1 0 6h-2 M6 13l1 6h3l-1-5',
  },
  {
    title: 'Growth and foundations',
    code: 'GROW',
    text: 'GROUNDED, our free growth course, plus registration, legal and systems.',
    icon: 'M12 21V11 M12 11c0-4 3-6 7-6 0 4-3 6-7 6z M12 14c0-3-2-5-6-5 0 3 2 5 6 5z',
  },
  {
    title: 'Our first year',
    code: 'YEAR1',
    text: 'Running costs while giving grows. Our aim is for giving to cover our costs from Year 2.',
    icon: 'M4 6h16v15H4z M4 10h16 M8 3v4 M16 3v4',
  },
  {
    title: 'A safety net',
    code: 'RESERVE',
    text: "A reserve of three months' running costs, so what we build together holds.",
    icon: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  },
];

export const PARTNER_WAYS = [
  {
    title: 'A launch gift',
    text: "One gift toward the ₦227.7 million, used where it's needed most. Use the reference LAUNCH.",
  },
  {
    title: 'A gift for one area',
    text: "Pick the part of the work you care about most and use its reference. If that area is fully funded, your gift goes to the next greatest need, and we'll tell you.",
  },
  {
    title: 'Monthly partnership',
    text: 'From ₦25,000 a month, by standing order from your bank. This is what lets ONEFORGE pay its own way from our second year. Use the reference MONTHLY.',
  },
];

export type PartnerAccount = {
  bank: string;
  number: string;
  currency: 'NGN' | 'USD';
  logo: { src: string; width: number; height: number };
};

const LOGOS = {
  providus: { src: '/images/banks/providus-unity.png', width: 637, height: 313 },
  premiumTrust: { src: '/images/banks/premium-trust.png', width: 548, height: 125 },
  fcmb: { src: '/images/banks/fcmb.png', width: 252, height: 196 },
};

export const PARTNER_NGN_ACCOUNTS: PartnerAccount[] = [
  { bank: 'Providus Unity Bank', number: '1310548972', currency: 'NGN', logo: LOGOS.providus },
  { bank: 'Premium Trust Bank', number: '0010246634', currency: 'NGN', logo: LOGOS.premiumTrust },
  { bank: 'FCMB', number: '1047269330', currency: 'NGN', logo: LOGOS.fcmb },
];

export const PARTNER_USD_ACCOUNT: PartnerAccount = {
  bank: 'Premium Trust Bank',
  number: '0330099314',
  currency: 'USD',
  logo: LOGOS.premiumTrust,
};
export const PARTNER_USD_SWIFT = 'PTRUNGLA';
// The bank's own page carries the correspondent-bank details, so they stay current.
export const PARTNER_USD_GUIDE_URL = 'https://premiumtrustbank.com/international-payment/';

/** "What did you give to?" options, in the order the form shows them. Values are the transfer codes. */
export const PARTNER_GIFT_OPTIONS: { value: string; label: string }[] = [
  { value: 'LAUNCH', label: "Where it's needed most (LAUNCH)" },
  { value: 'SOUND', label: 'Sound, light and screens' },
  { value: 'ROOM', label: 'The room' },
  { value: 'JUNIOR', label: 'Junior Church' },
  { value: 'BASE', label: 'A working base' },
  { value: 'WORD', label: 'Getting the word out' },
  { value: 'GROW', label: 'Growth and foundations' },
  { value: 'YEAR1', label: 'Our first year' },
  { value: 'RESERVE', label: 'A safety net' },
  { value: 'MONTHLY', label: 'Monthly partnership' },
];
