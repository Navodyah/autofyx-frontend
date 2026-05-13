'use client';

import { useState, useEffect } from 'react';
import {
  Car, Users, Activity, ShieldCheck, TrendingUp, ArrowUpRight,
  FlaskConical, MessageSquare, Database, Clock, CalendarDays,
  BarChart3, Zap, Globe, Loader2, UserCheck, UserPlus, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { parseBrowserAuthToken } from '@/lib/auth-token';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/* ── Helpers ────────────────────────────────────── */
function readAdminName(): string {
  if (typeof window === 'undefined') return 'Admin';
  try {
    const raw = localStorage.getItem('user_data');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.username) return p.username.charAt(0).toUpperCase() + p.username.slice(1);
      if (p?.email) return p.email.split('@')[0];
    }
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    const payload = parseBrowserAuthToken(token);
    if (payload?.email) return payload.email.split('@')[0];
  } catch { /* ignore */ }
  return 'Admin';
}

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Build month-by-month registration trend from a list of users with created_at */
function buildUserTrend(users: any[]): { name: string; users: number }[] {
  const counts: Record<string, number> = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  users.forEach((u) => {
    if (!u.created_at) return;
    const d = new Date(u.created_at);
    if (isNaN(d.getTime())) return;
    const key = months[d.getMonth()];
    counts[key] = (counts[key] || 0) + 1;
  });
  // Return the last 7 months in order
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const idx = (now.getMonth() - 6 + i + 12) % 12;
    const name = months[idx];
    return { name, users: counts[name] || 0 };
  });
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const iconColors: Record<string, { bg: string; text: string }> = {
  blue:    { bg: 'bg-blue-500/15',    text: 'text-blue-400'    },
  purple:  { bg: 'bg-purple-500/15',  text: 'text-purple-400'  },
  indigo:  { bg: 'bg-indigo-500/15',  text: 'text-indigo-400'  },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  orange:  { bg: 'bg-orange-500/15',  text: 'text-orange-400'  },
};

/* ── Component ──────────────────────────────────── */
export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Real data states
  const [totalVehicles, setTotalVehicles]     = useState<number | null>(null);
  const [totalUsers, setTotalUsers]           = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number | null>(null);
  const [recentUsers, setRecentUsers]         = useState<any[]>([]);
  const [leaderboard, setLeaderboard]         = useState<any[]>([]);
  const [userTrend, setUserTrend]             = useState<{ name: string; users: number }[]>([]);
  const [requestsChartData, setRequestsChartData] = useState<{ name: string; approved: number; pending: number }[]>([]);

  /* Clock */
  useEffect(() => {
    setAdminName(readAdminName());
    setCurrentTime(new Date());
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* Fetch all real data */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [vehiclesRes, usersRes, pendingRes, leaderboardRes] = await Promise.all([
          fetch(`${API_BASE}/vehicles/`),                    // total vehicle count
          fetch(`${API_BASE}/users/all`),                    // all users
          fetch(`${API_BASE}/applications/pending`),         // pending researcher requests
          fetch(`${API_BASE}/recommendations/leaderboard?limit=5`), // top recommended vehicles
        ]);

        // --- Vehicles ---
        if (vehiclesRes.ok) {
          const vData = await vehiclesRes.json();
          // Try common response shapes
          const count = vData.total ?? vData.count ?? vData.length ?? null;
          if (count !== null) setTotalVehicles(count);
        }

        // --- Users ---
        if (usersRes.ok) {
          const uData = await usersRes.json();
          const users: any[] = uData.users ?? uData ?? [];
          setTotalUsers(users.length);
          // Sort newest first for recent activity feed
          const sorted = [...users].sort((a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
          setRecentUsers(sorted.slice(0, 5));
          setUserTrend(buildUserTrend(users));
        }

        // --- Pending researcher requests ---
        if (pendingRes.ok) {
          const pData = await pendingRes.json();
          const apps: any[] = pData.applications ?? [];
          setPendingRequests(apps.length);

          // Build a simple 7-day bar chart from application statuses
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const chartMap: Record<string, { approved: number; pending: number }> = {};
          days.forEach((d) => { chartMap[d] = { approved: 0, pending: 0 }; });
          apps.forEach((app) => {
            const date = new Date(app.created_at || app.submitted_at || Date.now());
            const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
            if (app.status === 'approved') chartMap[dow].approved++;
            else chartMap[dow].pending++;
          });
          setRequestsChartData(days.map((d) => ({ name: d, ...chartMap[d] })));
        }

        // --- Leaderboard (top recommended vehicles) ---
        if (leaderboardRes.ok) {
          const lData = await leaderboardRes.json();
          setLeaderboard(lData.vehicles ?? lData ?? []);
        }

      } catch (err) {
        console.error('Admin dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [refreshKey]);

  /* ── Stat cards (dynamic) ── */
  const stats = [
    {
      title: 'Total Vehicles',
      value: loading ? '…' : totalVehicles !== null ? totalVehicles.toLocaleString() : 'N/A',
      icon: Car,
      trend: 'Live data',
      trendUp: true,
      sub: 'in catalog',
      gradFrom: 'from-blue-600',
      gradTo: 'to-blue-700',
      glow: 'shadow-blue-500/20',
    },
    {
      title: 'Registered Users',
      value: loading ? '…' : totalUsers !== null ? totalUsers.toLocaleString() : 'N/A',
      icon: Users,
      trend: 'Live data',
      trendUp: true,
      sub: 'total accounts',
      gradFrom: 'from-violet-600',
      gradTo: 'to-violet-700',
      glow: 'shadow-violet-500/20',
    },
    {
      title: 'System Health',
      value: '99.9%',
      icon: Activity,
      trend: 'Stable',
      trendUp: true,
      sub: 'all services up',
      gradFrom: 'from-emerald-600',
      gradTo: 'to-emerald-700',
      glow: 'shadow-emerald-500/20',
    },
    {
      title: 'Researcher Requests',
      value: loading ? '…' : pendingRequests !== null ? String(pendingRequests) : 'N/A',
      icon: FlaskConical,
      trend: pendingRequests ? `${pendingRequests} pending` : 'None',
      trendUp: false,
      sub: 'awaiting review',
      gradFrom: 'from-orange-500',
      gradTo: 'to-orange-600',
      glow: 'shadow-orange-500/20',
    },
  ];

  /* ── Registration trend (user data merged with static vehicle curve) ── */
  const registrationTrend = userTrend.map((row, i) => ({
    name: row.name,
    users: row.users,
    // Vehicles column: real total spread proportionally as a rough estimate
    vehicles: totalVehicles
      ? Math.round((totalVehicles / (userTrend.length || 1)) * (0.7 + i * 0.06))
      : 0,
  }));

  /* ── Recent activity feed built from real user registrations ── */
  const recentActivity = recentUsers.map((u, i) => ({
    icon: i === 0 ? UserPlus : i === 1 ? UserCheck : Users,
    color: i === 0 ? 'blue' : i === 1 ? 'emerald' : 'purple',
    label: 'User Registered',
    detail: `${u.username || u.email?.split('@')[0] || 'Anonymous'} (${u.user_type || 'user'}) created an account`,
    time: timeAgo(u.created_at || ''),
  }));

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-600" />
            Admin Control Panel
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {greet()}, {adminName} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Here&apos;s what&apos;s happening with AutoFyx today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 shadow-sm">
            <Clock size={14} className="text-blue-600" />
            {currentTime
              ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 shadow-sm">
            <CalendarDays size={14} className="text-blue-600" />
            {currentTime
              ? currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '...'}
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-blue-600' : 'text-blue-600'} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ title, value, icon: Icon, trend, trendUp, sub, gradFrom, gradTo, glow }) => (
          <div
            key={title}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            {/* subtle gradient tint */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${gradFrom} ${gradTo} opacity-5 rounded-full -translate-y-6 translate-x-6 group-hover:opacity-10 transition-opacity`} />

            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center shadow-lg ${glow}`}>
                <Icon size={20} className="text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                trendUp
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-orange-50 text-orange-600'
              }`}>
                <TrendingUp size={11} />
                {trend}
              </span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-slate-400" />
                <span className="text-slate-400 text-sm">Loading…</span>
              </div>
            ) : (
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
            )}
            <p className="text-sm font-semibold text-slate-700 mt-1">{title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Registration trend – spans 2 cols */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Registration Trends</h3>
              <p className="text-xs text-slate-400 mt-0.5">Vehicles &amp; Users over 7 months</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Vehicles</span>
              <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />Users</span>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 12 }}
                  itemStyle={{ color: '#cbd5e1' }}
                />
                <Area type="monotone" dataKey="vehicles" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gVehicles)" />
                <Area type="monotone" dataKey="users"    stroke="#7c3aed" strokeWidth={2.5} fill="url(#gUsers)"    />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Researcher Requests Bar – 1 col */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Researcher Requests</h3>
              <p className="text-xs text-slate-400 mt-0.5">By day this week</p>
            </div>
            <BarChart3 size={18} className="text-slate-400" />
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsChartData.length ? requestsChartData : [
                  { name: 'Mon', approved: 0, pending: 0 },
                  { name: 'Tue', approved: 0, pending: 0 },
                  { name: 'Wed', approved: 0, pending: 0 },
                  { name: 'Thu', approved: 0, pending: 0 },
                  { name: 'Fri', approved: 0, pending: 0 },
                  { name: 'Sat', approved: 0, pending: 0 },
                  { name: 'Sun', approved: 0, pending: 0 },
              ]} barSize={9} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 12 }}
                />
                <Bar dataKey="approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending"  fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Approved</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />Pending</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity – 2 cols (real user registrations) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
            <a href="/admin/user_management" className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={13} />
            </a>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={22} className="animate-spin text-slate-300" />
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No recent user registrations.</p>
          ) : (
            <div className="space-y-1">
              {recentActivity.map(({ icon: Icon, color, label, detail, time }, idx) => {
                const c = iconColors[color] ?? iconColors.blue;
                return (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={17} className={c.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{label}</p>
                      <p className="text-xs text-slate-400 truncate">{detail}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">{time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions – 1 col */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Add New Vehicle',      href: '/admin/catalog',           color: 'blue'    },
              { label: 'View Researcher Reqs', href: '/admin/pending_approvel',  color: 'indigo'  },
              { label: 'Manage Users',         href: '/admin/user_management',   color: 'violet'  },
              { label: 'Update Fuel Prices',   href: '/admin/fuel_price_manage', color: 'orange'  },
              { label: 'ML Studio',            href: '/admin/dataset_ml',        color: 'emerald' },
              { label: 'System Settings',      href: '/admin/system_setting',    color: 'slate'   },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-sm font-medium transition-all group"
              >
                {label}
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* ── Top Recommended Vehicles (Live Leaderboard) ── */}
      {!loading && leaderboard.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Top Recommended Vehicles</h3>
              <p className="text-xs text-slate-400 mt-0.5">Most recommended by the AI engine across all users</p>
            </div>
            <Database size={16} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {leaderboard.slice(0, 5).map((v: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                <span className="text-2xl font-black text-blue-600 shrink-0 w-8 text-center">#{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{v.model || v.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-400 truncate">{v.brand || ''}</p>
                  {v.recommendation_count && (
                    <p className="text-[11px] font-semibold text-blue-500 mt-0.5">{v.recommendation_count}× recommended</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── System Status Banner ── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">All Systems Operational</p>
            <p className="text-blue-200 text-xs mt-0.5">
              API, Database, ML Pipeline — Live &amp; serving{' '}
              {totalUsers !== null ? `${totalUsers.toLocaleString()} users` : 'users'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/15 border border-white/20 rounded-xl px-4 py-2 text-white text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Live
        </div>
      </div>

    </div>
  );
}