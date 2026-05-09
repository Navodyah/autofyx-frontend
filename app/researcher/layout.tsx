'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import {
  FlaskConical,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  Car,
  Sun,
  Moon,
  CalendarDays,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { AuthProvider } from '@/lib/auth-context';
import { performFullLogout } from '@/lib/appwrite';
import { parseBrowserAuthToken } from '@/lib/auth-token';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Types ───────────────────────────────────── */
interface SessionUser {
  username: string;
  email: string;
  user_type: string;
  appwrite_id?: string;
  profile_image_url?: string;
}

/* ── Helpers ─────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function capitalizeWords(str: string): string {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function readSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email || parsed?.username) {
        return {
          username: parsed.username || parsed.email?.split('@')[0] || 'Researcher',
          email: parsed.email || '',
          user_type: parsed.user_type || 'researcher',
          appwrite_id: parsed.appwrite_id,
          profile_image_url: parsed.profile_image_url,
        };
      }
    }
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const payload = parseBrowserAuthToken(token);
    if (payload?.email) {
      return {
        username: payload.email.split('@')[0],
        email: payload.email,
        user_type: payload.user_type || 'researcher',
        appwrite_id: payload.appwrite_id,
      };
    }
  } catch { /* ignore */ }
  return null;
}

function UserAvatar({ name }: { name: string }) {
  const colors = [
    ['#155dfc', '#1e3a8a'],
    ['#7c3aed', '#4c1d95'],
    ['#0891b2', '#164e63'],
    ['#059669', '#064e3b'],
    ['#d97706', '#78350f'],
  ];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  const [fg, bg] = colors[idx];
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border-2 border-white/10 shadow"
      style={{ background: `linear-gradient(135deg, ${bg}, ${fg})`, color: '#fff' }}
    >
      {getInitials(name)}
    </div>
  );
}

/* ── Nav items ───────────────────────────────── */
const navItems = [
  { label: 'Overview', href: '/researcher', icon: LayoutDashboard },
  { label: 'Analytical Data', href: '/researcher/analatical', icon: LineChart },
  { label: 'Access Data', href: '/researcher/access_data', icon: Search },
  { label: 'Compare', href: '/researcher/compare', icon: Scale },
  { label: 'Settings', href: '/researcher/re_settings', icon: Settings },
];

/* ── Sidebar content ─────────────────────────── */
function SidebarContent({
  pathname,
  sessionUser,
  displayName,
  currentTime,
  isLoggingOut,
  isDarkMode,
  toggleTheme,
  handleLogout,
  onNavClick,
}: {
  pathname: string;
  sessionUser: SessionUser | null;
  displayName: string;
  currentTime: Date | null;
  isLoggingOut: boolean;
  isDarkMode: boolean;
  isNavigating: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
  onNavClick: (href: string) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-[#030304]">
      {/* Logo */}
      <Link href="/" onClick={() => onNavClick('/')} className="h-[72px] flex items-center px-7 border-b border-[#155dfc]/20 flex-shrink-0 hover:bg-[#155dfc]/5 transition-colors group">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#155dfc]/20 border border-[#155dfc]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FlaskConical className="w-4 h-4 text-[#155dfc]" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white group-hover:text-[#93c5fd] transition-colors">AutoFyx</span>
            <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">Research Portal</p>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Research Menu</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.href === '/researcher' 
              ? pathname === item.href 
              : (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onNavClick(item.href)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-[#155dfc] text-white shadow-lg shadow-[#155dfc]/30'
                    : 'text-white/60 hover:bg-[#155dfc]/10 hover:text-white'
                  }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/50'}`} />
                <span className="truncate">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Back to user dashboard shortcut */}
        <div className="mt-6 pt-5 border-t border-white/5">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Quick Access</p>
          <Link
            href="/dashboard"
            onClick={() => onNavClick('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(21,93,252,0.12)', color: '#93c5fd', border: '1px solid rgba(21,93,252,0.25)' }}
          >
            <Car className="w-3.5 h-3.5" />
            User Dashboard
            <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
          </Link>
        </div>
      </div>

      {/* Footer — user card + logout */}
      <div className="px-4 py-5 border-t border-[#155dfc]/20 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#155dfc]/10 border border-[#155dfc]/20">
          {sessionUser?.profile_image_url ? (
            <img
              src={sessionUser.profile_image_url}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#155dfc]/40 shadow-sm"
            />
          ) : (
            <UserAvatar name={displayName} />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">{displayName}</p>
            <p className="text-[11px] text-white/40 truncate mt-0.5">{sessionUser?.email || '…'}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#93c5fd] mt-1.5 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {currentTime
                ? currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '...'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-[#155dfc]/20 transition-all border border-[#155dfc]/30 text-white flex-shrink-0"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#93c5fd]" /> : <Moon className="w-4 h-4 text-[#155dfc]" />}
          </button>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Signing out…
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              Log Out
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Layout ──────────────────────────────────── */
export default function ResearcherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  /* Clock */
  useEffect(() => {
    setCurrentTime(new Date());
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Load user */
  useEffect(() => {
    setSessionUser(readSessionUser());
    const interval = setInterval(() => setSessionUser(readSessionUser()), 2000);
    return () => clearInterval(interval);
  }, []);

  /* Theme */
  useEffect(() => {
    setIsDarkMode(localStorage.getItem('autofyx_theme') === 'dark');
    const handler = (e: Event) => setIsDarkMode((e as CustomEvent).detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  /* Navigation loader logic */
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      setIsNavigating(true);
      setMobileOpen(false);
    }
  };

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('autofyx_theme', next ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('themeSync', { detail: next }));
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const raw = localStorage.getItem('auth_session');
      const sessionId = raw ? (JSON.parse(raw) as { sessionId?: string }).sessionId : null;
      await performFullLogout(sessionId || undefined);
    } catch { /* ignore */ } finally {
      window.location.replace('/login');
    }
  };

  const displayName = capitalizeWords(sessionUser?.username || 'Researcher');

  const sidebarProps = {
    pathname,
    sessionUser,
    displayName,
    currentTime,
    isLoggingOut,
    isDarkMode,
    isNavigating,
    toggleTheme,
    handleLogout,
    onNavClick: handleNavClick,
  };

  return (
    <AuthProvider>
      <div
        suppressHydrationWarning
        className="flex h-screen font-sans overflow-hidden transition-colors duration-500"
        style={{ background: isDarkMode ? '#030304' : '#f0f4ff' }}
      >
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col flex-shrink-0 z-20">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* ── Mobile overlay ── */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <SidebarContent {...sidebarProps} onNavClick={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          {/* Mobile top bar */}
          <header className="lg:hidden h-14 flex items-center justify-between px-4 bg-[#030304] border-b border-[#155dfc]/20 flex-shrink-0">
            <button onClick={() => setMobileOpen(true)} className="text-white/70 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" onClick={() => handleNavClick('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 rounded-md bg-[#155dfc]/20 border border-[#155dfc]/30 flex items-center justify-center">
                <FlaskConical className="w-3.5 h-3.5 text-[#155dfc]" />
              </div>
              <span className="text-sm font-bold text-white">AutoFyx Research</span>
            </Link>
            <div className="w-5" />
          </header>

          <main
            className="flex-1 overflow-y-auto transition-colors duration-500 relative"
            style={{ background: isDarkMode ? '#030304' : '#ffffff' }}
          >
            {/* ── Content-area route-transition loader ── */}
            <AnimatePresence>
              {isNavigating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { delay: 0.1, duration: 0.3 } }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030304] w-full"
                >
                  <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#155dfc]/10 blur-[150px] rounded-full pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center gap-6 px-6 w-full max-w-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-11 h-11 rounded-lg bg-[#155dfc]/20 border border-[#155dfc]/30 flex items-center justify-center">
                        <FlaskConical className="w-5 h-5 text-[#155dfc]" />
                      </div>
                      <span className="text-white font-bold text-2xl tracking-wide">AutoFyx</span>
                    </div>
                    <div className="flex flex-col items-center gap-5 mt-4">
                      <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-[#155dfc] border-r-[#155dfc]/40 border-b-transparent border-l-transparent animate-spin" />
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-zinc-100 font-semibold text-[17px] tracking-wide">Research View</p>
                        <p className="text-zinc-500 text-sm mt-1.5 font-medium">Loading research analytics...</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-8"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
