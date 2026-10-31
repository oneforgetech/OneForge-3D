// Service areas for the /welcome page's "Serve with us" sign-up — also shown in the
// "Learn more" modal so people can read what each one is before they sign up.

export type ServeArea = { value: string; label: string; description: string };

export const SERVE_AREAS: ServeArea[] = [
  {
    value: 'welcoming',
    label: 'Welcoming and helping people',
    description: 'At the door, in the room and online. Help everyone feel at home.',
  },
  {
    value: 'worship-production',
    label: 'Worship and production',
    description: 'Music, sound, lights and screens. Skilled or still learning.',
  },
  {
    value: 'media-communications',
    label: 'Media and communications',
    description: 'Photos, video, design and writing. Help more people find us.',
  },
  {
    value: 'children',
    label: 'ONEFORGE Juniors (Children)',
    description: 'Help children know Jesus and feel at home.',
  },
  {
    value: 'not-sure',
    label: 'Not sure yet, help me find a fit',
    description: "That's fine. We'll talk it through and find where you fit.",
  },
];

/** Shown once "ONEFORGE Juniors (Children)" is ticked on the serve form. */
export const SERVE_CHILDREN_NOTE =
  "Thank you. Everyone who serves with children has a safeguarding check first. It keeps every child safe, and we'll walk you through it.";
