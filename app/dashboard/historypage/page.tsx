'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Car, ArrowUpRight, Calendar, Fuel, Zap,
  Loader2, Star, TrendingUp, Search, ChevronDown, ChevronUp,
  BarChart2, Clock, Tag, RefreshCw, Package, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const L = {
  bg: '#F0F4FF', cardBg: '#FFFFFF', primary: '#155dfc', primaryText: '#FFFFFF',
  text: '#030304', muted: '#6B7280', border: '#DBEAFE',
  shadow: '0 4px 20px -2px rgba(21,93,252,0.06)',
  hoverShadow: '0 16px 32px -4px rgba(21,93,252,0.14)',
  iconBg: '#EFF6FF', pill: '#EFF6FF',
};
const D = {
  bg: '#030304', cardBg: '#0F111A', primary: '#155dfc', primaryText: '#FFFFFF',
  text: '#FFFFFF', muted: '#8B949E', border: 'rgba(21,93,252,0.2)',
  shadow: '0 4px 24px -4px rgba(0,0,0,0.5)',
  hoverShadow: '0 16px 32px -4px rgba(0,0,0,0.5), 0 0 20px rgba(21,93,252,0.12)',
  iconBg: 'rgba(21,93,252,0.08)', pill: 'rgba(21,93,252,0.08)',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function formatLKR(val?: number | string) {
  const n = typeof val === 'string' ? parseFloat(val) : (val ?? 0);
  if (!n) return 'N/A';
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(0)}K`;
  return `LKR ${n.toLocaleString()}`;
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return '1 day ago';
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 1209600) return '1 week ago';
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  if (diff < 5184000) return '1 month ago';
  return `${Math.floor(diff / 2592000)} months ago`;
}

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1503376713356-2dbfdfaa52a1?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=600&auto=format&fit=crop',
];

const FUEL_COLORS: Record<string, string> = {
  Hybrid: '#10b981', Electric: '#3b82f6', Petrol: '#f59e0b',
  Diesel: '#6b7280', Premium: '#8b5cf6',
};

/* ── Vehicle mini-card inside an expanded session ── */
function VehicleMiniCard({
  vehicle, index, isDarkMode, P, vehicleImages,
}: {
  vehicle: any; index: number; isDarkMode: boolean; P: typeof L;
  vehicleImages: Record<number, string>;
}) {
  const score    = Number(vehicle.score ?? 0);
  const fuelColor = FUEL_COLORS[vehicle.fuel_type] ?? '#6b7280';
  const imgSrc   = vehicleImages[vehicle.vehicle_id] || FALLBACK_IMGS[index % FALLBACK_IMGS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex flex-col overflow-hidden group"
      style={{ background: P.cardBg, borderRadius: '20px', border: `1px solid ${P.border}`, boxShadow: P.shadow }}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden" style={{ borderRadius: '20px 20px 0 0' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />
        <img
          src={imgSrc}
          alt={vehicle.model}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMGS[index % FALLBACK_IMGS.length]; }}
        />
        {score > 0 && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(21,93,252,0.85)' }}>
            <TrendingUp className="w-3 h-3 text-white" />
            <span className="text-[10px] font-black text-white">{score.toFixed(1)}%</span>
          </div>
        )}
        {vehicle.fuel_type && (
          <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-full backdrop-blur-md"
            style={{ background: `${fuelColor}cc` }}>
            <span className="text-[10px] font-bold text-white">{vehicle.fuel_type}</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 z-20">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">{vehicle.brand}</p>
          <h4 className="text-sm font-extrabold text-white leading-tight line-clamp-1">
            {vehicle.model || 'Unknown Model'}
          </h4>
        </div>
        {vehicle.year && (
          <div className="absolute bottom-3 right-3 z-20 px-2 py-0.5 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <span className="text-[10px] font-bold text-white">{vehicle.year}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        {score > 0 && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: P.muted }}>AI Score</span>
              <span className="text-[11px] font-extrabold" style={{ color: P.primary }}>{score.toFixed(1)}%</span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: P.border }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${Math.min(score, 100)}%` }}
                transition={{ duration: 0.6, delay: index * 0.04 + 0.2 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${P.primary}, #60a5fa)` }}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: Tag, label: formatLKR(vehicle.min_price) },
            { icon: Car, label: vehicle.vehicle_class || 'N/A' },
          ].map((s, j) => (
            <div key={j} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
              style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFF' }}>
              <s.icon className="w-3 h-3 shrink-0" style={{ color: P.primary }} />
              <span className="text-[11px] font-semibold truncate" style={{ color: P.muted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Session card (collapsible) ── */
function SessionCard({
  session, sessionIndex, isDarkMode, P, vehicleImages, fetchImages,
}: {
  session: any; sessionIndex: number; isDarkMode: boolean; P: typeof L;
  vehicleImages: Record<number, string>;
  fetchImages: (vehicles: any[]) => void;
}) {
  const [open, setOpen] = useState(sessionIndex === 0); // first session open by default

  const toggle = () => {
    if (!open) fetchImages(session.vehicles || []);
    setOpen(v => !v);
  };

  const topScore = session.vehicles?.length > 0
    ? Math.max(...session.vehicles.map((v: any) => Number(v.score ?? 0)))
    : 0;

  const brands = [...new Set((session.vehicles || []).map((v: any) => v.brand).filter(Boolean))].slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: sessionIndex * 0.06 }}
      className="overflow-hidden transition-all duration-300"
      style={{ background: P.cardBg, borderRadius: '24px', border: `1px solid ${P.border}`, boxShadow: P.shadow }}
    >
      {/* Session header — always visible */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200"
        style={{ background: open ? (isDarkMode ? 'rgba(21,93,252,0.06)' : '#F5F8FF') : 'transparent' }}
      >
        <div className="flex items-center gap-4">
          {/* Session icon */}
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${P.primary}22, ${P.primary}44)`, border: `1px solid ${P.border}` }}>
            <Sparkles className="w-5 h-5" style={{ color: P.primary }} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold" style={{ color: P.text }}>
                Session #{sessionIndex + 1}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: `${P.primary}18`, color: P.primary }}>
                {session.vehicle_count} vehicles
              </span>
              {topScore > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: isDarkMode ? 'rgba(16,185,129,0.12)' : '#ECFDF5', color: '#10b981' }}>
                  Top {topScore.toFixed(1)}% match
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" style={{ color: P.muted }} />
                <span className="text-[12px] font-medium" style={{ color: P.muted }}>
                  {timeAgo(session.saved_at)}
                </span>
              </div>
              <span className="text-[12px]" style={{ color: P.muted }}>·</span>
              <span className="text-[12px] font-medium" style={{ color: P.muted }}>
                {new Date(session.saved_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {brands.length > 0 && (
                <>
                  <span className="text-[12px]" style={{ color: P.muted }}>·</span>
                  <span className="text-[12px] font-semibold" style={{ color: P.muted }}>
                    {brands.join(', ')}{session.vehicles?.length > 3 ? ' & more' : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-3">
          <Link
            href="/dashboard/recomendation"
            onClick={e => e.stopPropagation()}
            className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
            style={{ background: `${P.primary}15`, color: P.primary }}
          >
            Run Again <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: P.iconBg }}>
            {open
              ? <ChevronUp className="w-4 h-4" style={{ color: P.primary }} />
              : <ChevronDown className="w-4 h-4" style={{ color: P.muted }} />}
          </div>
        </div>
      </button>

      {/* Expandable vehicle grid */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2">
              <div className="w-full h-px mb-5" style={{ background: P.border }} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {(session.vehicles || []).map((vehicle: any, i: number) => (
                  <VehicleMiniCard
                    key={vehicle.vehicle_id || i}
                    vehicle={vehicle}
                    index={i}
                    isDarkMode={isDarkMode}
                    P={P}
                    vehicleImages={vehicleImages}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main History Page ── */
export default function HistoryPage() {
  const [isDarkMode, setIsDarkMode]     = useState(false);
  const [sessions, setSessions]         = useState<any[]>([]);
  const [vehicleImages, setVehicleImages] = useState<Record<number, string>>({});
  const [loading, setLoading]           = useState(true);
  const [searchQ, setSearchQ]           = useState('');
  const [refreshKey, setRefreshKey]     = useState(0);

  // Theme sync
  useEffect(() => {
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    if (stored) setIsDarkMode(true);
    const handler = (e: any) => setIsDarkMode(e.detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  // Fetch sessions
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const raw = localStorage.getItem('user_data');
        if (!raw) return;
        const { user_id } = JSON.parse(raw);
        if (!user_id) return;
        const res = await axios.get(`${API_BASE}/recommendations/history/${user_id}`);
        const fetchedSessions: any[] = res.data.sessions || [];
        setSessions(fetchedSessions);

        // Pre-fetch images for the first session (visible by default)
        if (fetchedSessions.length > 0) {
          fetchImagesForVehicles(fetchedSessions[0].vehicles || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  const fetchImagesForVehicles = (vehicles: any[]) => {
    vehicles.forEach((v: any) => {
      const vid = v.vehicle_id;
      if (!vid || vehicleImages[vid]) return;
      fetch(`${API_BASE}/vehicles/${vid}`)
        .then(r => r.json())
        .then(detail => {
          if (detail?.image_url) {
            setVehicleImages(prev => ({ ...prev, [vid]: detail.image_url }));
          }
        })
        .catch(() => {});
    });
  };

  const P = isDarkMode ? D : L;

  // Stats
  const stats = useMemo(() => {
    const totalVehicles = sessions.reduce((s, sess) => s + (sess.vehicle_count || 0), 0);
    const allScores = sessions.flatMap((s: any) =>
      (s.vehicles || []).map((v: any) => Number(v.score ?? 0)).filter((n: number) => n > 0)
    );
    const avgScore = allScores.length
      ? (allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length).toFixed(1)
      : '—';
    const brandCounts: Record<string, number> = {};
    sessions.flatMap((s: any) => s.vehicles || []).forEach((v: any) => {
      if (v.brand) brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1;
    });
    const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
    return { totalSessions: sessions.length, totalVehicles, avgScore, topBrand };
  }, [sessions]);

  // Filter sessions by search query (checks any vehicle brand/model inside)
  const filteredSessions = useMemo(() => {
    if (!searchQ.trim()) return sessions;
    const q = searchQ.toLowerCase();
    return sessions.filter(sess =>
      (sess.vehicles || []).some((v: any) =>
        v.model?.toLowerCase().includes(q) ||
        v.brand?.toLowerCase().includes(q) ||
        v.vehicle_class?.toLowerCase().includes(q)
      )
    );
  }, [sessions, searchQ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-full pb-16 transition-colors duration-500"
    >
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${P.primary}22, ${P.primary}44)`, border: `1px solid ${P.border}` }}>
                <History className="w-5 h-5" style={{ color: P.primary }} />
              </div>
              <div>
                <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight" style={{ color: P.text }}>
                  Recommendation <span style={{ color: P.primary }}>History</span>
                </h1>
                <p className="text-sm font-medium" style={{ color: P.muted }}>
                  Each session shows all vehicles from one recommendation run
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 shrink-0"
            style={{ background: P.iconBg, color: P.text, border: `1px solid ${P.border}` }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: P.primary }} />
            Refresh
          </button>
        </div>

        {/* Stats bar */}
        {!loading && sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          >
            {[
              { label: 'Total Sessions',  value: stats.totalSessions,  icon: Package,  color: '#155dfc' },
              { label: 'Total Vehicles',  value: stats.totalVehicles,  icon: Car,      color: '#8b5cf6' },
              { label: 'Avg AI Score',    value: `${stats.avgScore}%`, icon: BarChart2, color: '#10b981' },
              { label: 'Top Brand',       value: stats.topBrand,       icon: Star,     color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all"
                style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}18` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest truncate" style={{ color: P.muted }}>{s.label}</p>
                  <p className="text-xl font-extrabold truncate" style={{ color: P.text }}>{s.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Search */}
        {!loading && sessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl max-w-md"
              style={{ background: P.cardBg, border: `1px solid ${P.border}` }}>
              <Search className="w-4 h-4 shrink-0" style={{ color: P.muted }} />
              <input
                type="text"
                placeholder="Search vehicles by model, brand…"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none flex-1 placeholder:font-medium"
                style={{ color: P.text }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-5">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: P.primary }} />
            <p className="text-sm font-semibold" style={{ color: P.muted }}>Loading your sessions…</p>
          </motion.div>
        ) : sessions.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center rounded-[32px] gap-5"
            style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: P.iconBg }}>
              <History className="w-9 h-9" style={{ color: P.primary }} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold mb-2" style={{ color: P.text }}>No History Yet</h3>
              <p className="text-sm max-w-sm" style={{ color: P.muted }}>
                You haven&apos;t generated any recommendations. Each run will be saved as a separate session here.
              </p>
            </div>
            <Link href="/dashboard/recomendation"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: P.primary, color: '#fff' }}>
              <Zap className="w-4 h-4" /> Get Recommendations
            </Link>
          </motion.div>
        ) : filteredSessions.length === 0 ? (
          <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center rounded-[32px] gap-4"
            style={{ background: P.cardBg, border: `1px solid ${P.border}` }}>
            <Search className="w-10 h-10 opacity-40" style={{ color: P.muted }} />
            <p className="text-base font-bold" style={{ color: P.text }}>No sessions matched your search</p>
            <button onClick={() => setSearchQ('')} className="text-sm font-bold" style={{ color: P.primary }}>
              Clear search
            </button>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {filteredSessions.map((session, i) => (
              <SessionCard
                key={session.session_id || i}
                session={session}
                sessionIndex={i}
                isDarkMode={isDarkMode}
                P={P}
                vehicleImages={vehicleImages}
                fetchImages={fetchImagesForVehicles}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer count */}
      {!loading && filteredSessions.length > 0 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center text-sm font-medium mt-10" style={{ color: P.muted }}>
          Showing <span style={{ color: P.primary, fontWeight: 700 }}>{filteredSessions.length}</span> of{' '}
          <span style={{ color: P.text, fontWeight: 700 }}>{sessions.length}</span> sessions
          {' · '}<span style={{ color: P.text, fontWeight: 700 }}>{stats.totalVehicles}</span> total vehicles
        </motion.p>
      )}
    </motion.div>
  );
}
