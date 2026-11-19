/**
 * The privacy notice, linked under every form. Copied from ONEFORGE Hub
 * (src/lib/privacy-notice.ts, also docs/privacy-notice.md) so both say the same thing.
 * DRAFT until reviewed by a data protection lawyer: fill in [DPO name], [privacy@oneforge.org]
 * and the hosting region before this goes live.
 */
export const PRIVACY_DRAFT_NOTE = "Draft — to be reviewed by a data protection lawyer.";
export const PRIVACY_UPDATED = "20 Nov 2026";

export const PRIVACY_SECTIONS: { heading: string; paragraphs: string[]; bullets?: string[] }[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "ONEFORGE Church, Ogudu, Lagos, Nigeria (“ONEFORGE”, “we”) decides how the details you give us are used. We follow the Nigeria Data Protection Act 2023.",
      "Questions about your details go to our data protection contact, [DPO name], at [privacy@oneforge.org].",
    ],
  },
  {
    heading: "What we collect",
    paragraphs: ["Only what each form asks for:"],
    bullets: [
      "Connect with us (and paper connect cards at church): your name, phone, email, stage of life, what you’d like to hear about, your message, and whether we may contact you.",
      "I’m new to faith: your name, phone, email, any prayer request or message, and whether we may contact you.",
      "Serve with us: your first name, phone, email and the areas you’d like to serve in.",
      "Say hello: your name, WhatsApp number, email, your topic and answers (for example which Sunday you plan to visit, your children’s ages but never their names, a group, where you could serve, a prayer request and whether to keep it private, a question or a message), and whether we may add you to our WhatsApp community.",
      "Partner (“let us say thank you”): your name, email, phone and what you gave to.",
      "ONEFORGE Juniors registration: your name, relationship to the child, phone numbers and email; your child’s name, date of birth, gender and school class; any allergies and their details; any special learning needs, disabilities or medical conditions; an optional second contact; your consent, and whether your child may appear in photos and videos.",
    ],
  },
  {
    heading: "Why we use it",
    paragraphs: [
      "To get back to you when you ask us to (we aim to reach first-time guests within 48 hours), to pray with you and care for you, to welcome and keep children safe at ONEFORGE Juniors, to help you start serving, to thank people who give, and to plan our Sundays using counts that never name anyone.",
      "What you tell us can reveal your religious beliefs, and the Juniors form can include health information. The law treats both as sensitive, so we use them only with your clear consent, and a parent or guardian gives consent for a child. An empty or unticked box means you have not given consent, and we will not contact you.",
    ],
  },
  {
    heading: "Who sees it",
    paragraphs: ["Only the people in our team who need it, each seeing just their part:"],
    bullets: [
      "Guest Experience follows up with guests. Volunteers see only the people assigned to them, and not your messages.",
      "Prayer requests are seen only by our pastoral leads.",
      "Children’s health details are seen only by the Juniors lead and our safeguarding lead. Other Juniors volunteers see only that a child has an allergy.",
      "Giving details are seen only by our finance leads.",
      "Church leadership sees totals only, never names.",
    ],
  },
  {
    heading: "How we protect it",
    paragraphs: [
      "Messages, prayer requests, notes and children’s health details are encrypted. Team members sign in individually, leads use two-step verification, and every time someone opens a sensitive detail it is recorded. We never sell your details or share them outside the church.",
      "We use trusted providers to run our systems: Supabase (database hosting, in [region recorded at deployment]), Vercel (website and app hosting), Google (sheets, until we retire them) and Resend (email). Where your details are stored outside Nigeria, we use contracts and safeguards the law requires.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [],
    bullets: [
      "If you didn’t agree to be contacted and we hear nothing more, your details are anonymised after 30 days.",
      "If you agreed to be contacted, they are anonymised after 12 months with no visit or contact.",
      "The original form entries are deleted after 90 days.",
      "Prayer requests are closed after 30 days and deleted after 90.",
      "Notes about our calls and messages to you are removed after 12 months.",
      "Children’s records are reviewed when a child turns 18, or after 12 months with no attendance.",
      "Anonymised counts (for example, how many guests came on a Sunday) are kept so we can plan.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can ask to see the details we hold about you, to correct them, to delete them, or to withdraw your consent at any time (for example, to stop us contacting you). Withdrawing consent doesn’t affect anything we did before. You can also complain to the Nigeria Data Protection Commission.",
    ],
  },
  {
    heading: "How to ask",
    paragraphs: [
      "Email [privacy@oneforge.org] or speak to [DPO name] at church. We will reply promptly, and within 30 days. Tell a team member “please don’t contact me again” at any time, and we will stop.",
    ],
  },
  {
    heading: "Changes",
    paragraphs: ["If we change how we use your details, we will update this notice and the date at the top."],
  },
];
