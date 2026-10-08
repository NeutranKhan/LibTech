import type { Metadata } from 'next';
import './globals.css';
import './future.css';
import './motion.css';
import { MotionEffects } from '@/components/motion-effects';
import localFont from 'next/font/local';
const manrope = localFont({
  src: './fonts/manrope.woff2',
  variable: '--font-manrope',
  display: 'swap',
});
export const metadata: Metadata = {
  title: { default: 'LibTech — Learn AI by Doing', template: '%s | LibTech' },
  description:
    'Practical AI skills through short interactive lessons, real-world challenges, and useful feedback.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'LibTech — Learn AI by Doing',
    description: 'Small lessons. Real-world AI skills.',
    type: 'website',
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
        <MotionEffects />
      </body>
    </html>
  );
}
