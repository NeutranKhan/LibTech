import { site } from '@/lib/site';
export function OperatorContact() {
  const email = site.supportEmail;
  const name = site.operator;
  if (!email || !name) return null;
  return (
    <section>
      <h2>Contact</h2>
      <p>
        LibTech is operated by {name}. For account, privacy, or payment questions, email{' '}
        <a href={'mailto:' + email}>{email}</a>.
      </p>
    </section>
  );
}
