// Copy shared between the home world and the inner pages.
import { CHURCH_ADDRESS, CHURCH_MAPS_URL } from './church';
import { connectHref } from './connect';
import { launchCopy } from './launch';
import { COMPARE_ROWS, MOVEMENTS } from './movements';

export const VALUES = [
  { label: 'Mission', line: 'You were not saved to sit. You were formed to be sent.', text: 'You can serve from your first Sunday. Nobody waits for a certificate.' },
  { label: 'Integrity', line: 'Who you are in private is who we trust in public.', text: 'We’d rather grow slowly and hold than look impressive and crack.' },
  { label: 'Community', line: 'We are sharpened and strengthened by each other. No one forges alone.', text: 'Nobody here is left without a group or a team.' },
  { label: 'Standard', line: 'We bring our best because God deserves nothing less.', text: 'God gets our best work, not our leftovers.' },
];

export const BELIEFS = [
  { title: 'Trinitarian in our understanding of God', text: 'There is one God, who exists eternally as Father, Son and Holy Spirit.' },
  { title: 'Christ-centred in salvation', text: 'Jesus Christ is fully God and fully human. He lived without sin, died in our place and rose again. He is the way to God.' },
  { title: 'Spirit-empowered in Christian life', text: 'The Holy Spirit lives in everyone who trusts Jesus, bringing comfort, guidance, power and gifts for serving others.' },
  { title: 'Biblical in authority', text: 'The Bible is God’s word, and the final authority for what we believe and how we live.' },
  { title: 'Grace-grounded in the gospel', text: 'We are made right with God by grace, through faith in Jesus. It’s a gift. Nobody earns it, and nobody is beyond it.' },
  { title: 'Formational in discipleship', text: 'Following Jesus is a lifelong shaping. God changes us slowly, through prayer, Scripture and the ordinary parts of the week as much as Sunday.' },
  { title: 'Ecclesial in community', text: 'The church is God’s family, and nobody is meant to follow Jesus alone. Baptism is the public sign of joining it.' },
  { title: 'Missional in purpose', text: 'We are sent into every sphere of life to carry God’s presence, serve people and tell the story of Jesus.' },
  { title: 'Resurrection-shaped in hope', text: 'Jesus rose from the dead and will return to make all things new. That hope holds when life doesn’t.' },
];

export const STREAMS = [
  {
    name: 'Foundations', detail: 'foundations',
    forWho: 'anyone curious, returning or doubting',
    body: 'Eight weeks. The first three are your questions: Who is Jesus? Is any of this real? What do I do with my doubt? Nothing is asked of you, and you can stop after week three. If you choose to go on, weeks four to eight cover the essentials of the faith and the Bible, who ONEFORGE is, and what membership means.',
    outcome: 'say what you believe and why, in your own words, to a colleague who asks',
    status: 'Opening when ready',
  },
  {
    name: 'Worship', detail: 'worship',
    forWho: 'anyone whose faith feels loud on Sunday and quiet the rest of the week',
    body: 'Most of what you call worship is thirty minutes of singing. This is about the other ninety-five percent: surrender, the ways we worship beyond music, giving, paying attention to the words of a song rather than the energy, and knowing whether a song is true.',
    outcome: 'keep a life with God that holds up in silence',
    status: 'Opening when ready',
  },
  {
    name: 'Depth', detail: 'depth',
    forWho: 'anyone who has been out-argued on what they believe, or wants to stop borrowing their convictions',
    body: 'Learn to open the Bible and get something out of it yourself, tell truth from what’s trending, and hold your ground under a hard question.',
    outcome: 'read the Bible without a podcast, and own what you believe',
    status: 'Opening when ready',
  },
  {
    name: 'Craft', detail: 'craft',
    forWho: 'anyone serving, or about to, who wants to serve where they fit',
    body: 'Find where your gifts and your fire point the same way, using a short placement profile. Agree an honest limit on your hours. And bring God your best work, not what’s left after the office.',
    outcome: 'serve where you fit, at a pace you can keep',
    status: 'Opening mid-2027',
  },
  {
    name: 'Calling', detail: 'calling',
    forWho: 'anyone asking “what is my assignment?”',
    body: 'That question usually gets a vague encouragement or a push into full-time ministry. Calling takes your work, your field and your city seriously as the places you may be sent.',
    outcome: 'name where you’re sent, and take the next step there',
    status: 'Opening when ready',
  },
];

export const GROUNDED_FAQ = [
  { q: 'Do I have to finish GROUNDED before I can serve?', a: 'No. You can serve from your first Sunday.' },
  { q: 'Is it compulsory?', a: 'Foundations is for anyone who wants to become a member, so nobody signs something they don’t understand. The other four are there when you need them.' },
];

export const WAYS_IN = [
  { title: 'Join a group', body: 'Fireside Groups are open to anyone. Forge Groups are closed and ask a commitment. Both start in February.', status: 'Opening February 2027 · sign-ups open', action: { label: 'Sign up now', href: connectHref('group') } },
  { title: 'Serve on a team', body: 'A ten-minute conversation finds the right team for you. You can start on your first Sunday.', status: 'Open now', action: { label: 'Find your fit', href: connectHref('serving') } },
  { title: 'Ask for prayer', body: "Tell us what's weighing on you. Someone will pray, and if you want, get in touch.", status: 'Open now', action: { label: 'Ask for prayer', href: connectHref('prayer') } },
  { title: 'Junior Church', body: 'Sparks (0–4), Ignite (5–8), Blaze (9–12), Impact (13–17). The rooms open later. Until then, children get a take-home learning pack made for their age.', status: 'Opening when ready', action: { label: 'Tell me when it opens', href: connectHref('opening', 'junior-church') } },
  { title: 'Family Ministry', body: 'Four streams: marriage, singles, men and women. Each starts when the people and leaders are in place.', status: 'Opening when ready', action: { label: 'Tell me when it opens', href: connectHref('opening', 'family-ministry') } },
];

export const VISIT_BLOCKS: { id?: string; label: string; body: string; link?: { label: string; href: string } }[] = [
  { id: 'location', label: 'Where', body: CHURCH_ADDRESS, link: { label: 'Get directions ↗', href: CHURCH_MAPS_URL } },
  { label: 'When', body: '9:00 AM, about 75 minutes.' },
  { id: 'expect', label: 'What happens', body: 'Worship, Truth from Scripture. Stay and Connect or head home.' },
  { id: 'kids', label: 'Your children', body: 'Your children are welcome. For now, they’ll join you in the main gathering and receive an age-appropriate take-home pack to continue learning at home.' },
  { label: "Can't make it in person?", body: 'Every message goes on Spotify afterwards.' },
];

/** The four movements as scene cards: copy from MOVEMENTS, facts from COMPARE_ROWS. */
export const MOVEMENT_CARDS = MOVEMENTS.map((m, i) => ({
  slug: m.slug,
  name: m.name,
  number: `[0${i + 1}]`,
  question: m.question,
  image: m.image,
  alt: m.alt,
  facts: [
    ['Your group:', COMPARE_ROWS.find((r) => r.label === 'Your group')!.values[i]],
    ['Serving:', COMPARE_ROWS.find((r) => r.label === 'Serving')!.values[i]],
    ['Learning:', COMPARE_ROWS.find((r) => r.label === 'Learning')!.values[i]],
  ] as [string, string][],
}));

export const visitCta = () => ({
  label: launchCopy('Save my seat', 'Plan your visit'),
  href: launchCopy(connectHref('visiting'), '/visit'),
});
