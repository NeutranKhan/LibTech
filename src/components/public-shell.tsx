import Link from 'next/link';
import { site } from '@/lib/site';
import { AccountNavigation } from './account-navigation';
export function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">L</span>LibTech<span className="brand-dot">.</span>
    </Link>
  );
}
export function Header() {
  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Main navigation">
        <Link href="/courses">Explore courses</Link>
        <Link href="/#how-it-works">How it works</Link>
        <AccountNavigation />
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="wrap footer">
      <Brand />
      <span>Practical skills. New possibilities.</span>
      <div>
        <Link href="/support">Support free learning</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <a href={'mailto:' + site.supportEmail}>Support</a>
        <span>© {new Date().getFullYear()} LibTech</span>
      </div>
    </footer>
  );
}
