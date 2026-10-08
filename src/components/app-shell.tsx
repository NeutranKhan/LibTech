'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from './public-shell';
import { api } from '@/lib/client';
import type { User } from '@/lib/domain';
import { BookOpen, LayoutDashboard, Award, UserRound, Settings, LogOut, Flame } from 'lucide-react';
export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const links = [
    ['/dashboard', 'Dashboard', LayoutDashboard],
    ['/courses', 'Explore courses', BookOpen],
    ['/certificates', 'Certificates', Award],
    ['/profile', 'My profile', UserRound],
  ] as const;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-label">YOUR LEARNING SPACE</div>
        <nav aria-label="Learning navigation">
          {links.map(([href, name, Icon]) => (
            <Link key={href} href={href} className={path.startsWith(href) ? 'active' : ''}>
              <Icon size={19} />
              <span>{name}</span>
            </Link>
          ))}
          {user.role !== 'STUDENT' && (
            <Link href="/admin" className={path.startsWith('/admin') ? 'active' : ''}>
              <Settings size={19} />
              Manage LibTech
            </Link>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="tiny-note">
            A little progress
            <br />
            is still progress. ✳
          </div>
          <button
            className="logout"
            onClick={async () => {
              await api('logout', {});
              for (const k of Object.keys(sessionStorage))
                if (k.startsWith('libtech-draft:')) sessionStorage.removeItem(k);
              router.push('/');
              router.refresh();
            }}
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <span className="muted">Make today a little more useful.</span>
          <div>
            <span className="streak">
              <Flame size={17} />
              {user.streak} day streak
            </span>
            <details className="account-menu">
              <summary aria-label="Account menu">
                <span className="avatar">{user.name.slice(0, 1)}</span>
              </summary>
              <div className="account-popover">
                <strong>{user.name}</strong>
                <small>
                  {user.role === 'STUDENT'
                    ? 'LibTech learner'
                    : user.role === 'ADMIN'
                      ? 'Platform administrator'
                      : 'Course instructor'}
                </small>
                <Link href="/profile">
                  <UserRound size={16} />
                  My profile
                </Link>
                <button
                  onClick={async () => {
                    await api('logout', {});
                    for (const k of Object.keys(sessionStorage))
                      if (k.startsWith('libtech-draft:')) sessionStorage.removeItem(k);
                    router.push('/');
                    router.refresh();
                  }}
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </details>
          </div>
        </header>

        <main className="workspace">{children}</main>
      </div>
    </div>
  );
}
