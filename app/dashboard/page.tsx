'use client';

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowUpRight, BatteryCharging, CarFront, Gauge, ShieldCheck,
  Sparkles, TrendingDown, TrendingUp, Trophy, Activity, History,
  ChevronRight, LineChart, SearchCheck, Scale, DollarSign,
  Calculator, User, Heart, ArrowRight, Bell, Sun, Moon,
  FlaskConical, ExternalLink, Loader2
} from "lucide-react";
import { applyForResearcher, persistBrowserAuthSession } from "@/lib/appwrite";
import { createBrowserAuthToken, parseBrowserAuthToken } from "@/lib/auth-token";
import { ResearcherApplicationModal } from "@/components/ResearcherApplicationModal";

// --- Palettes ---

// Light Palette
const L = {
  bg: "#F0F4FF",
  cardBg: "#FFFFFF",
  primary: "#155dfc",
  primaryText: "#FFFFFF",
  text: "#030304",
  muted: "#6B7280",
  border: "#DBEAFE",
  glow: "rgba(21,93,252,0.15)",
  shadow: "0 4px 20px -2px rgba(21, 93, 252, 0.06), 0 0 3px rgba(21,93,252,0.04)",
  hoverShadow: "0 12px 24px -4px rgba(21,93,252,0.12)",
  iconBg: "#EFF6FF"
};

// Dark Palette (Deep Black + Blue Accent)
const D = {
  bg: "#030304",
  cardBg: "#0F111A",
  primary: "#155dfc",
  primaryText: "#FFFFFF",
  text: "#FFFFFF",
  muted: "#8B949E",
  border: "rgba(21, 93, 252, 0.2)",
  glow: "rgba(21, 93, 252, 0.25)",
  shadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
  hoverShadow: "0 12px 30px -4px rgba(0,0,0,0.5), 0 0 25px rgba(21,93,252,0.12)",
  iconBg: "rgba(21,93,252,0.08)"
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
};

const floatAnimation = {
  y: [-3, 3, -3],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const }
};

function DashboardOverview() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'researcher'>('user');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyVehicles, setHistoryVehicles] = useState<any[]>([]);
  const [fuelPrices, setFuelPrices] = useState<{ fuel_type_name: string; fuel_price: number }[]>([]);
  const P = isDarkMode ? D : L;

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.username) setUserName(parsed.username);
        if (parsed.email) setUserEmail(parsed.email);
        if (parsed.user_type) setUserRole(parsed.user_type as 'user' | 'researcher');

        // Fetch history
        if (parsed.user_id) {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
          fetch(`${API_BASE}/recommendations/history/${parsed.user_id}`)
            .then(r => r.json())
            .then(data => setHistoryVehicles(data.vehicles || []))
            .catch(() => { });
        }
      }

      // Fetch fuel prices (independent of user_id)
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      fetch(`${API_BASE}/fuel_types/`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setFuelPrices(data) : [])
        .catch(() => { });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    if (stored) setIsDarkMode(true);
    const handler = (e: any) => setIsDarkMode(e.detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  // First name only for the greeting
  const firstName = userName ? userName.split(' ')[0] : 'â€¦';


  const modules = [
    { title: "Recommendation", href: "/dashboard/recomendation", desc: "AI-ranked picks", icon: LineChart },
    { title: "Vehicle Search", href: "/dashboard/search", desc: "Manual filtering", icon: SearchCheck },
    { title: "Compare", href: "/dashboard/compare", desc: "Side-by-side specs", icon: Scale },
    { title: "Cost Calc", href: "/dashboard/cost-calculation", desc: "EMI & ownership", icon: Calculator },
    { title: "Profile", href: "/dashboard/profile", desc: "Your preferences", icon: User },
    { title: "My Garage", href: "/dashboard/garage", desc: "Saved & wishlist", icon: Heart },
  ];

  const stats = [
    { label: "Analyzed Models", value: "854", sub: "+12 this week", icon: CarFront },
    { label: "Saved Matches", value: "3", sub: "1 high confidence", icon: Trophy },
    { label: "Market Trend", value: "âˆ’2.4%", sub: "Prices dropping", icon: TrendingDown },
    { label: "Active Alerts", value: "2", sub: "Price drop found", icon: Bell },
  ];

  const premiumCard = {
    background: P.cardBg,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: P.border,
    boxShadow: P.shadow,
    borderRadius: "24px",
    transition: 'background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease'
  } as React.CSSProperties;

  const premiumIcon = {
    background: P.iconBg,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: P.border,
    borderRadius: "50%",
    transition: 'background-color 0.4s ease, border-color 0.4s ease'
  } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-full pb-12 pt-4 sm:pt-6 px-3 sm:px-4 xl:px-6 relative overflow-hidden transition-colors duration-500"
      style={{
        background: P.bg,
        borderRadius: "32px",
        margin: "1px",
        minHeight: "calc(100vh - 100px)", // Ensures bottom curves are visible
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 relative z-10 max-w-7xl mx-auto"
      >
        {/* â”€â”€ Header Area â”€â”€ */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-colors duration-500"
              style={{ background: isDarkMode ? "rgba(21,93,252,0.08)" : "#FFFFFF", borderWidth: "1px", borderStyle: "solid", borderColor: P.border }}
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: isDarkMode ? "#93c5fd" : "#155dfc" }}>
                System Analysis Active
              </span>
            </motion.div>

            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight transition-colors duration-500" style={{ color: P.text }}>
              Welcome back, <span style={{ color: isDarkMode ? "#93c5fd" : "#155dfc" }}>{firstName}</span>
            </h1>
            <p className="text-sm font-medium transition-colors duration-500" style={{ color: P.muted }}>Your curated market insights and vehicle intelligence hub.</p>
          </div>

          <div className="flex gap-3 shrink-0 flex-wrap items-center">
            {/* Researcher Dashboard button â€” only for researchers */}
            {userRole === 'researcher' && (
              <Link
                href="/researcher"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hidden sm:flex"
                style={{ background: isDarkMode ? "rgba(21,93,252,0.12)" : "#EFF6FF", borderWidth: "1px", borderStyle: "solid", borderColor: isDarkMode ? "rgba(21,93,252,0.3)" : "#BFDBFE", color: isDarkMode ? "#93c5fd" : "#1d4ed8" }}
              >
                <FlaskConical className="w-4 h-4" />
                Researcher Dashboard
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </Link>
            )}

            {/* Apply for Researcher button â€” only for plain users */}
            {userRole === 'user' && (
              <motion.button
                onClick={() => {
                  setIsModalOpen(true);
                  setApplyMsg(null);
                }}
                whileHover={{ scale: isApplying ? 1 : 1.02 }}
                whileTap={{ scale: isApplying ? 1 : 0.98 }}
                disabled={isApplying}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hidden sm:flex"
                style={{ background: isDarkMode ? "rgba(21,93,252,0.05)" : "#FFFFFF", borderWidth: "1px", borderStyle: "solid", borderColor: P.border, color: P.text, opacity: isApplying ? 0.6 : 1 }}
              >
                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                Apply for Researcher
              </motion.button>
            )}

            <Link href="/dashboard/historypage" className="hidden sm:flex">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? "rgba(21,93,252,0.12)" : "#EFF6FF" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-500"
                style={{ background: isDarkMode ? "transparent" : "#FFFFFF", borderWidth: "1px", borderStyle: "solid", borderColor: P.border, color: P.text }}
              >
                <History className="w-4 h-4" /> History
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: `0 0 15px ${P.glow}` }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all duration-500 group"
              style={{ background: P.primary, color: P.primaryText }}
            >
              <Sparkles className="w-4 h-4" style={{ color: isDarkMode ? "#000" : "#FFF" }} />
              Update Preferences
            </motion.button>
          </div>
        </motion.div>

        {/* Apply-for-researcher status message */}
        <AnimatePresence>
          {applyMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: applyMsg.startsWith('🎉') ? (isDarkMode ? "rgba(21,93,252,0.12)" : "#EFF6FF") : "rgba(239,68,68,0.1)",
                borderWidth: "1px", borderStyle: "solid",
                borderColor: applyMsg.startsWith('🎉') ? (isDarkMode ? "rgba(21,93,252,0.3)" : "#BFDBFE") : "rgba(239,68,68,0.3)",
                color: applyMsg.startsWith('🎉') ? (isDarkMode ? "#93c5fd" : "#155dfc") : "rgb(239,68,68)"
              }}
            >
              {applyMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ——— Quick Access Grid ——— */}
        <motion.div variants={itemVariants} className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest ml-1 transition-colors duration-500" style={{ color: P.muted }}>Modules</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {modules.map((mod) => (
              <motion.div
                key={mod.href}
                onHoverStart={() => setHoveredModule(mod.href)}
                onHoverEnd={() => setHoveredModule(null)}
                whileHover={{ y: -4, boxShadow: P.hoverShadow, borderColor: isDarkMode ? "rgba(21,93,252,0.4)" : "#155dfc" }}
                style={premiumCard}
                className="overflow-hidden"
              >
                <Link
                  href={mod.href}
                  className="group relative flex flex-col gap-4 p-5 h-full z-10 outline-none transition-colors"
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ ...premiumIcon, background: hoveredModule === mod.href ? (isDarkMode ? "rgba(21,93,252,0.15)" : "#F0F4FF") : premiumIcon.background }}
                  >
                    <mod.icon className="w-5 h-5 transition-colors" style={{ color: hoveredModule === mod.href ? P.text : P.muted }} />
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-[14px] font-bold leading-tight transition-colors" style={{ color: hoveredModule === mod.href ? P.text : P.text }}>{mod.title}</p>
                    <p className="text-[12px] mt-1 font-medium transition-colors" style={{ color: P.muted }}>{mod.desc}</p>
                  </div>

                  {/* Monochrome glowing hover accent at the top edge */}
                  <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${hoveredModule === mod.href ? 'opacity-100' : 'opacity-0'}`} style={{ background: `linear-gradient(90deg, transparent, ${isDarkMode ? "rgba(21,93,252,0.8)" : "#155dfc"}, transparent)` }} />

                  {/* Subtle right arrow appearing on hover */}
                  <div className="absolute top-5 right-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRight className="w-4 h-4" style={{ color: P.text }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ——— Stat Cards ——— */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <motion.div
                className="relative p-4 sm:p-6 group transition-all duration-300 overflow-hidden"
                style={premiumCard}
                whileHover={{ boxShadow: P.hoverShadow, y: -4 }}
              >
                {/* Subtle ambient glow on hover inside the card */}
                {isDarkMode && <div className="absolute inset-0" style={{ background: P.cardBg }} />}

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-10 h-10 flex items-center justify-center transition-colors group-hover:bg-white group-hover:border-transparent group-hover:text-black" style={{ ...premiumIcon, color: P.text }}>
                    <stat.icon className="w-4.5 h-4.5 transition-colors group-hover:text-black" />
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors duration-500"
                    style={{ background: isDarkMode ? "rgba(21,93,252,0.06)" : "#F4F4F5", color: P.text, borderColor: P.border }}
                  >
                    {stat.sub}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors duration-500 relative z-10" style={{ color: P.text }}>
                  {stat.value}
                </h3>
                <p className="text-xs font-semibold mt-1 uppercase tracking-wider transition-colors duration-500 relative z-10" style={{ color: P.muted }}>{stat.label}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* ——— Main Layout Content ——— */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left Column — xl:col-span-2 */}
          <div className="xl:col-span-2 space-y-6">

            {/* ── Best Recommended Vehicle Hero Card ── */}
            <motion.div variants={itemVariants}>
              <div
                className="flex flex-col lg:flex-row overflow-hidden group transition-all duration-300"
                style={premiumCard}
              >
                {/* Image */}
                <div
                  className="lg:w-[42%] relative flex flex-col justify-between overflow-hidden p-4 sm:p-6 min-h-[160px] sm:min-h-[240px] transition-colors duration-500"
                  style={{ background: isDarkMode ? "rgba(0,0,0,0.35)" : "#F8FBFF", borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: P.border }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-black/80' : 'from-black/10'} to-transparent z-10 pointer-events-none`} />
                  <div className="relative z-20 flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md transition-colors duration-500" style={{ background: isDarkMode ? "rgba(255,255,255,0.1)" : "#FFFFFF", color: P.text, borderColor: P.border }}>
                      {historyVehicles.length > 0 ? 'Your Best Match' : 'Top Algorithm Match'}
                    </span>
                    <motion.div
                      animate={floatAnimation}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm border"
                      style={{ background: P.primary, color: P.primaryText, borderColor: isDarkMode ? "transparent" : "rgba(0,0,0,0.1)" }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {historyVehicles[0]?.score ? `${Number(historyVehicles[0].score).toFixed(1)}%` : 'AI Pick'}
                    </motion.div>
                  </div>
                  <motion.img
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring" as const, stiffness: 100 }}
                    src={isDarkMode
                      ? "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1500&auto=format&fit=crop"
                      : "https://images.unsplash.com/photo-1503376713356-2dbfdfaa52a1?q=80&w=1500&auto=format&fit=crop"
                    }
                    alt="Best Recommended Vehicle"
                    className={`relative z-0 w-[130%] max-w-none -translate-x-6 object-cover mt-6 transition-opacity duration-1000 ${isDarkMode ? 'opacity-90' : 'drop-shadow-xl'}`}
                    style={isDarkMode ? { mixBlendMode: "lighten" } : {}}
                  />
                </div>

                {/* Info */}
                <div className="p-7 flex-1 flex flex-col justify-center">
                  {historyVehicles.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: P.muted }}>{historyVehicles[0].brand || '—'}</span>
                        {historyVehicles[0].vehicle_class && <>
                          <span className="w-1 h-1 rounded-full bg-current opacity-40" style={{ color: P.muted }} />
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: P.muted }}>{historyVehicles[0].vehicle_class}</span>
                        </>}
                      </div>
                      <h2 className="text-2xl xl:text-3xl font-extrabold mb-1 tracking-tight" style={{ color: P.text }}>
                        {historyVehicles[0].model || 'Your Top Pick'}
                      </h2>
                      {historyVehicles[0].year && (
                        <p className="text-sm font-bold mb-4" style={{ color: P.muted }}>Model Year: {historyVehicles[0].year}</p>
                      )}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                          { icon: DollarSign, label: 'Min Price', value: historyVehicles[0].min_price ? `LKR ${Number(historyVehicles[0].min_price).toLocaleString()}` : 'N/A' },
                          { icon: DollarSign, label: 'Max Price', value: historyVehicles[0].max_price ? `LKR ${Number(historyVehicles[0].max_price).toLocaleString()}` : 'N/A' },
                          { icon: Gauge, label: 'Fuel Type', value: historyVehicles[0].fuel_type || 'N/A' },
                          { icon: Activity, label: 'Recommended', value: new Date(historyVehicles[0].recommended_at).toLocaleDateString() },
                        ].map((spec, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border" style={{ borderColor: P.border, background: isDarkMode ? "rgba(21,93,252,0.04)" : "#F0F4FF" }}>
                            <div className="w-7 h-7 flex items-center justify-center shrink-0" style={premiumIcon}>
                              <spec.icon className="w-3.5 h-3.5" style={{ color: P.muted }} />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase leading-none mb-0.5" style={{ color: P.muted }}>{spec.label}</p>
                              <p className="text-[12px] font-bold" style={{ color: P.text }}>{spec.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link href="/dashboard/historypage">
                        <motion.button
                          whileHover={{ scale: 1.01, boxShadow: `0 0 15px ${P.glow}` }}
                          whileTap={{ scale: 0.99 }}
                          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm shadow-md"
                          style={{ background: P.primary, color: P.primaryText }}
                        >
                          View Full History <ArrowUpRight className="w-4 h-4" />
                        </motion.button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: P.muted }}>AI Recommendation</p>
                      <h2 className="text-2xl xl:text-3xl font-extrabold mb-3 tracking-tight" style={{ color: P.text }}>No recommendations yet</h2>
                      <p className="text-sm leading-relaxed font-medium mb-6" style={{ color: P.muted }}>
                        Use the AI Recommendation module to get personalized vehicle picks based on your salary, usage, and preferences.
                      </p>
                      <Link href="/dashboard/recomendation">
                        <motion.button
                          whileHover={{ scale: 1.01, boxShadow: `0 0 15px ${P.glow}` }}
                          whileTap={{ scale: 0.99 }}
                          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm shadow-md"
                          style={{ background: P.primary, color: P.primaryText }}
                        >
                          <Sparkles className="w-4 h-4" /> Get Recommendations
                        </motion.button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── Fuel Prices Card ── */}
            <motion.div variants={itemVariants}>
              <motion.div
                className="p-6 transition-all duration-300 group"
                style={premiumCard}
                whileHover={{ boxShadow: P.hoverShadow }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: P.text }}>Current Fuel Prices</h3>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: P.muted }}>
                      According to the{' '}
                      <a
                        href="https://www.ceypetco.gov.lk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline-offset-2 hover:underline"
                        style={{ color: P.primary }}
                      >
                        Ceypetco website
                      </a>
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: isDarkMode ? "rgba(21,93,252,0.08)" : "#EFF6FF", color: P.primary }}
                  >
                    <Activity className="w-3 h-3" /> Live
                  </div>
                </div>

                {fuelPrices.length === 0 ? (
                  <div className="py-6 text-center text-sm" style={{ color: P.muted }}>Fuel price data unavailable.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {fuelPrices.map((f, i) => {
                      const fuelColors = [
                        { bg: isDarkMode ? 'rgba(21,93,252,0.08)' : '#EFF6FF', accent: '#155dfc' },
                        { bg: isDarkMode ? 'rgba(16,185,129,0.08)' : '#ECFDF5', accent: '#10b981' },
                        { bg: isDarkMode ? 'rgba(245,158,11,0.08)' : '#FFFBEB', accent: '#f59e0b' },
                        { bg: isDarkMode ? 'rgba(139,92,246,0.08)' : '#F5F3FF', accent: '#8b5cf6' },
                        { bg: isDarkMode ? 'rgba(239,68,68,0.08)' : '#FEF2F2', accent: '#ef4444' },
                        { bg: isDarkMode ? 'rgba(20,184,166,0.08)' : '#F0FDFA', accent: '#14b8a6' },
                      ];
                      const c = fuelColors[i % fuelColors.length];
                      return (
                        <div
                          key={f.fuel_type_name}
                          className="flex flex-col gap-2 p-4 rounded-2xl border transition-colors duration-300"
                          style={{ background: c.bg, borderColor: isDarkMode ? `${c.accent}30` : `${c.accent}20` }}
                        >
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${c.accent}18` }}>
                            <Gauge className="w-4 h-4" style={{ color: c.accent }} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-wider leading-tight" style={{ color: P.muted }}>
                            {f.fuel_type_name}
                          </p>
                          <p className="text-xl font-extrabold leading-none" style={{ color: P.text }}>
                            {Number(f.fuel_price).toLocaleString()}
                            <span className="text-[11px] font-bold ml-1" style={{ color: P.muted }}>LKR/L</span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>

          </div>

          {/* Right Column */}
          <div className="space-y-6 flex flex-col">

            {/* Activity Chart */}
            <motion.div variants={itemVariants} className="flex-none">
              <motion.div
                className="p-6 relative overflow-hidden transition-all duration-300 group"
                style={premiumCard}
                whileHover={{ boxShadow: P.hoverShadow }}
              >
                {isDarkMode && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />}

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div>
                    <h3 className="text-base font-bold transition-colors duration-500" style={{ color: P.text }}>Activity</h3>
                    <p className="text-[11px] font-semibold mt-1 uppercase tracking-wide transition-colors duration-500" style={{ color: P.muted }}>Recommendations Last 7 Days</p>
                  </div>
                  <motion.button
                    whileHover={{ backgroundColor: isDarkMode ? "rgba(21,93,252,0.1)" : "#EFF6FF" }}
                    className="p-2.5 rounded-full border transition-colors duration-500"
                    style={{ borderColor: P.border }}
                  >
                    <ChevronRight className="w-4 h-4 transition-colors duration-500" style={{ color: P.text }} />
                  </motion.button>
                </div>

                <div className="h-40 flex items-end gap-1.5 relative w-full mt-2 z-10">
                  {(() => {
                    const activity = Array(7).fill(0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    historyVehicles.forEach((v: any) => {
                      if (!v.recommended_at) return;
                      const recDate = new Date(v.recommended_at);
                      recDate.setHours(0, 0, 0, 0);
                      const diffTime = today.getTime() - recDate.getTime();
                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                      if (diffDays >= 0 && diffDays < 7) {
                        activity[6 - diffDays]++;
                      }
                    });

                    const maxActivity = Math.max(...activity, 5); // fallback max scale to 5

                    return activity.map((count, i) => {
                      const h = (count / maxActivity) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end h-full gap-2 group/bar cursor-pointer relative">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(h, 4)}%` }} // At least 4% height so empty days still show a small pip
                            transition={{ duration: 1, delay: i * 0.1, type: "spring" as const }}
                            className="w-full rounded-t-sm transition-all duration-500 relative overflow-hidden"
                            style={{ background: i === 6 ? P.primary : (isDarkMode ? "rgba(21,93,252,0.15)" : "#DBEAFE"), opacity: i === 6 ? 1 : 0.6 }}
                          >
                            <div className={`absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity`} />
                          </motion.div>
                          
                          {/* Hover tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity duration-200 z-20">
                            <span className="text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap" style={{ background: P.text, color: P.bg }}>
                              {count} picks
                            </span>
                          </div>

                          {i === 6 && (
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 transition-colors duration-500" style={{ color: P.muted }}>Now</span>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </motion.div>
            </motion.div>

            {/* Recent Recommendations */}
            <motion.div variants={itemVariants} className="flex-1">
              <motion.div
                className="p-6 h-full flex flex-col transition-all duration-300 group"
                style={premiumCard}
                whileHover={{ boxShadow: P.hoverShadow }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold tracking-tight transition-colors duration-500" style={{ color: P.text }}>Recent Recommendations</h3>
                </div>
                <p className="text-[11px] font-medium mb-5 transition-colors duration-500" style={{ color: P.muted }}>Your last requested algorithm matches</p>

                <div className="space-y-2 flex-1">
                  {historyVehicles.length > 0 ? historyVehicles.slice(0, 3).map((car, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ backgroundColor: isDarkMode ? "rgba(21,93,252,0.08)" : "#F0F4FF", borderColor: isDarkMode ? "rgba(21,93,252,0.2)" : "rgba(21,93,252,0.1)" }}
                      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors border border-transparent"
                    >
                      <div className="w-[60px] h-[45px] rounded-lg overflow-hidden shrink-0 relative bg-black/50">
                        <motion.img
                          whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}
                          src={isDarkMode ? "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop" : "https://images.unsplash.com/photo-1503376713356-2dbfdfaa52a1?q=80&w=800&auto=format&fit=crop"}
                          alt={car.model} className={`w-full h-full object-cover ${isDarkMode ? 'opacity-80' : 'opacity-100'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold truncate tracking-tight transition-colors duration-500" style={{ color: P.text }}>{car.model || car.brand}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold transition-colors duration-500" style={{ color: P.muted }}>
                            {car.min_price ? `$${Number(car.min_price).toLocaleString()}` : 'N/A'}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors duration-500 ${isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                            <TrendingUp className="w-3 h-3" />
                            Match
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-colors duration-500" style={{ background: P.primary, color: P.primaryText }}>
                        {car.score ? `${Number(car.score).toFixed(1)}%` : 'Top'}
                      </span>
                    </motion.div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center py-6">
                      <History className="w-10 h-10 mb-3 opacity-30" style={{ color: P.muted }} />
                      <p className="text-xs text-center font-medium" style={{ color: P.muted }}>No recent history found.</p>
                      <Link href="/dashboard/recomendation" className="mt-3 text-xs font-bold hover:underline" style={{ color: P.primary }}>Try Recommendation Module</Link>
                    </div>
                  )}
                </div>

                {historyVehicles.length > 0 && (
                  <Link href="/dashboard/historypage">
                    <motion.button
                      whileHover={{ backgroundColor: isDarkMode ? "rgba(21,93,252,0.08)" : "#EFF6FF" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition-colors border"
                      style={{ background: "transparent", color: P.text, borderColor: P.border }}
                    >
                      View Full History
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.div>

      <ResearcherApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        name={userName}
        email={userEmail}
        onSubmit={async (data) => {
          const raw = localStorage.getItem('user_data');
          const userData = raw ? JSON.parse(raw) : {};
          const appwriteId = userData.appwrite_id || '';

          const response = await fetch('http://localhost:8000/applications/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: userName,
              email: userEmail,
              academic_role: data.academic_role,
              comment: data.comment,
              appwrite_id: appwriteId
            })
          });

          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.detail || result.message || 'Failed to submit application');
          }

          setIsModalOpen(false);
          setApplyMsg('🎉 Application submitted successfully! Please wait for admin approval.');
        }}
      />
    </motion.div>
  );
}

export default dynamic(() => Promise.resolve(DashboardOverview), { ssr: false });
