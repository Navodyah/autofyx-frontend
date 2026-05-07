"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, RefreshCw, ArrowRight, ShieldCheck, ChevronDown, Car, Search, CheckCircle2, AlertTriangle, Info, Settings, Settings2, Fuel, Disc, GitBranch, Activity } from "lucide-react";
import { getRegistrationPreferences } from '@/lib/appwrite';
import { parseBrowserAuthToken, type BrowserAuthTokenPayload } from '@/lib/auth-token';

type CatalogListResponse = { items: string[] };
type YearsListResponse = { items: number[] };
type CompareItem = {
  found: boolean; name: string; message?: string; make?: string; model?: string; year?: number;
  vehicle_class?: string | null; engine_size?: number | string | null; engine_type?: string | null;
  transmission?: string | null; fuel?: string | null; comb_l_per_100?: number | string | null;
  hwy_l_per_100?: number | string | null; tyre_size?: string | null; description?: string | null;
};
type CompareResponse = CompareItem[];

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

function fmt(v: any) { return v === null || v === undefined || v === "" ? "—" : String(v); }

// ── Palettes (mirror dashboard/page.tsx) ────────────────────────────────
const L = {
  bg: '#F0F4FF', cardBg: '#FFFFFF', primary: '#155dfc', primaryText: '#FFFFFF',
  text: '#030304', muted: '#6B7280', border: '#DBEAFE',
  shadow: '0 4px 20px -2px rgba(21,93,252,0.06), 0 0 3px rgba(21,93,252,0.04)',
  hoverShadow: '0 12px 24px -4px rgba(21,93,252,0.12)', iconBg: '#EFF6FF',
};
const D = {
  bg: '#030304', cardBg: '#0F111A', primary: '#155dfc', primaryText: '#FFFFFF',
  text: '#FFFFFF', muted: '#8B949E', border: 'rgba(21,93,252,0.2)',
  shadow: '0 4px 24px -4px rgba(0,0,0,0.5)',
  hoverShadow: '0 12px 30px -4px rgba(0,0,0,0.5), 0 0 25px rgba(21,93,252,0.12)',
  iconBg: 'rgba(21,93,252,0.08)',
};
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
};

// Constants for Vehicle Selection Cards
const VEHICLE_THEMES = [
  { id: 'A', bg: 'bg-[#155dfc]', text: 'text-[#155dfc]', light: 'bg-blue-50', border: 'border-[#155dfc]/30' },
  { id: 'B', bg: 'bg-[#1d4ed8]', text: 'text-[#1d4ed8]', light: 'bg-blue-50', border: 'border-[#1d4ed8]/30' },
  { id: 'C', bg: 'bg-[#2563eb]', text: 'text-[#2563eb]', light: 'bg-blue-50', border: 'border-[#2563eb]/30' },
];

function CustomSelect({ value, onChange, options, placeholder, disabled, isDarkMode, P }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean; isDarkMode?: boolean; P?: any;
}) {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        disabled={disabled}
        className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-semibold outline-none transition-all cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : 
          value ? 'border-[#155dfc] ring-4 ring-[#155dfc]/10' : 
          'hover:border-blue-400 focus:border-[#155dfc] focus:ring-4 focus:ring-[#155dfc]/10'
        }`}
        style={{
          background: disabled ? (isDarkMode ? '#1a1a24' : '#f8fafc') : (isDarkMode ? '#0a0a14' : '#ffffff'),
          borderColor: value ? '#155dfc' : (isDarkMode ? 'rgba(21,93,252,0.2)' : '#e2e8f0'),
          color: disabled ? (isDarkMode ? '#6b7280' : '#94a3b8') : (P?.text || '#030304')
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${value ? 'text-[#155dfc]' : 'text-slate-400'}`} />
    </div>
  );
}

export default function ComparePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [makes, setMakes] = useState<string[]>([]);
  
  const [modelsA, setModelsA] = useState<string[]>([]); const [yearsA, setYearsA] = useState<number[]>([]);
  const [makeA, setMakeA] = useState(""); const [modelA, setModelA] = useState(""); const [yearA, setYearA] = useState<number | ''>('');
  
  const [modelsB, setModelsB] = useState<string[]>([]); const [yearsB, setYearsB] = useState<number[]>([]);
  const [makeB, setMakeB] = useState(""); const [modelB, setModelB] = useState(""); const [yearB, setYearB] = useState<number | ''>('');
  
  const [modelsC, setModelsC] = useState<string[]>([]); const [yearsC, setYearsC] = useState<number[]>([]);
  const [makeC, setMakeC] = useState(""); const [modelC, setModelC] = useState(""); const [yearC, setYearC] = useState<number | ''>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [preferences, setPreferences] = useState<any>(null);

  const identity = useMemo<BrowserAuthTokenPayload | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = window.localStorage.getItem('access_token') || window.localStorage.getItem('token');
    return parseBrowserAuthToken(token);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    if (stored) setIsDarkMode(true);
    const handler = (e) => setIsDarkMode(e.detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  useEffect(() => {
    (async () => { if (identity?.user_id) { try { setPreferences(await getRegistrationPreferences({ user_id: identity.user_id, appwrite_id: identity.appwrite_id, email: identity.email })); } catch {} } })();
  }, [identity]);

  const P = isDarkMode ? D : L;

  useEffect(() => { (async () => { try { const d = await fetchJSON<CatalogListResponse>(`${API}/lookup/makes`); setMakes(d.items || []); } catch (e: any) { setError("Failed to load vehicle makes."); } })(); }, []);

  // Fetch Models
  useEffect(() => { if (!makeA) return; (async () => { setModelA(""); setYearA(''); setYearsA([]); try { const d = await fetchJSON<CatalogListResponse>(`${API}/lookup/models?make=${encodeURIComponent(makeA)}`); setModelsA(d.items || []); } catch {} })(); }, [makeA]);
  useEffect(() => { if (!makeB) return; (async () => { setModelB(""); setYearB(''); setYearsB([]); try { const d = await fetchJSON<CatalogListResponse>(`${API}/lookup/models?make=${encodeURIComponent(makeB)}`); setModelsB(d.items || []); } catch {} })(); }, [makeB]);
  useEffect(() => { if (!makeC) return; (async () => { setModelC(""); setYearC(''); setYearsC([]); try { const d = await fetchJSON<CatalogListResponse>(`${API}/lookup/models?make=${encodeURIComponent(makeC)}`); setModelsC(d.items || []); } catch {} })(); }, [makeC]);

  // Fetch Years
  useEffect(() => { if (!makeA || !modelA) return; (async () => { setYearA(''); try { const d = await fetchJSON<YearsListResponse>(`${API}/lookup/years?make=${encodeURIComponent(makeA)}&model=${encodeURIComponent(modelA)}`); setYearsA(d.items || []); } catch {} })(); }, [makeA, modelA]);
  useEffect(() => { if (!makeB || !modelB) return; (async () => { setYearB(''); try { const d = await fetchJSON<YearsListResponse>(`${API}/lookup/years?make=${encodeURIComponent(makeB)}&model=${encodeURIComponent(modelB)}`); setYearsB(d.items || []); } catch {} })(); }, [makeB, modelB]);
  useEffect(() => { if (!makeC || !modelC) return; (async () => { setYearC(''); try { const d = await fetchJSON<YearsListResponse>(`${API}/lookup/years?make=${encodeURIComponent(makeC)}&model=${encodeURIComponent(modelC)}`); setYearsC(d.items || []); } catch {} })(); }, [makeC, modelC]);

  const canCompare = useMemo(() => makeA && modelA && yearA !== '' && makeB && modelB && yearB !== '' && makeC && modelC && yearC !== '', [makeA, modelA, yearA, makeB, modelB, yearB, makeC, modelC, yearC]);

  async function onCompare() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API}/compare/`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ selections: [{ make: makeA, model: modelA, year: Number(yearA) }, { make: makeB, model: modelB, year: Number(yearB) }, { make: makeC, model: modelC, year: Number(yearC) }] }) 
      });
      const json = await res.json() as any;
      if (!res.ok) { setError(typeof json?.detail === "string" ? json.detail : json?.message || "Compare failed. Please try again."); return; }
      const list: CompareResponse = Array.isArray(json) ? json : json?.items || [];
      setResult(list);
      if (!Array.isArray(list) || list.length < 3) setError("Expected 3 vehicles in response.");
    } catch (e: any) { setError("Network error. Please check your connection."); }
    finally { setLoading(false); }
  }

  function onReset() {
    setMakeA(""); setModelA(""); setYearA(''); setModelsA([]); setYearsA([]);
    setMakeB(""); setModelB(""); setYearB(''); setModelsB([]); setYearsB([]);
    setMakeC(""); setModelC(""); setYearC(''); setModelsC([]); setYearsC([]);
    setResult(null); setError(null);
  }

  // Scoring Logic
  const recommendedIndex = useMemo(() => {
    if (!result || result.length < 3) return -1;
    const scores = [0, 0, 0];
    result.forEach((v, i) => {
      if (!v.found) { scores[i] = -999; return; }
      if (!preferences) { if (v.comb_l_per_100) { const val = parseFloat(String(v.comb_l_per_100)); if (!isNaN(val)) scores[i] += (20 - val); } return; }
      if (preferences.fuel_preference && v.fuel) { const pref = preferences.fuel_preference.toLowerCase(); const fuel = v.fuel.toLowerCase(); if (fuel.includes(pref) || (pref === 'petrol' && ['x', 'z'].includes(fuel)) || (pref === 'diesel' && fuel === 'd')) scores[i] += 15; }
      if (preferences.preferred_vehicle_types?.length && v.vehicle_class) { const prefc = preferences.preferred_vehicle_types.map((c: string) => c.toLowerCase()); const VC = v.vehicle_class.toLowerCase(); if (prefc.some((c: string) => VC.includes(c) || c.includes(VC))) scores[i] += 15; }
      if (preferences.priority === 'Fuel Efficiency' && v.comb_l_per_100) { const val = parseFloat(String(v.comb_l_per_100)); if (!isNaN(val)) scores[i] += (25 - val); }
      if (v.year) scores[i] += (v.year - 2000) * 0.2;
    });
    const max = Math.max(...scores);
    return max < -100 ? -1 : scores.indexOf(max);
  }, [result, preferences]);

  const items = result || [];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-full pb-20 pt-6 px-4 xl:px-6 relative overflow-hidden transition-colors duration-500"
      style={{ background: P.bg, borderRadius: '32px', margin: '1px', minHeight: 'calc(100vh - 100px)' }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[32px] p-8 xl:p-10 text-white shadow-2xl relative mb-8"
          style={{ background: isDarkMode ? 'linear-gradient(135deg, #0F111A, #1a1e2e)' : 'linear-gradient(135deg, #155dfc, #3b82f6)' }}
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur" style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
                <Scale className="h-3.5 w-3.5" />
                Head-to-Head Comparison
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[54px] leading-tight">Vehicle Comparison</h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed font-medium md:text-[15px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Select the Make, Model, and Year for three vehicles. We'll analyze their specifications and recommend the best option based on current market data.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

      {/* Vehicle Selection Section */}
      <motion.div variants={itemVariants} className="relative z-20">
        
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-700 shadow-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {[
            { make: makeA, setMake: setMakeA, model: modelA, setModel: setModelA, year: yearA, setYear: setYearA, models: modelsA, years: yearsA },
            { make: makeB, setMake: setMakeB, model: modelB, setModel: setModelB, year: yearB, setYear: setYearB, models: modelsB, years: yearsB },
            { make: makeC, setMake: setMakeC, model: modelC, setModel: setModelC, year: yearC, setYear: setYearC, models: modelsC, years: yearsC },
          ].map((v, i) => {
            const theme = VEHICLE_THEMES[i];
            const isSelected = v.make && v.model && v.year !== '';
            
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border shadow-xl overflow-hidden transition-all duration-500`}
                style={{ background: P.cardBg, borderColor: isSelected ? theme.border : P.border, boxShadow: P.shadow }}
              >
                {/* Card Header */}
                <div className={`p-5 flex items-center gap-4 border-b`} style={{ borderColor: P.border, background: isSelected ? (isDarkMode ? 'rgba(21,93,252,0.1)' : theme.light) : (isDarkMode ? '#0a0a0a' : '#f8fafc') }}>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-extrabold text-white text-lg shadow-sm ${theme.bg}`}>
                    {theme.id}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-0.5 transition-colors duration-500" style={{ color: P.muted }}>Vehicle {theme.id}</p>
                    {isSelected ? (
                      <h3 className={`text-base font-extrabold leading-tight ${theme.text}`}>
                        {v.make} {v.model} <span className="opacity-70">({v.year})</span>
                      </h3>
                    ) : (
                      <h3 className="text-sm font-semibold transition-colors duration-500" style={{ color: P.muted }}>Select specifications</h3>
                    )}
                  </div>
                </div>

                {/* Card Body - Dropdowns */}
                <div className="p-6 space-y-4">
                  <CustomSelect value={v.make} onChange={v.setMake} options={makes} placeholder="1. Select Make" isDarkMode={isDarkMode} P={P} />
                  <CustomSelect value={v.model} onChange={v.setModel} options={v.models} placeholder={v.make ? "2. Select Model" : "2. Select Make first"} disabled={!v.make} isDarkMode={isDarkMode} P={P} />
                  <CustomSelect value={v.year === '' ? '' : String(v.year)} onChange={val => v.setYear(val ? Number(val) : '')} options={v.years.map(String)} placeholder={v.model ? "3. Select Year" : "3. Select Model first"} disabled={!v.model} isDarkMode={isDarkMode} P={P} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <motion.button 
            whileHover={{ scale: canCompare && !loading ? 1.02 : 1 }}
            whileTap={{ scale: canCompare && !loading ? 0.98 : 1 }}
            disabled={!canCompare || loading} 
            onClick={onCompare}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 rounded-xl text-base font-bold text-white transition-all duration-300 ${
              canCompare ? '' : 'cursor-not-allowed opacity-50'
            }`}
            style={{ background: canCompare ? P.primary : (isDarkMode ? '#334155' : '#cbd5e1'), boxShadow: canCompare ? `0 8px 24px -4px rgba(21,93,252,0.3)` : 'none' }}
          >
            {loading ? (
              <><span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Analyzing Specifications...</>
            ) : (
              <><Search className="h-5 w-5" /> Compare Vehicles Now</>
            )}
          </motion.button>
          
          <button 
            onClick={onReset}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-bold transition-colors duration-500 border"
            style={{ background: P.cardBg, borderColor: P.border, color: P.muted }}
          >
            <RefreshCw className="h-4 w-4" /> Reset Filters
          </button>
        </div>

        {/* --- COMPARISON RESULTS (3 CARDS UI) --- */}
        <AnimatePresence>
          {items.length === 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-16"
            >
              {/* Super Modern Header */}
              <div 
                className="relative overflow-hidden rounded-2xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border transition-colors duration-500 shadow-sm"
                style={{ background: isDarkMode ? 'rgba(21,93,252,0.05)' : '#F0F4FF', borderColor: P.border }}
              >
                {/* Decorative background shape */}
                <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full mix-blend-multiply filter blur-3xl opacity-40 transition-colors duration-500" style={{ background: P.primary }} />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors duration-500 shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.15)' : '#FFFFFF', color: P.primary }}>
                    <Activity className="w-3 h-3" />
                    Data Driven Insights
                  </div>
                  <h2 className="text-2xl font-black tracking-tight transition-colors duration-500" style={{ color: P.text }}>
                    Analysis Results
                  </h2>
                  <p className="text-xs font-medium mt-1 max-w-lg transition-colors duration-500 leading-relaxed" style={{ color: P.muted }}>
                    We've crunched the numbers and analyzed the specifications to help you make an informed decision.
                  </p>
                </div>
                
                {/* Recommendation Banner */}
                {recommendedIndex !== -1 && (
                  <div className="relative z-10 flex-shrink-0">
                    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-xl border backdrop-blur-md shadow-sm transition-colors duration-500" style={{ background: isDarkMode ? 'rgba(16,185,129,0.1)' : '#ecfdf5', borderColor: isDarkMode ? 'rgba(16,185,129,0.2)' : '#a7f3d0' }}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full mb-1.5 shadow-inner" style={{ background: '#10b981', color: '#ffffff' }}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#10b981] mb-0.5">Success</span>
                      <span className="text-xs font-bold text-center" style={{ color: isDarkMode ? '#e5e7eb' : '#065f46' }}>Best Match</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Result Cards Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((idx) => {
                  const vehicle = items[idx];
                  const isRec = idx === recommendedIndex;
                  const theme = VEHICLE_THEMES[idx];
                  
                  return (
                    <div 
                      key={idx} 
                      className={`relative flex flex-col rounded-3xl transition-all duration-500 border`}
                      style={{
                        background: P.cardBg,
                        borderColor: isRec ? '#10b981' : P.border,
                        boxShadow: isRec ? '0 10px 40px -10px rgba(16,185,129,0.4)' : P.shadow,
                        transform: isRec ? 'scale(1.03) translateY(-10px)' : 'scale(1)',
                        zIndex: isRec ? 10 : 1
                      }}
                    >
                      {/* Subtle ambient glow inside the card */}
                      <div className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none transition-colors duration-500 overflow-hidden" 
                           style={{ background: `radial-gradient(circle at 50% 0%, ${theme.bg.replace('bg-[', '').replace(']', '')}, transparent 60%)` }} />

                      {/* Best Match Badge */}
                      {isRec && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-6 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-xl shadow-emerald-500/30 flex items-center gap-1.5 z-20 border border-emerald-300/30 backdrop-blur-sm">
                          <CheckCircle2 className="w-4 h-4" /> 
                          Top Choice
                        </div>
                      )}

                      {/* Card Header (Vehicle Identity) */}
                      <div className={`p-8 pb-6 border-b rounded-t-3xl relative z-10 overflow-hidden`} style={{ borderColor: P.border, background: isRec ? (isDarkMode ? 'rgba(16,185,129,0.05)' : '#f0fdf4') : 'transparent' }}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${theme.bg} text-white shadow-md`}>
                            Option {theme.id}
                          </span>
                          {!vehicle.found && (
                            <span className="px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-red-600 shadow-sm">
                              Not Found
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-2xl font-black leading-tight min-h-[64px] flex items-center transition-colors duration-500 drop-shadow-sm" style={{ color: P.text }}>
                          {vehicle.name || `Unknown Vehicle ${theme.id}`}
                        </h3>
                        
                        {vehicle.found ? (
                          <div className="mt-4 flex items-center gap-2 text-xs font-bold transition-colors duration-500" style={{ color: P.muted }}>
                            <Car className="w-4 h-4" /> 
                            {vehicle.vehicle_class || 'Standard Class'}
                          </div>
                        ) : (
                          <p className="mt-4 text-xs font-medium text-red-500">{vehicle.message || 'Data unavailable in catalog.'}</p>
                        )}
                      </div>

                      {/* Card Body (Specs List) */}
                      <div className="flex-1 p-8 space-y-6 relative z-10">
                        {[
                          { label: 'Engine Size', value: vehicle.engine_size, suffix: 'L', icon: Settings },
                          { label: 'Engine Type', value: vehicle.engine_type, icon: Settings2 },
                          { label: 'Transmission', value: vehicle.transmission, icon: GitBranch },
                          { label: 'Fuel Type', value: vehicle.fuel, icon: Fuel },
                          { label: 'City / Comb (L/100km)', value: vehicle.comb_l_per_100, isEfficiency: true, icon: Activity },
                          { label: 'Highway (L/100km)', value: vehicle.hwy_l_per_100, isEfficiency: true, icon: Activity },
                          { label: 'Tyre Size', value: vehicle.tyre_size, icon: Disc },
                        ].map((spec, specIdx) => {
                          const val = fmt(spec.value);
                          const Icon = spec.icon;
                          
                          // Determine if this is the best efficiency value among the 3 vehicles
                          let isWinner = false;
                          if (spec.isEfficiency && vehicle.found && val !== '—') {
                            const currentVal = parseFloat(val);
                            if (!isNaN(currentVal)) {
                              const allVals = items.map(it => {
                                const v = it[specIdx === 4 ? 'comb_l_per_100' : 'hwy_l_per_100'];
                                return v != null && v !== '' ? parseFloat(String(v)) : Infinity;
                              });
                              const minVal = Math.min(...allVals);
                              if (currentVal === minVal && minVal !== Infinity) {
                                isWinner = true;
                              }
                            }
                          }

                          return (
                            <div key={specIdx} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-500" style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF', color: P.primary }}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider transition-colors duration-500" style={{ color: P.muted }}>
                                  {spec.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-extrabold ${val === '—' ? 'opacity-40' : ''} transition-colors duration-500`} style={{ color: isWinner ? '#10b981' : P.text }}>
                                  {val} {val !== '—' && spec.suffix && spec.suffix}
                                </span>
                                {isWinner && (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm" style={{ background: '#10b981', color: '#ffffff' }}>
                                    Top
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Optional Description at bottom */}
                      {vehicle.description && vehicle.description !== '—' && (
                        <div className="p-6 border-t rounded-b-3xl relative z-10 transition-colors duration-500" style={{ background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: P.border }}>
                          <p className="text-[11px] font-medium leading-relaxed line-clamp-3 transition-colors duration-500" style={{ color: P.muted }}>
                            {vehicle.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Informational Footer */}
              <div className="mt-10 relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 transition-colors duration-500 border" style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}>
                <div className="absolute left-0 top-0 bottom-0 w-2 transition-colors duration-500" style={{ background: P.primary }} />
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors duration-500 shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF', color: P.primary }}>
                  <Info className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-widest mb-1.5 transition-colors duration-500" style={{ color: P.text }}>How we calculate this</h4>
                  <p className="text-sm font-medium leading-relaxed transition-colors duration-500 max-w-4xl" style={{ color: P.muted }}>
                    The recommended <strong className="font-extrabold transition-colors duration-500" style={{ color: P.primary }}>Best Match</strong> is dynamically calculated by analyzing your customized profile preferences, prioritizing your preferred fuel type, vehicle class requirements, and fuel efficiency scoring against our extensive local database.
                  </p>
                </div>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

        </motion.div>
      </motion.div>
    </motion.div>
  );
}
