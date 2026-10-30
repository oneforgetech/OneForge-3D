// Content for the unlisted /welcome page — the online twin of the paper guest card handed
// out in-service, reached only by its QR code.

export type WelcomeInterest = { value: string; label: string };

export const WELCOME_INTERESTS: WelcomeInterest[] = [
  { value: 'know-more', label: "I'd like to know more about ONEFORGE." },
  { value: 'faith', label: "I'd like to talk with someone about faith or following Jesus." },
  { value: 'prayer', label: "I'd appreciate prayer." },
  { value: 'connect', label: "I'd like to explore ways to connect with others." },
  { value: 'question', label: "I have a question or something else I'd like to share." },
];
