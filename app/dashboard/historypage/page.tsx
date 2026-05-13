'use client';

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History, Car, ArrowUpRight, Calendar, Fuel, Zap,
  Loader2, Star, TrendingUp, Search, Filter, ChevronDown,
  BarChart2, Clock, Tag, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

// ─── Palettes ─────────────────────────────────────────────────────
const L = {
  bg: "#F0F4FF",
  cardBg: "#FFFFFF",
  primary: "#155dfc",
  primaryText: "#FFFFFF",
  text: "#030304",
  muted: "#6B7280",
  border: "#DBEAFE",
  glow: "rgba(21,93,252,0.15)",
  shadow: "0 4px 20px -2px rgba(21,93,252,0.06)",
  hoverShadow: "0 16px 32px -4px rgba(21,93,252,0.14), 0 0 0 1px rgba(21,93,252,0.08)",
  iconBg: "#EFF6FF",
  pill: "#EFF6FF",
};

const D = {
  bg: "#030304",
  cardBg: "#0F111A",
  primary: "#155dfc",
  primaryText: "#FFFFFF",
  text: "#FFFFFF",
  muted: "#8B949E",
  border: "rgba(21,93,252,0.2)",
  glow: "rgba(21,93,252,0.25)",
  shadow: "0 4px 24px -4px rgba(0,0,0,0.5)",
  hoverShadow: "0 16px 32px -4px rgba(0,0,0,0.5), 0 0 20px rgba(21,93,252,0.12)",
  iconBg: "rgba(21,93,252,0.08)",
  pill: "rgba(21,93,252,0.08)",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ─── Helpers ──────────────────────────────────────────────────────
function formatLKR(val?: number | string) {
  const n = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  if (!n) return "N/A";
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(0)}K`;
  return `LKR ${n.toLocaleString()}`;
}

function formatPriceRange(min?: number, max?: number) {
  if (min && max) return `${formatLKR(min)} – ${formatLKR(max)}`;
  if (min) return formatLKR(min);
  if (max) return formatLKR(max);
  return "Price N/A";
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const FUEL_COLORS: Record<string, string> = {
  Hybrid: "#10b981",
  Electric: "#3b82f6",
  Petrol: "#f59e0b",
  Diesel: "#6b7280",
  Premium: "#8b5cf6",
};

const CAR_IMAGES = [
  "https://images.unsplash.com/photo-1503376713356-2dbfdfaa52a1?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=900&auto=format&fit=crop",
];

// ─── Main Page ────────────────────────────────────────────────────
export default function HistoryPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [fuelFilter, setFuelFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "score" | "price">("newest");
  const [refreshKey, setRefreshKey] = useState(0);

  // Theme sync
  useEffect(() => {
    const stored = localStorage.getItem("autofyx_theme") === "dark";
    if (stored) setIsDarkMode(true);
    const handler = (e: any) => setIsDarkMode(e.detail);
    window.addEventListener("themeSync", handler);
    return () => window.removeEventListener("themeSync", handler);
  }, []);

  // Fetch history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const raw = localStorage.getItem("user_data");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.user_id) {
            const res = await axios.get(`${API_BASE}/recommendations/history/${parsed.user_id}`);
            setHistory(res.data.vehicles || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [refreshKey]);

  const P = isDarkMode ? D : L;

  // Unique fuel types for filter
  const fuelTypes = useMemo(() => {
    const types = new Set(history.map((v) => v.fuel_type).filter(Boolean));
    return ["All", ...Array.from(types)];
  }, [history]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...history];
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (v) =>
          v.model?.toLowerCase().includes(q) ||
          v.brand?.toLowerCase().includes(q) ||
          v.vehicle_class?.toLowerCase().includes(q)
      );
    }
    if (fuelFilter !== "All") {
      list = list.filter((v) => v.fuel_type === fuelFilter);
    }
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.recommended_at).getTime() - new Date(a.recommended_at).getTime());
    } else if (sortBy === "score") {
      list.sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0));
    } else if (sortBy === "price") {
      list.sort((a, b) => Number(a.min_price ?? a.max_price ?? 0) - Number(b.min_price ?? b.max_price ?? 0));
    }
    return list;
  }, [history, searchQ, fuelFilter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: history.length,
    avgScore: history.length
      ? (history.reduce((s, v) => s + Number(v.score ?? 0), 0) / history.length).toFixed(1)
      : "—",
    topBrand: (() => {
      const counts: Record<string, number> = {};
      history.forEach((v) => { if (v.brand) counts[v.brand] = (counts[v.brand] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    })(),
  }), [history]);

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
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${P.primary}22, ${P.primary}44)`, border: `1px solid ${P.border}` }}
              >
                <History className="w-5 h-5" style={{ color: P.primary }} />
              </div>
              <div>
                <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight" style={{ color: P.text }}>
                  Recommendation <span style={{ color: P.primary }}>History</span>
                </h1>
                <p className="text-sm font-medium" style={{ color: P.muted }}>
                  All your past AI-generated vehicle recommendations
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 shrink-0"
            style={{ background: P.iconBg, color: P.text, border: `1px solid ${P.border}` }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} style={{ color: P.primary }} />
            Refresh
          </button>
        </div>

        {/* Stats bar */}
        {!loading && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          >
            {[
              { label: "Total Saved",   value: stats.total,    icon: History,    color: "#155dfc" },
              { label: "Avg AI Score",  value: `${stats.avgScore}%`, icon: BarChart2, color: "#10b981" },
              { label: "Top Brand",     value: stats.topBrand, icon: Star,        color: "#f59e0b" },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all"
                style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}18` }}
                >
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

        {/* Filters */}
        {!loading && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-3"
          >
            {/* Search */}
            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl flex-1 min-w-[200px]"
              style={{ background: P.cardBg, border: `1px solid ${P.border}` }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: P.muted }} />
              <input
                type="text"
                placeholder="Search by model, brand…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none flex-1 placeholder:font-medium"
                style={{ color: P.text }}
              />
            </div>

            {/* Fuel filter pills */}
            <div className="flex gap-2 flex-wrap">
              {fuelTypes.map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFuelFilter(ft)}
                  className="px-3 py-2 rounded-xl text-[12px] font-bold transition-all"
                  style={{
                    background: fuelFilter === ft ? P.primary : P.pill,
                    color: fuelFilter === ft ? "#fff" : P.muted,
                    border: `1px solid ${fuelFilter === ft ? P.primary : P.border}`,
                  }}
                >
                  {ft}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              {(["newest", "score", "price"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className="px-3 py-2 rounded-xl text-[12px] font-bold capitalize transition-all"
                  style={{
                    background: sortBy === opt ? P.primary : P.pill,
                    color: sortBy === opt ? "#fff" : P.muted,
                    border: `1px solid ${sortBy === opt ? P.primary : P.border}`,
                  }}
                >
                  {opt === "newest" ? "Latest" : opt === "score" ? "Best Match" : "Price ↑"}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-5"
          >
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: P.primary }} />
            <p className="text-sm font-semibold" style={{ color: P.muted }}>Loading your history…</p>
          </motion.div>
        ) : history.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center rounded-[32px] gap-5"
            style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: P.iconBg }}
            >
              <History className="w-9 h-9" style={{ color: P.primary }} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold mb-2" style={{ color: P.text }}>No History Yet</h3>
              <p className="text-sm max-w-sm" style={{ color: P.muted }}>
                You haven&apos;t generated any vehicle recommendations. Head to the Recommendation module to get started.
              </p>
            </div>
            <Link
              href="/dashboard/recomendation"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105 hover:shadow-lg"
              style={{ background: P.primary, color: "#fff" }}
            >
              <Zap className="w-4 h-4" /> Get Recommendations
            </Link>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center rounded-[32px] gap-4"
            style={{ background: P.cardBg, border: `1px solid ${P.border}` }}
          >
            <Search className="w-10 h-10 opacity-40" style={{ color: P.muted }} />
            <p className="text-base font-bold" style={{ color: P.text }}>No results found</p>
            <p className="text-sm" style={{ color: P.muted }}>Try adjusting your search or filters.</p>
            <button onClick={() => { setSearchQ(""); setFuelFilter("All"); }} className="text-sm font-bold" style={{ color: P.primary }}>
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((vehicle, i) => {
              const fuelColor = FUEL_COLORS[vehicle.fuel_type] ?? "#6b7280";
              const score = Number(vehicle.score ?? 0);
              const imgSrc = CAR_IMAGES[i % CAR_IMAGES.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.5) }}
                  whileHover={{ y: -5, boxShadow: P.hoverShadow }}
                  className="flex flex-col overflow-hidden group cursor-pointer transition-all duration-300"
                  style={{
                    background: P.cardBg,
                    borderRadius: "28px",
                    border: `1px solid ${P.border}`,
                    boxShadow: P.shadow,
                  }}
                >
                  {/* Image area */}
                  <div className="relative h-44 overflow-hidden" style={{ borderRadius: "28px 28px 0 0" }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                    <img
                      src={imgSrc}
                      alt={vehicle.model}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Score badge */}
                    {score > 0 && (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15"
                        style={{ background: "rgba(21,93,252,0.85)" }}>
                        <TrendingUp className="w-3 h-3 text-white" />
                        <span className="text-[11px] font-black text-white">{score.toFixed(1)}% Match</span>
                      </div>
                    )}

                    {/* Fuel type badge */}
                    <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/15"
                      style={{ background: `${fuelColor}cc` }}>
                      <span className="text-[11px] font-bold text-white">{vehicle.fuel_type || "N/A"}</span>
                    </div>

                    {/* Brand + model on image */}
                    <div className="absolute bottom-4 left-4 z-20">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-0.5">{vehicle.brand}</p>
                      <h3 className="text-lg font-extrabold text-white leading-tight line-clamp-1">
                        {vehicle.model || "Unknown Model"}
                      </h3>
                    </div>

                    {/* Year pill */}
                    {vehicle.year && (
                      <div className="absolute bottom-4 right-4 z-20 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/15"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <span className="text-[11px] font-bold text-white">{vehicle.year}</span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex-1 flex flex-col">

                    {/* Score bar */}
                    {score > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: P.muted }}>AI Match Score</span>
                          <span className="text-[12px] font-extrabold" style={{ color: P.primary }}>{score.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: P.border }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(score, 100)}%` }}
                            transition={{ delay: i * 0.06 + 0.3, duration: 0.7, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${P.primary}, #60a5fa)` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Specs grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { icon: Car, label: vehicle.vehicle_class || "N/A" },
                        { icon: Fuel, label: vehicle.fuel_type || "N/A" },
                        { icon: Tag, label: formatPriceRange(vehicle.min_price, vehicle.max_price) },
                        { icon: Clock, label: timeAgo(vehicle.recommended_at) },
                      ].map((spec, j) => (
                        <div key={j}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl"
                          style={{ background: isDarkMode ? "rgba(255,255,255,0.03)" : "#F8FAFF" }}
                        >
                          <spec.icon className="w-3.5 h-3.5 shrink-0" style={{ color: P.primary }} />
                          <span className="text-[12px] font-semibold truncate" style={{ color: P.muted }}>{spec.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t flex items-center justify-between" style={{ borderColor: P.border }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" style={{ color: P.muted }} />
                        <span className="text-[11px] font-semibold" style={{ color: P.muted }}>
                          {new Date(vehicle.recommended_at).toLocaleDateString(undefined, {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <Link
                        href="/dashboard/recomendation"
                        className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
                        style={{ background: `${P.primary}15`, color: P.primary }}
                      >
                        Recommend Again <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {!loading && filtered.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm font-medium mt-10"
          style={{ color: P.muted }}
        >
          Showing <span style={{ color: P.primary, fontWeight: 700 }}>{filtered.length}</span> of{" "}
          <span style={{ color: P.text, fontWeight: 700 }}>{history.length}</span> saved recommendations
        </motion.p>
      )}
    </motion.div>
  );
}
