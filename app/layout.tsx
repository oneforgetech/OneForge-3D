import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Inter, Sora } from 'next/font/google';
import { Analytics } from '@/components/chrome/Analytics';
import { Cursor } from '@/components/chrome/Cursor';
import { FireCursor } from '@/components/chrome/FireCursor';
import { FloatingPlayer } from '@/components/chrome/FloatingPlayer';
import { Footer } from '@/components/chrome/Footer';
import { WhatsAppWidget } from '@/components/chrome/WhatsAppWidget';
import { Hud } from '@/components/chrome/Hud';
import { StructuredData } from '@/components/chrome/StructuredData';
import { SITE_URL } from '@/lib/church';
import { buildMetadata } from '@/lib/metadata';
import './globals.css';

const sora = Sora({ variable: '--font-sora', subsets: ['latin'], weight: ['700', '800'] });
const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const plexMono = IBM_Plex_Mono({ variable: '--font-plex-mono', subsets: ['latin'], weight: ['400', '500'] });

const DESCRIPTION =
  'A place to be shaped, not managed. A church in Ogudu, Lagos. Sundays at 9 AM, beginning 1 November 2026. Come as you are.';

// Pages that switch copy on LAUNCH_DATE re-render at most every 10 minutes.
export const revalidate = 600;

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({ title: 'ONEFORGE Church · Ogudu, Lagos · Sundays 9 AM', description: DESCRIPTION, path: '/' }),
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = { themeColor: '#0d2b2b', viewportFit: 'cover' };

// Runs before first paint: switches on the scroll world (unless the visitor
// asked for reduced motion), and flags repeat / reduced / Save-Data / hash visits
// so the preloader never flashes. Client-side navigations re-check in Preloader.
const PRE_PAINT = `(function(){try{var d=document.documentElement;var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm)d.setAttribute('data-world-live','');var c=navigator.connection;var slow=(c&&(c.saveData||/^(slow-2g|2g|3g)$/.test(c.effectiveType||'')||(c.downlink&&c.downlink<2)||(c.rtt&&c.rtt>=400)))||(navigator.deviceMemory&&navigator.deviceMemory<=2);var seen=false;try{seen=!!sessionStorage.getItem('of-world-seen')}catch(e){}if(rm||slow||seen||location.hash)d.setAttribute('data-world-seen','')}catch(e){}
// Safety net: if the page's scripts never start (blocked, offline, very slow), fall back to the plain readable page instead of a blank screen.
setTimeout(function(){if(!window.__worldReady){var h=document.documentElement;h.removeAttribute('data-world-live');h.setAttribute('data-world-seen','');h.setAttribute('data-world-fallback','')}},7000)})();
// Plain-page pager: the same one-swipe-one-section behaviour as the full experience, for the
// moments before the page's main code has arrived (slow connections). Inert once it has.
(function(){var lt=-1e9,lf=-1e9,ld=0,av=0,fd=0,pv=0,used=false,until=0;
addEventListener('wheel',function(e){var de=document.documentElement;
if(de.hasAttribute('data-world-live')||e.ctrlKey||!document.querySelector('[data-trail-host="5"]'))return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(pointer: coarse)').matches)return;
var dy=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
if(Math.abs(e.deltaX)>Math.abs(dy))return;var dir=dy>0?1:dy<0?-1:0;if(!dir)return;
var ts=e.timeStamp,ab=Math.abs(dy),fresh=false;
if(ts-lt>120||dir!==ld)fresh=true;else{if(ab<pv)fd++;else if(ab>pv*1.1)fd=Math.max(0,fd-1);if(fd>=4&&ab>=25&&ab>av*2.4&&ts-lf>450)fresh=true}
av=fresh?ab:av*.75+ab*.25;if(fresh){fd=0;used=false;lf=ts}lt=ts;ld=dir;pv=ab;
var tops=[].map.call(document.querySelectorAll('[data-trail-host="5"] section[aria-label], footer'),function(x){return Math.round(x.getBoundingClientRect().top+scrollY)});
var y=scrollY,t=null;if(dir>0){for(var i=0;i<tops.length;i++)if(tops[i]>y+6){t=tops[i];break}}else{for(var j=tops.length-1;j>=0;j--)if(tops[j]<y-6){t=tops[j];break}}
if(t===null)return;e.preventDefault();
if(!fresh||used||Date.now()<until)return;used=true;until=Date.now()+650;scrollTo({top:t,behavior:'smooth'})},{passive:false});})();

// Plain-page swipe pager (touch): a swipe moves one screenful inside a tall section, or on to the
// next section once its content has been seen: it never skips content and never overshoots.
(function(){var sy=0,st=0,sp=0;
addEventListener('touchstart',function(e){sy=e.touches[0].clientY;st=e.timeStamp;sp=scrollY},{passive:true});
addEventListener('touchend',function(e){var de=document.documentElement;
if(de.hasAttribute('data-world-live')||!document.querySelector('[data-trail-host="5"]')||matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(pointer: coarse)').matches)return;
var ey=e.changedTouches[0].clientY,d=sy-ey,v=Math.abs(d)/Math.max(1,e.timeStamp-st);
if(Math.abs(d)<24&&v<0.25)return;var dir=d>0?1:-1;
var vh=innerHeight,y=sp,els=[].slice.call(document.querySelectorAll('[data-trail-host="5"] section[aria-label], footer')),
secs=els.map(function(x){var r=x.getBoundingClientRect();return{t:Math.round(r.top+scrollY),b:Math.round(r.bottom+scrollY)}}),cur=0;
for(var i=0;i<secs.length;i++)if(secs[i].t<=y+vh*0.5)cur=i;
var c=secs[cur],t=null;
if(dir>0){if(c.b-(y+vh)>24)t=Math.min(y+vh*0.85,c.b-vh);else if(secs[cur+1])t=secs[cur+1].t}
else{if(y-c.t>24)t=Math.max(y-vh*0.85,c.t);else if(secs[cur-1]){var p=secs[cur-1];t=(p.b-p.t>vh)?p.b-vh:p.t}}
if(t===null)return;scrollTo({top:Math.round(t),behavior:'smooth'})},{passive:true});})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
      </head>
      <body>
        <StructuredData />
        <Hud />
        {children}
        <Footer />
        <FloatingPlayer />
        <WhatsAppWidget />
        <FireCursor />
        <Cursor />
        <Analytics />
      </body>
    </html>
  );
}
