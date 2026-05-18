'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Database, Users, Car, ChevronDown,
  MessageSquare, Image, Settings, Fuel, FlaskConical, LogOut,
  ShieldCheck, CalendarDays,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { performFullLogout } from '@/lib/appwrite';
import { parseBrowserAuthToken } from '@/lib/auth-token';

/* ── Types ─────────────────────────────────────── */
interface AdminUser {
  username: string;
  email: string;
}

/* ── Helpers ────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function readAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.email) {
        return {
          username: parsed.username || parsed.email.split('@')[0],
          email: parsed.email,
        };
      }
    }
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const payload = parseBrowserAuthToken(token);
    if (payload?.email) {
      return {
        username: payload.email.split('@')[0],
        email: payload.email,
      };
    }
  } catch { /* ignore */ }
  return null;
}

/* ── Nav config ─────────────────────────────────── */
const topNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
];

const mgmtNav = [
  { label: 'Users', href: '/admin/user_management', icon: Users },
  { label: 'Admin Management', href: '/admin/admin_management', icon: ShieldCheck },
  { label: 'Researcher Requests', href: '/admin/pending_approvel', icon: FlaskConical },
  { label: 'Fuel Prices', href: '/admin/fuel_price_manage', icon: Fuel },
  { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { label: 'Images', href: '/admin/images_manage', icon: Image },
  { label: 'System Settings', href: '/admin/system_setting', icon: Settings },
];

const catalogItems = [
  { name: 'Vehicles', href: '/admin/catalog/vehicles' },
  { name: 'Brands', href: '/admin/catalog/brands' },
  { name: 'Models', href: '/admin/catalog/models' },
  { name: 'Engine Types', href: '/admin/catalog/engine-types' },
  { name: 'Fuel Types', href: '/admin/catalog/FuelType' },
  { name: 'Transmissions', href: '/admin/catalog/transmission' },
  { name: 'Vehicle Classes', href: '/admin/catalog/vehicles_class' },
  { name: 'Oil Quality', href: '/admin/catalog/oil' },
  { name: 'Maintenance', href: '/admin/catalog/maintenance' },
];

/* ── Sidebar component ──────────────────────────── */
const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCatalogOpen, setIsCatalogOpen] = useState(
    pathname.startsWith('/admin/catalog')
  );
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /* Read admin profile */
  useEffect(() => {
    setAdminUser(readAdminUser());
    const id = setInterval(() => setAdminUser(readAdminUser()), 3000);
    return () => clearInterval(id);
  }, []);

  /* Live clock */
  useEffect(() => {
    setCurrentTime(new Date());
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Keep catalog open when navigating inside it */
  useEffect(() => {
    if (pathname.startsWith('/admin/catalog')) setIsCatalogOpen(true);
  }, [pathname]);

  /* Helpers */
  const navClass = (href: string, exact = false) =>
    clsx(
      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
      (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    );

  const displayName = adminUser?.username
    ? adminUser.username.charAt(0).toUpperCase() + adminUser.username.slice(1)
    : 'Admin';

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const raw = localStorage.getItem('auth_session');
      const sessionId = raw ? (JSON.parse(raw) as { sessionId?: string }).sessionId : null;
      await performFullLogout(sessionId || undefined);
    } catch { /* ignore */ } finally {
      router.replace('/admin_login');
    }
  };

  return (
    <aside className="w-72 bg-[#030712] text-white h-screen flex flex-col border-r border-slate-800 fixed left-0 top-0 z-50">

      {/* ── Logo ── */}
      <Link
        href="/"
        className="h-[68px] flex items-center px-6 border-b border-slate-800 hover:bg-slate-900/60 transition-colors group flex-shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-blue-600/30">
            <Car className="text-white" size={18} />
          </div>
          <div>
            <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
              AutoFyx
            </span>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase leading-none mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>
      </Link>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5 scrollbar-hide">

        <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Overview</p>

        {topNav.map(({ label, href, icon: Icon, exact }) => (
          <Link key={href} href={href} className={navClass(href, exact)}>
            <Icon size={18} className="flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}

        <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-5 mb-2">Management</p>

        {mgmtNav.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={navClass(href)}>
            <Icon size={18} className="flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}

        {/* ── Catalog Dropdown ── */}
        <div className="mt-1">
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={clsx(
              'flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              pathname.startsWith('/admin/catalog')
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}
          >
            <span className="flex items-center gap-3">
              <Database size={18} className="flex-shrink-0" />
              Catalog
            </span>
            <ChevronDown
              size={15}
              className={`transition-transform duration-300 ${isCatalogOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${isCatalogOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-4 pl-3 border-l border-slate-800 mt-1 space-y-0.5 pb-1">
              {catalogItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'block px-3 py-2 text-xs rounded-lg transition-colors font-medium',
                    pathname.startsWith(item.href)
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </nav>

      {/* ── Admin Profile & Logout ── */}
      <div className="px-3 py-4 border-t border-slate-800 flex-shrink-0 space-y-2">

        {/* Profile card */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
            {getInitials(displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{adminUser?.email || '—'}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400 mt-1 flex items-center gap-1">
              <CalendarDays size={10} />
              {currentTime
                ? currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '...'}
            </p>
          </div>
        </div>

        {/* Logout */}
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
              <LogOut size={17} />
              Sign Out
            </>
          )}
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;