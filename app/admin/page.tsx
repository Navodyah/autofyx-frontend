'use client';

import { useState, useEffect } from 'react';
import {
  Car, Users, Activity, ShieldCheck, TrendingUp, ArrowUpRight,
  FlaskConical, MessageSquare, Database, Clock, CalendarDays,
  BarChart3, Zap, Globe,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { parseBrowserAuthToken } from '@/lib/auth-token';

/* ── Mock data ─────────────────────────────────── */
const registrationTrend = [
  { name: 'Jan', vehicles: 40, users: 120 },
  { name: 'Feb', vehicles: 52, users: 145 },
  { name: 'Mar', vehicles: 68, users: 178 },
  { name: 'Apr', vehicles: 90, users: 210 },
  { name: 'May', vehicles: 75, users: 195 },
  { name: 'Jun', vehicles: 115, users: 260 },
  { name: 'Jul', vehicles: 132, users: 298 },
];

const requestsData = [
  { name: 'Mon', approved: 4, pending: 2 },
  { name: 'Tue', approved: 6, pending: 1 },
  { name: 'Wed', approved: 3, pending: 5 },
  { name: 'Thu', approved: 8, pending: 3 },
  { name: 'Fri', approved: 5, pending: 2 },
  { name: 'Sat', approved: 2, pending: 1 },
  { name: 'Sun', approved: 7, pending: 4 },
];

const recentActivity = [
  { icon: Car, color: 'blue', label: 'New Vehicle Added', detail: 'Toyota Axio 2018 added to catalog', time: '2m ago' },
  { icon: Users, color: 'purple', label: 'User Registered', detail: 'Kasun Perera created an account', time: '18m ago' },
  { icon: FlaskConical, color: 'indigo', label: 'Researcher Request', detail: 'Amara Silva requested researcher role', time: '1h ago' },
  { icon: Database, color: 'emerald', label: 'Catalog Updated', detail: '12 engine types synced successfully', time: '3h ago' },
  { icon: MessageSquare, color: 'orange', label: 'New Feedback', detail: 'User left a 5-star rating', time: '5h ago' },
];

const iconColors: Record<string, { bg: string; text: string }> = {
  blue:    { bg: 'bg-blue-500/15',   text: 'text-blue-400'   },
  purple:  { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  indigo:  { bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
  emerald: { bg: 'bg-emerald-500/15',text: 'text-emerald-400'},
  orange:  { bg: 'bg-orange-500/15', text: 'text-orange-400' },
};

/* ── Stat cards config ─────────────────────────── */
const stats = [
  {
    title: 'Total Vehicles',
    value: '1,245',
    icon: Car,
    trend: '+12%',
    trendUp: true,
    color: 'blue',
    sub: 'vs last month',
    gradFrom: 'from-blue-600',
    gradTo: 'to-blue-700',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'Active Users',
    value: '8,540',
    icon: Users,
    trend: '+5%',
    trendUp: true,
    color: 'violet',
    sub: 'vs last week',
    gradFrom: 'from-violet-600',
    gradTo: 'to-violet-700',
    glow: 'shadow-violet-500/20',
  },
  {
    title: 'System Health',
    value: '98.5%',
    icon: Activity,
    trend: 'Stable',
    trendUp: true,
    color: 'emerald',
    sub: 'all services up',
    gradFrom: 'from-emerald-600',
    gradTo: 'to-emerald-700',
    glow: 'shadow-emerald-500/20',
  },
  {
    title: 'Researcher Requests',
    value: '7',
    icon: FlaskConical,
    trend: '+3',
    trendUp: false,
    color: 'orange',
    sub: 'awaiting review',
    gradFrom: 'from-orange-500',
    gradTo: 'to-orange-600',
    glow: 'shadow-orange-500/20',
  },
];

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

/* ── Component ──────────────────────────────────── */
export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('Admin');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setAdminName(readAdminName());
    setCurrentTime(new Date());
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
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
              <p className="text-xs text-slate-400 mt-0.5">Vehicles & Users over 7 months</p>
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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
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
                <Area type="monotone" dataKey="users" stroke="#7c3aed" strokeWidth={2.5} fill="url(#gUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Researcher Requests Bar – 1 col */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Researcher Requests</h3>
              <p className="text-xs text-slate-400 mt-0.5">This week</p>
            </div>
            <BarChart3 size={18} className="text-slate-400" />
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsData} barSize={9} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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

        {/* Recent Activity – 2 cols */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
            <button className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="space-y-1">
            {recentActivity.map(({ icon: Icon, color, label, detail, time }) => {
              const c = iconColors[color] ?? iconColors.blue;
              return (
                <div key={label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
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
        </div>

        {/* Quick Actions – 1 col */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            Quick Actions
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'Add New Vehicle',       href: '/admin/catalog/vehicles',         color: 'blue'   },
              { label: 'View Researcher Reqs',  href: '/admin/pending_approvel',          color: 'indigo' },
              { label: 'Manage Users',          href: '/admin/user_management',           color: 'violet' },
              { label: 'Update Fuel Prices',    href: '/admin/fuel_price_manage',         color: 'orange' },
              { label: 'ML Studio',             href: '/admin/dataset_ml',               color: 'emerald'},
              { label: 'System Settings',       href: '/admin/system_setting',            color: 'slate'  },
            ].map(({ label, href, color }) => (
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

      {/* ── System Status Banner ── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">All Systems Operational</p>
            <p className="text-blue-200 text-xs mt-0.5">API, Database, ML Pipeline — 99.9% uptime this month</p>
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