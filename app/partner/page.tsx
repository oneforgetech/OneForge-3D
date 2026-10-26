import Image from 'next/image';
import { PartnerForm } from '@/components/forms/PartnerForm';
import { PageHero, PageShell, Pill, Reveal, Section } from '@/components/site/Site';
import p from '@/components/site/Page.module.css';
import s from '@/components/site/Partner.module.css';
import { IconMail } from '@/components/ui/icons';
import { PartnerAccounts } from '@/components/ui/PartnerAccounts';
import { CHURCH_EMAIL } from '@/lib/church';
import { buildMetadata } from '@/lib/metadata';
import { PARTNER_AREAS, PARTNER_PHONE, PARTNER_PHONE_DISPLAY, PARTNER_WAYS } from '@/lib/partner';

// Unlisted: the partner letter links here, and partners can share it, but nothing on the site links to
// it and search engines are asked not to index it. It is deliberately left out of the sitemap, and out
// of robots.txt too, since robots.txt is public and would give the address away.
export const metadata = {
  ...buildMetadata({
    title: 'Partner with ONEFORGE · Lagos',
    description:
      "Help us build the room. We're raising ₦227.7 million to launch ONEFORGE in Ogudu, Lagos, and carry our first year.",
    path: '/partner',
  }),
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <PageShell>
      <PageHero
        kicker="Partner with ONEFORGE"
        title="Help us build the room."
        lead="On Sunday 1 November 2026, we open our doors for weekly gatherings in Lagos. This hasn't happened overnight. A small group of us, founding members and partners, have been preparing for months, giving our time, skills and resources to lay a strong foundation. We've already begun the work, and we're inviting others to help us carry it forward."
        image="/images/risen/worship-team.jpg"
        alt="The ONEFORGE worship team singing together on stage"
      >
        <div className={`${p.actions} ${s.heroActions}`}>
          <Pill href="#give">Give now</Pill>
          <a className={p.directions} href={`tel:${PARTNER_PHONE}`} data-cursor="Call">
            Talk to Boye
          </a>
        </div>
        <p className={s.heroNote}>Our founding members and partners have already given ₦120 million of their own.</p>
      </PageHero>

      <Section>
        <Reveal className={s.split}>
          <h2 className={`${s.h2} display-heading`}>You were never meant to live divided.</h2>
          <div className={s.story}>
            <p className={p.lead}>
              Most people we meet in Lagos don&apos;t lack faith. They&apos;re living two lives: one on Sunday, another the rest
              of the week. The gap between them is wearing them out.
            </p>
            <p className={p.lead}>
              ONEFORGE exists to end the war between faith and life, and to help divided people become whole in Christ, so they
              can grow in Christ and lead in every room that matters.
            </p>
            <p className={s.emphasis}>Your gift helps build the room where that happens.</p>
          </div>
        </Reveal>
      </Section>

      <Section band>
        <Reveal className={s.headRow}>
          <div>
            <p className={`kicker ${p.kick}`}>What your gift makes possible</p>
            <h2 className={`${p.h2} ${p.wide} display-heading`}>Eight things we&apos;re building together.</h2>
          </div>
          <div className={s.total}>
            <p className={s.totalFigure}>₦227.7m</p>
            <p className={s.totalNote}>to launch and carry our first year</p>
          </div>
        </Reveal>
        <div className={p.grid4}>
          {PARTNER_AREAS.map((area, i) => (
            <Reveal key={area.code} delay={(i % 4) * 80} className={`${p.slab} ${s.area} glass-on-dark`}>
              <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={area.icon} />
              </svg>
              <h3 className={`${s.areaTitle} display-heading`}>{area.title}</h3>
              <p className={`${p.slabText} ${s.text}`}>{area.text}</p>
              <p className={s.ref}>
                Transfer reference: <strong>{area.code}</strong>
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <p className={`kicker ${p.kick}`}>Three ways to stand with us</p>
          <h2 className={`${p.h2} ${p.wide} display-heading`}>Give once, give to one area, or give every month.</h2>
        </Reveal>
        <div className={s.ways}>
          {PARTNER_WAYS.map((way, i) => (
            <Reveal key={way.title} delay={i * 90} className={`${p.slab} glass-on-dark`}>
              <span className={s.wayNum}>{i + 1}</span>
              <h3 className={`${p.slabTitle} display-heading`}>{way.title}</h3>
              <p className={p.slabText}>{way.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section band id="give">
        <Reveal>
          <p className={`kicker ${p.kick}`}>Give by bank transfer</p>
          <h2 className={`${p.h2} ${p.wide} display-heading`}>Every account is in the name Oneforge Global Ministries.</h2>
          <p className={`${p.lead} ${s.transferNote}`}>
            In the transfer description, add your name and a reference, for example <strong>ADA LAUNCH</strong> or{' '}
            <strong>TUNDE JUNIOR</strong>. That&apos;s how we know where you&apos;d like your gift to go.
          </p>
        </Reveal>
        <Reveal>
          <PartnerAccounts />
        </Reveal>
      </Section>

      <Section>
        <div className={s.split}>
          <Reveal>
            <p className={`kicker ${p.kick}`}>After you give</p>
            <h2 className={`${s.h2} display-heading`}>Let us say thank you.</h2>
            <p className={p.lead}>
              Tell us you gave, so we can thank you properly. If you&apos;d like, we&apos;ll send you a short update every quarter
              on where your gift went.
            </p>
            <ul className={s.promises}>
              <li>Every gift goes into accounts kept separate by purpose.</li>
              <li>If an area is fully funded, your gift goes to the next greatest need.</li>
              <li>We keep saving as we grow.</li>
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <PartnerForm className={s.formPanel} />
          </Reveal>
        </div>
      </Section>

      <Section band>
        <Reveal>
          <div className={`${p.leader} glass-on-dark`}>
            <span className={p.avatar}>
              <Image src="/images/boye-oloyede.jpg" alt="Boye Oloyede, Lead Pastor" fill sizes="220px" />
            </span>
            <div>
              <h2 className={`${s.h2} display-heading`}>Rather talk first? I&apos;d love to hear from you.</h2>
              <p className={`${p.leaderRole} ${s.talkRole}`}>Boye Oloyede, Lead Pastor</p>
              <div className={`${p.actions} ${s.talkActions}`}>
                <a className={p.pillText} href={`tel:${PARTNER_PHONE}`} data-cursor="Call">
                  Call {PARTNER_PHONE_DISPLAY}
                </a>
                <a className={p.directions} href={`mailto:${CHURCH_EMAIL}`} data-cursor="Email">
                  <IconMail size={18} />
                  {CHURCH_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>
    </PageShell>
  );
}
