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
  if (role === 'researcher') return { label: 'Researcher', color: '#7C3AED', bg: '#EDE9FE' };
  if (role === 'admin')      return { label: 'Admin',      color: '#B45309', bg: '#FEF3C7' };
  return                            { label: 'Member',     color: '#059669', bg: '#D1FAE5' };
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
  { label: 'Overview',         href: '/dashboard',                  icon: LayoutDashboard },
  { label: 'Recommendation',   href: '/dashboard/recomendation',    icon: LineChart       },
  { label: 'Vehicle Search',   href: '/dashboard/search',           icon: SearchCheck     },
  { label: 'Compare',          href: '/dashboard/compare',          icon: Scale           },
  { label: 'Cost Calculation', href: '/dashboard/cost-calculation', icon: Calculator      },
  { label: 'My Garage',        href: '/dashboard/garage',           icon: Heart           },
  { label: 'Settings',         href: '/dashboard/settings',         icon: Settings        },
];

/* ─── Avatar component ───────────────────────────────────────── */
function UserAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const dim  = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const colors = [
    ['#6366F1', '#EEF2FF'], ['#8B5CF6', '#F5F3FF'], ['#EC4899', '#FDF2F8'],
    ['#0EA5E9', '#F0F9FF'], ['#14B8A6', '#F0FDFA'], ['#F59E0B', '#FFFBEB'],
  ];
  const idx   = (name.charCodeAt(0) || 0) % colors.length;
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
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionUser, setSessionUser]   = useState<SessionUser | null>(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  /* Load user from localStorage once on mount (client-only) */
  useEffect(() => {
    const user = readSessionUser();
    setSessionUser(user);
    setIsUserLoaded(true);
    
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
      const raw       = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
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
  const userRole     = sessionUser?.user_type || 'user';
  const badge        = roleBadge(userRole);
  const isResearcher = userRole === 'researcher';
  const finalDisplayName = capitalizeFirstLetters(displayName);

  /* Skeleton pulse for fields not yet loaded */
  const skeletonCls = !isUserLoaded
    ? 'bg-zinc-800 animate-pulse rounded text-transparent select-none'
    : '';

  return (
    <div suppressHydrationWarning className="flex h-screen bg-[#f4f6f9] text-slate-900 font-sans overflow-hidden relative">

      {/* ── Full-screen route-transition loader ── */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.1, duration: 0.3 } }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0c] w-full"
          >
            <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#2a2a30]/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-6 px-6 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-zinc-200" />
                </div>
                <span className="text-white font-bold text-2xl tracking-wide">AutoFyx</span>
              </div>
              <div className="flex flex-col items-center gap-5 mt-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-white/60 border-r-white/20 border-b-transparent border-l-transparent animate-spin" />
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

      <UserPreferenceOnboardingModal />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-[#0a0a0c] z-20 flex-shrink-0">

        {/* Logo */}
        <div className="h-[72px] flex items-center px-7 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AutoFyx</span>
          </div>
        </div>

        {/* User card in sidebar */}
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/8">
            {sessionUser?.profile_image_url ? (
              <img src={sessionUser.profile_image_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow-sm" />
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
            </div>
            {/* Role badge dot */}
            {userRole !== 'user' && (
               <span
                 className="w-2 h-2 rounded-full flex-shrink-0"
                 style={{ background: badge.color }}
                 title={badge.label}
               />
            )}
          </div>

          {/* Researcher shortcut */}
          {isResearcher && (
            <Link
              href="/researcher"
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(124,58,237,0.12)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Researcher Dashboard
              <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
            </Link>
          )}
        </div>

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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive ? 'bg-white text-slate-900 shadow-md' : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-700' : 'text-white/50'}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer – logout */}
        <div className="px-4 py-5 border-t border-white/5 flex-shrink-0">
          <button
            suppressHydrationWarning
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Top floating glass header */}
        <header
          className="h-[72px] flex items-center justify-between px-6 lg:px-8 z-10 flex-shrink-0 mt-4 mx-4 rounded-3xl transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Left: mobile hamburger + page title */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button suppressHydrationWarning variant="ghost" size="icon" className="lg:hidden text-[#777C6D] hover:bg-black/5 rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-[#0a0a0c] border-r-0">
                <SheetHeader className="px-6 py-5 border-b border-white/5">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">AutoFyx</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/8">
                    {sessionUser?.profile_image_url ? (
                      <img src={sessionUser.profile_image_url} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                    ) : (
                      <UserAvatar name={finalDisplayName} size="sm" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{finalDisplayName}</p>
                      {userRole !== 'user' && (
                        <span
                          className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5"
                          style={{ background: badge.bg + '33', color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <nav className="px-4 py-3 space-y-1">
                  {navItems.map((item) => (
                    <SheetClose asChild key={`mobile-${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          pathname === item.href ? 'bg-white text-slate-900' : 'text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                  {isResearcher && (
                    <SheetClose asChild>
                      <Link
                        href="/researcher"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:bg-purple-900/20 transition-all"
                      >
                        <FlaskConical className="w-4 h-4" />
                        Researcher Dashboard
                      </Link>
                    </SheetClose>
                  )}
                </nav>

                {/* Mobile logout */}
                <div className="px-4 pt-2 border-t border-white/5 mt-2">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? 'Signing out...' : 'Logout'}
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Page title */}
            <div>
              <h2 className="text-sm font-extrabold tracking-wide" style={{ color: '#2d3027' }}>Dashboard</h2>
              <p className="text-[11px] font-bold" style={{ color: '#777C6D' }}>
                Welcome back,{' '}
                <span className={skeletonCls}>{finalDisplayName}</span>
              </p>
            </div>
          </div>

          {/* Right: bell + profile */}
          <div className="flex items-center gap-4">
            {/* Bell */}
            <button
              className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5"
              style={{ background: 'rgba(0, 0, 0, 0.04)' }}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" style={{ color: '#2d3027' }} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full shadow-sm" />
            </button>

            {/* Profile chip */}
            <div
              className="flex items-center gap-3 pl-4 cursor-pointer group"
              style={{ borderLeft: '1.5px solid rgba(0,0,0,0.06)' }}
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className={`text-sm font-extrabold leading-tight text-[#2d3027] ${skeletonCls}`}>
                  {finalDisplayName}
                </span>
                {userRole !== 'user' && (
                  <span
                    className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {isUserLoaded ? badge.label : '…'}
                  </span>
                )}
              </div>

              {/* Avatar */}
              {isUserLoaded ? (
                sessionUser?.profile_image_url ? (
                  <img src={sessionUser.profile_image_url} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <UserAvatar name={finalDisplayName} />
                )
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-200 animate-pulse" />
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#F4F2EC' }}>
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
    <Suspense fallback={<div className="min-h-screen bg-[#f4f6f9]" />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
