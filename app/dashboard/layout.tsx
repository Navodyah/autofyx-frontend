'use client';

import {
  LayoutDashboard,
  Car,
  LineChart,
  SearchCheck,
  Scale,
  Calculator,
  User,
  Heart,
  Settings,
  Bell,
  Menu,
  LogOut,
  FlaskConical,
  ChevronRight,
  Sun,
  Moon,
  CalendarDays,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import { performFullLogout } from '@/lib/appwrite';
import { parseBrowserAuthToken } from '@/lib/auth-token';
import { motion, AnimatePresence } from 'framer-motion';
import UserPreferenceOnboardingModal from '@/components/user-preference-onboarding-modal';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

/* ─── Types ──────────────────────────────────────────────────── */
interface SessionUser {
  username: string;
  email: string;
  user_type: 'user' | 'researcher' | 'admin' | string;
  appwrite_id?: string;
  profile_image_url?: string;
}

function capitalizeFirstLetters(str: string): string {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

/* ─── Helpers ────────────────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function roleBadge(role: string): { label: string; color: string; bg: string } {
  if (role === 'researcher') return { label: 'Researcher', color: '#155dfc', bg: '#EFF6FF' };
  if (role === 'admin') return { label: 'Admin', color: '#B45309', bg: '#FEF3C7' };
  return { label: 'Member', color: '#155dfc', bg: '#DBEAFE' };
}

/** Read and merge user profile from localStorage (user_data + auth_token fallback) */
function readSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email || parsed?.username) {
        return {
          username: parsed.username || parsed.email?.split('@')[0] || 'User',
          email: parsed.email || '',
          user_type: parsed.user_type || 'user',
          appwrite_id: parsed.appwrite_id,
          profile_image_url: parsed.profile_image_url,
        };
      }
    }
    // Fallback: decode from JWT token stored in localStorage
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const payload = parseBrowserAuthToken(token);
    if (payload?.email) {
      return {
        username: payload.email.split('@')[0],
        email: payload.email,
        user_type: payload.user_type || 'user',
        appwrite_id: payload.appwrite_id,
      };
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

/* ─── Nav items ──────────────────────────────────────────────── */
const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Assistant AI', href: '/dashboard/assistant', icon: Sparkles },
  { label: 'Recommendation', href: '/dashboard/recomendation', icon: LineChart },
  { label: 'Vehicle Search', href: '/dashboard/search', icon: SearchCheck },
  { label: 'Compare', href: '/dashboard/compare', icon: Scale },
  { label: 'Cost Calculation', href: '/dashboard/cost-calculation', icon: Calculator },
  { label: 'My Garage', href: '/dashboard/garage', icon: Heart },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

/* ─── Avatar component ───────────────────────────────────────── */
function UserAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const colors = [
    ['#155dfc', '#EFF6FF'], ['#1d4ed8', '#DBEAFE'], ['#2563eb', '#EFF6FF'],
    ['#155dfc', '#DBEAFE'], ['#1e40af', '#EFF6FF'], ['#155dfc', '#EFF6FF'],
  ];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  const [fg, bg] = colors[idx];

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-bold flex-shrink-0 border-2 border-white shadow-sm`}
      style={{ background: bg, color: fg }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Layout ─────────────────────────────────────────────────── */
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  /* Start real-time clock */
  useEffect(() => {
    setCurrentTime(new Date());
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Theme persistence */
  useEffect(() => {
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    if (stored) setIsDarkMode(true);
    
    // Listen to themeSync so if layout re-mounts it can sync
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsDarkMode(customEvent.detail);
    };
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('autofyx_theme', newTheme ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('themeSync', { detail: newTheme }));
  };

  /* Load user from localStorage once on mount (client-only) */
  useEffect(() => {
    const user = readSessionUser();
    setSessionUser(user);
    setIsUserLoaded(true);

    // Fetch profile image from API to ensure it shows if missing in localStorage
    if (user?.email || user?.appwrite_id) {
       const params = new URLSearchParams();
       if (user.email) params.append('email', user.email);
       if (user.appwrite_id) params.append('appwrite_id', user.appwrite_id);
       fetch(`/api/user-preferences?${params.toString()}`)
         .then(res => res.json())
         .then(data => {
            if (data?.profile?.profile_image_url) {
               setSessionUser(prev => prev ? { ...prev, profile_image_url: data.profile.profile_image_url } : null);
               try {
                 const raw = localStorage.getItem('user_data');
                 const parsed = raw ? JSON.parse(raw) : {};
                 parsed.profile_image_url = data.profile.profile_image_url;
                 localStorage.setItem('user_data', JSON.stringify(parsed));
               } catch (e) {}
            }
         })
         .catch(err => console.error('Failed to fetch live profile:', err));
    }

    // Periodically sync user_data from LocalStorage to update avatar in layout real-time
    const interval = setInterval(() => {
      const liveUser = readSessionUser();
      setSessionUser(liveUser);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  /* Stop route-transition loader when pathname settles */
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  const handleNavClick = (href: string) => {
    if (pathname !== href) setIsNavigating(true);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
      const sessionId = raw ? (JSON.parse(raw) as { sessionId?: string }).sessionId : null;
      await performFullLogout(sessionId);
    } catch {
      // performFullLogout swallows errors; just proceed
    } finally {
      setIsLoggingOut(false);
      window.location.replace('/login');
    }
  };

  /* Derived display values */
  const displayName = sessionUser?.username || '…';
  const displayEmail = sessionUser?.email || '';
  const userRole = sessionUser?.user_type || 'user';
  const badge = roleBadge(userRole);
  const isResearcher = userRole === 'researcher';
  const finalDisplayName = capitalizeFirstLetters(displayName);

  /* Skeleton pulse for fields not yet loaded */
  const skeletonCls = !isUserLoaded
    ? 'bg-zinc-800 animate-pulse rounded text-transparent select-none'
    : '';

  return (
    <div suppressHydrationWarning className="flex h-screen text-slate-900 font-sans overflow-hidden relative transition-colors duration-500" style={{ background: isDarkMode ? '#030304' : '#f0f4ff' }}>

      <UserPreferenceOnboardingModal />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-[#030304] z-20 flex-shrink-0">

        {/* Logo */}
        <Link href="/" className="h-[72px] flex items-center px-7 border-b border-[#155dfc]/20 flex-shrink-0 hover:bg-[#155dfc]/5 transition-colors group">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#155dfc]/20 border border-[#155dfc]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-4 h-4 text-[#155dfc]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#93c5fd] transition-colors">AutoFyx</span>
          </div>
        </Link>



        {/* Nav */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[#155dfc] text-white shadow-lg shadow-[#155dfc]/30' : 'text-white/60 hover:bg-[#155dfc]/10 hover:text-white'
                    }`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/50'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-4 py-5 border-t border-[#155dfc]/20 flex-shrink-0 flex flex-col gap-3">
          
          {/* User card in sidebar */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-[#155dfc]/10 border border-[#155dfc]/20">
            {sessionUser?.profile_image_url ? (
              <img src={sessionUser.profile_image_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-[#155dfc]/40 shadow-sm" />
            ) : (
              <UserAvatar name={finalDisplayName} />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold text-white truncate leading-tight ${skeletonCls}`}>
                {finalDisplayName}
              </p>
              <p className={`text-[11px] text-white/40 truncate mt-0.5 ${skeletonCls}`}>
                {displayEmail || '…'}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#93c5fd] mt-1.5 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {currentTime ? currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}
              </p>
            </div>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-[#155dfc]/20 transition-all border border-[#155dfc]/30 text-white flex-shrink-0"
            >
               {isDarkMode ? <Sun className="w-4 h-4 text-[#93c5fd]" /> : <Moon className="w-4 h-4 text-[#155dfc]" />}
            </button>
          </div>

          {/* Researcher shortcut */}
          {isResearcher && (
            <Link
              href="/researcher"
              onClick={() => handleNavClick('/researcher')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(21,93,252,0.12)', color: '#93c5fd', border: '1px solid rgba(21,93,252,0.25)' }}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Researcher Dashboard
              <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
            </Link>
          )}

          <button
            suppressHydrationWarning
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
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Logout
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 relative">
        
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
                    <Car className="w-5 h-5 text-[#155dfc]" />
                  </div>
                  <span className="text-white font-bold text-2xl tracking-wide">AutoFyx</span>
                </div>
                <div className="flex flex-col items-center gap-5 mt-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#155dfc] border-r-[#155dfc]/40 border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-zinc-100 font-semibold text-[17px] tracking-wide">Loading View</p>
                    <p className="text-zinc-500 text-sm mt-1.5 font-medium">Preparing your dashboard data...</p>
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

        {/* Top floating glass header */}


        {/* Page content */}
        <main className="flex-1 overflow-y-auto transition-colors duration-500" style={{ background: isDarkMode ? '#030304' : '#ffffff' }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f0f4ff]" />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
