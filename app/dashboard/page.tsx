'use client';

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowUpRight, BatteryCharging, CarFront, Gauge, ShieldCheck,
  Sparkles, TrendingDown, TrendingUp, Trophy, Activity, History,
  ChevronRight, LineChart, SearchCheck, Scale,
  Calculator, User, Heart, ArrowRight, Bell, Sun, Moon,
  FlaskConical, ExternalLink, Loader2
} from "lucide-react";
import { applyForResearcher, persistBrowserAuthSession } from "@/lib/appwrite";
import { createBrowserAuthToken, parseBrowserAuthToken } from "@/lib/auth-token";

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
  const [isApplying, setIsApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<string | null>(null);
  const P = isDarkMode ? D : L;

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.username) setUserName(parsed.username);
        if (parsed.user_type) setUserRole(parsed.user_type as 'user' | 'researcher');
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsDarkMode(prev => !prev);
    window.addEventListener('themeToggle', handler);
    return () => window.removeEventListener('themeToggle', handler);
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
      className="min-h-full pb-12 pt-6 px-4 xl:px-6 relative overflow-hidden transition-colors duration-500"
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

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight transition-colors duration-500" style={{ color: P.text }}>
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
                onClick={async () => {
                  setIsApplying(true);
                  setApplyMsg(null);
                  try {
                    const raw = localStorage.getItem('user_data');
                    const userData = raw ? JSON.parse(raw) : {};
                    const appwriteId = userData.appwrite_id || '';
                    const email = userData.email || '';
                    await applyForResearcher(appwriteId, email);

                    // Re-mint the auth token with researcher role
                    const existingToken = localStorage.getItem('auth_token');
                    const existing = parseBrowserAuthToken(existingToken);
                    const newToken = createBrowserAuthToken({
                      ...existing,
                      user_type: 'researcher',
                    });
                    persistBrowserAuthSession(newToken);

                    // Update localStorage user_data
                    localStorage.setItem('user_data', JSON.stringify({
                      ...userData,
                      user_type: 'researcher',
                    }));

                    setUserRole('researcher');
                    setApplyMsg('ðŸŽ‰ You are now a Researcher! Redirecting...');
                    setTimeout(() => window.location.replace('/researcher'), 1500);
                  } catch (err) {
                    setApplyMsg(err instanceof Error ? err.message : 'Failed to apply. Please try again.');
                  } finally {
                    setIsApplying(false);
                  }
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

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? "rgba(21,93,252,0.12)" : "#EFF6FF" }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-500 hidden sm:flex"
              style={{ background: isDarkMode ? "transparent" : "#FFFFFF", borderWidth: "1px", borderStyle: "solid", borderColor: P.border, color: P.text }}
            >
              <History className="w-4 h-4" /> History
            </motion.button>
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
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <motion.div
                className="relative p-6 group transition-all duration-300 overflow-hidden"
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
                <h3 className="text-3xl font-extrabold tracking-tight transition-colors duration-500 relative z-10" style={{ color: P.text }}>
                  {stat.value}
                </h3>
                <p className="text-xs font-semibold mt-1 uppercase tracking-wider transition-colors duration-500 relative z-10" style={{ color: P.muted }}>{stat.label}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* ——— Main Layout Content ——— */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6 flex flex-col">

            {/* Hero Interactive Card */}
            <motion.div variants={itemVariants} className="flex-1">
              <div
                className="flex flex-col lg:flex-row h-full overflow-hidden group transition-all duration-300"
                style={premiumCard}
              >
                {/* Image Section */}
                <div className="lg:w-[45%] relative flex flex-col justify-between overflow-hidden p-6 min-h-[250px] transition-colors duration-500" style={{ background: isDarkMode ? "rgba(0,0,0,0.3)" : "#F8FBFF", borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: P.border }}>
                  <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-black/80' : 'from-black/5'} to-transparent z-10 pointer-events-none transition-colors duration-500`} />

                  <div className="relative z-20 flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md transition-colors duration-500" style={{ background: isDarkMode ? "rgba(255,255,255,0.1)" : "#FFFFFF", color: P.text, borderColor: P.border }}>
                      Top Algorithm Match
                    </span>
                    <motion.div
                      animate={floatAnimation}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm border"
                      style={{ background: P.primary, color: P.primaryText, borderColor: isDarkMode ? "transparent" : "rgba(0,0,0,0.1)" }}
                    >
                      <Sparkles className="w-3.5 h-3.5" style={{ color: isDarkMode ? "#000" : "#FFF" }} /> 98.4%
                    </motion.div>
                  </div>

                  <motion.img
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring" as const, stiffness: 100 }}
                    src={isDarkMode ? "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1500&auto=format&fit=crop" : "https://images.unsplash.com/photo-1503376713356-2dbfdfaa52a1?q=80&w=1500&auto=format&fit=crop"}
                    alt="Recommended Car"
                    className={`relative z-0 w-[130%] max-w-none -translate-x-6 object-cover ${isDarkMode ? 'mt-4 opacity-90' : 'mt-8 drop-shadow-xl'} transition-opacity duration-1000`}
                    style={isDarkMode ? { mixBlendMode: "lighten" } : {}}
                  />
                </div>

                {/* Info Content */}
                <div className="p-8 flex-1 flex flex-col justify-center relative bg-transparent z-20">

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: P.muted }}>Premium EV</span>
                    <span className="w-1 h-1 rounded-full transition-colors duration-500" style={{ color: P.muted }} />
                    <span className="text-xs font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: P.muted }}>2024 Models</span>
                  </div>

                  <h2 className="text-2xl xl:text-3xl font-extrabold mb-1 tracking-tight transition-colors duration-500" style={{ color: P.text }}>Porsche Macan EV</h2>

                  <div className="flex items-baseline gap-3 mb-6 block">
                    <span className="text-xl font-bold transition-colors duration-500" style={{ color: P.text }}>$78,800</span>
                    <span className="text-sm font-medium line-through transition-colors duration-500" style={{ color: P.muted }}>$80,450 MSRP</span>
                  </div>

                  <p className="text-sm mb-8 leading-relaxed font-medium transition-colors duration-500" style={{ color: P.muted }}>
                    Calculated optimal match based on your 40-mile structured commute and preference for high-end German engineering. Yields the highest TCO efficiency in its class.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {[
                      { icon: BatteryCharging, label: "Range Estimate", value: "315 mi" },
                      { icon: Gauge, label: "Acceleration", value: "4.9s 0-60" },
                      { icon: ShieldCheck, label: "Safety Rating", value: "5-Star" },
                      { icon: Activity, label: "Depreciation", value: "Low Risk" },
                    ].map((spec, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border transition-colors duration-500" style={{ borderColor: P.border, background: isDarkMode ? "rgba(21,93,252,0.04)" : "#F0F4FF" }}>
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 transition-colors duration-500" style={premiumIcon}>
                          <spec.icon className="w-4 h-4 transition-colors duration-500" style={{ color: P.text }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase leading-none mb-1 transition-colors duration-500" style={{ color: P.muted }}>{spec.label}</p>
                          <p className="text-[13px] font-bold transition-colors duration-500" style={{ color: P.text }}>{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01, boxShadow: `0 0 15px ${P.glow}` }}
                    whileTap={{ scale: 0.99 }}
                    className="mt-auto flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm shadow-md group/btn transition-all duration-500"
                    style={{ background: P.primary, color: P.primaryText }}
                  >
                    Generate Full Report
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 flex flex-col">

            {/* Animated Market Chart placeholder */}
            <motion.div variants={itemVariants} className="flex-none">
              <motion.div
                className="p-6 relative overflow-hidden transition-all duration-300 group"
                style={premiumCard}
                whileHover={{ boxShadow: P.hoverShadow }}
              >
                {isDarkMode && <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none" />}

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div>
                    <h3 className="text-base font-bold transition-colors duration-500" style={{ color: P.text }}>Market Trend</h3>
                    <p className="text-[11px] font-semibold mt-1 uppercase tracking-wide transition-colors duration-500" style={{ color: P.muted }}>Depreciation vs Ask</p>
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
                  {[40, 60, 50, 80, 65, 95, 75].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full gap-2 group/bar cursor-pointer">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1, type: "spring" as const }}
                        className="w-full rounded-t-sm transition-all duration-500 relative overflow-hidden"
                        style={{ background: i === 6 ? P.primary : (isDarkMode ? "rgba(21,93,252,0.15)" : "#DBEAFE"), opacity: i === 6 ? 1 : 0.6 }}
                      >
                        <div className={`absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity`} />

                        {i === 6 && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-sm transition-colors duration-500" style={{ background: P.cardBg, color: P.text, borderColor: P.border }}>Now</span>
                        )}
                      </motion.div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Alternatives Smart List */}
            <motion.div variants={itemVariants} className="flex-1">
              <motion.div
                className="p-6 h-full flex flex-col transition-all duration-300 group"
                style={premiumCard}
                whileHover={{ boxShadow: P.hoverShadow }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold tracking-tight transition-colors duration-500" style={{ color: P.text }}>Compatible Alternatives</h3>
                </div>
                <p className="text-[11px] font-medium mb-5 transition-colors duration-500" style={{ color: P.muted }}>Secondary matches passing algorithm thresholds</p>

                <div className="space-y-2 flex-1">
                  {[
                    { name: "Audi Q8 e-tron", match: "94%", price: "$74,400", trend: "up", img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0b16?q=80&w=800&auto=format&fit=crop" },
                    { name: "BMW iX xDrive50", match: "91%", price: "$87,250", trend: "down", img: "https://images.unsplash.com/photo-1698246535496-c1edb0805c6d?q=80&w=800&auto=format&fit=crop" },
                    { name: "Tesla Model X", match: "88%", price: "$79,990", trend: "down", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop" },
                  ].map((car, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ backgroundColor: isDarkMode ? "rgba(21,93,252,0.08)" : "#F0F4FF", borderColor: isDarkMode ? "rgba(21,93,252,0.2)" : "rgba(21,93,252,0.1)" }}
                      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors border border-transparent"
                    >
                      <div className="w-[60px] h-[45px] rounded-lg overflow-hidden shrink-0 relative bg-black/50">
                        <motion.img
                          whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}
                          src={car.img} alt={car.name} className={`w-full h-full object-cover ${isDarkMode ? 'opacity-80' : 'opacity-100'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold truncate tracking-tight transition-colors duration-500" style={{ color: P.text }}>{car.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold transition-colors duration-500" style={{ color: P.muted }}>{car.price}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors duration-500 ${car.trend === "up" ? (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (isDarkMode ? "bg-white/5 text-gray-400" : "bg-zinc-100 text-zinc-600")}`}>
                            {car.trend === "up" ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                            {car.trend === "up" ? "Buy" : "Wait"}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-colors duration-500" style={{ background: P.primary, color: P.primaryText }}>
                        {car.match}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ backgroundColor: isDarkMode ? "rgba(21,93,252,0.08)" : "#EFF6FF" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition-colors border"
                  style={{ background: "transparent", color: P.text, borderColor: P.border }}
                >
                  Explore All Alternatives
                </motion.button>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default dynamic(() => Promise.resolve(DashboardOverview), { ssr: false });
