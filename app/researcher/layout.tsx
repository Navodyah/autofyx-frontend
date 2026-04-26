'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  FlaskConical,
  LayoutDashboard,
  LineChart,
  Search,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { AuthProvider } from '@/lib/auth-context';
import { performFullLogout } from '@/lib/appwrite';
import { parseBrowserAuthToken } from '@/lib/auth-token';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: 'Overview', href: '/researcher', icon: LayoutDashboard },
  { label: 'Recommendations', href: '/dashboard/recomendation', icon: LineChart },
  { label: 'Vehicle Search', href: '/dashboard/search', icon: Search },
  { label: 'Compare Insights', href: '/dashboard/compare', icon: BarChart3 },
];

export default function ResearcherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const userEmail = useMemo(() => {
    if (typeof window === 'undefined') return 'researcher@autofyx.com';

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const payload = parseBrowserAuthToken(token);
    return payload?.email || 'researcher@autofyx.com';
  }, []);

  const handleLogout = async () => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
      const sessionId = raw ? (JSON.parse(raw) as { sessionId?: string }).sessionId : null;
      await performFullLogout(sessionId || undefined);
    } catch {
      // ignore logout errors and navigate anyway
    } finally {
      window.location.replace('/login');
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen">
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
              open ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-violet-100 p-2">
                  <FlaskConical className="h-5 w-5 text-violet-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AutoFyx</p>
                  <p className="text-xs text-slate-500">Researcher</p>
                </div>
              </div>
              <button type="button" className="lg:hidden" onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <nav className="space-y-1 p-3">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active ? 'bg-violet-100 text-violet-800' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-200 p-4">
              <p className="truncate text-xs text-slate-500">{userEmail}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </aside>

          <div className="flex-1 lg:ml-72">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
              <button type="button" className="lg:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              <h1 className="text-sm font-semibold text-slate-700 lg:text-base">Research Workspace</h1>
              <div className="w-5" />
            </header>

            <main className="p-4 lg:p-6">{children}</main>
          </div>

          {open && (
            <button
              type="button"
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            />
          )}
        </div>
      </div>
    </AuthProvider>
  );
}
