import Link from 'next/link';

/** The short privacy line under every form (links to the privacy notice). */
export function PrivacyLink() {
  return (
    <>
      {' '}
      <Link href="/privacy" style={{ textDecoration: 'underline' }}>
        How we use your details
      </Link>
      .
    </>
  );
}
