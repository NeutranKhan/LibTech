import { Brand } from '@/components/public-shell';
import Link from 'next/link';
import { Check, Mail, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
export const metadata = { robots: { index: false, follow: false } };
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <div className="auth-story">
        <Brand />
        <div className="auth-story-content">
          <span className="eyebrow">
            <span className="sample-dot" /> LEARN SOMETHING YOU CAN USE
          </span>
          <h1>
            Small steps.
            <br />
            Real possibilities<span className="lime-dot">.</span>
          </h1>
          <p>
            Build the confidence to make AI part of your everyday. One practical lesson at a time.
          </p>
          <div className="auth-preview">
            <div className="auth-preview-heading">
              <span>
                <BookOpen size={15} />
                INSIDE AI ESSENTIALS
              </span>
              <span>LESSON 10</span>
            </div>
            <div className="auth-preview-body">
              <div className="auth-preview-icon">
                <Mail size={25} />
              </div>
              <div>
                <span className="auth-preview-category">AI FOR REAL WORK</span>
                <h3>
                  A better email.
                  <br />
                  In your own voice.
                </h3>
              </div>
            </div>
            <div className="auth-prompt">
              “Draft a friendly reminder about Friday’s deadline. Keep it under 80 words.”
            </div>
            <div className="auth-preview-checks">
              <span>
                <Check size={14} />
                Clear task
              </span>
              <span>
                <Check size={14} />
                Useful context
              </span>
              <span>
                <Check size={14} />
                Your voice
              </span>
            </div>
          </div>
          <div className="auth-learning-path">
            <span>
              <Sparkles size={16} />
              Learn
            </span>
            <i />
            <span>Practice</span>
            <i />
            <span>Grow</span>
          </div>
        </div>
        <div className="auth-story-bottom">
          <span>
            <ShieldCheck size={16} />
            Your pace. Your progress.
          </span>
          <Link href="/courses">Explore the course ↗</Link>
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-card">{children}</div>
        <div className="auth-legal">
          <Link href="/privacy">Privacy</Link>
          <span>·</span>
          <Link href="/terms">Terms</Link>
          <span>·</span>
          <span>© {new Date().getFullYear()} LibTech</span>
        </div>
      </div>
    </main>
  );
}
