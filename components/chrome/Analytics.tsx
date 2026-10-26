import Script from 'next/script';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import { ContactClicks } from './ContactClicks';

/** Google Analytics on every page (root layout). Renders nothing until a measurement ID is set. */
export function Analytics() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${JSON.stringify(GA_MEASUREMENT_ID)});`}
      </Script>
      <ContactClicks />
    </>
  );
}
