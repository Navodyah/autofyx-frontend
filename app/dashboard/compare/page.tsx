"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, RefreshCw, ArrowRight, ShieldCheck, ChevronDown, Car, Search, CheckCircle2, AlertTriangle, Info } from "lucide-react";
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

// Constants for Vehicle Selection Cards
const VEHICLE_THEMES = [
  { id: 'A', bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'B', bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'C', bg: 'bg-sky-500', text: 'text-sky-500', light: 'bg-sky-50', border: 'border-sky-200' },
];

function CustomSelect({ value, onChange, options, placeholder, disabled }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        disabled={disabled}
        className={`w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-semibold outline-none transition-all cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' : 
          value ? 'border-blue-500 bg-blue-50/30 text-blue-900 ring-4 ring-blue-500/10' : 
          'border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
        }`}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${value ? 'text-blue-500' : 'text-slate-400'}`} />
    </div>
  );
}

export default function ComparePage() {
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
    (async () => { if (identity?.user_id) { try { setPreferences(await getRegistrationPreferences({ user_id: identity.user_id, appwrite_id: identity.appwrite_id, email: identity.email })); } catch {} } })();
  }, [identity]);

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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Dark Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 pt-16 pb-40">
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2000&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center 60%' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/40 to-slate-900/80" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 mb-6 border border-blue-500/20">
              <Scale className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Head-to-Head Comparison</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6 leading-tight">
              Compare 3 Vehicles Side-by-Side
            </h1>
            <p className="text-base font-medium text-slate-300 leading-relaxed mb-8">
              Select the Make, Model, and Year for three vehicles. We'll analyze their specifications and recommend the best option tailored to your personal preferences.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Vehicle Selection Section */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-28">
        
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
                className={`rounded-2xl border bg-white shadow-xl shadow-slate-200/40 overflow-hidden transition-all duration-300 ${isSelected ? theme.border : 'border-slate-200 hover:border-blue-300'}`}
              >
                {/* Card Header */}
                <div className={`p-5 flex items-center gap-4 border-b border-slate-100 ${isSelected ? theme.light : 'bg-slate-50'}`}>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-extrabold text-white text-lg shadow-sm ${theme.bg}`}>
                    {theme.id}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Vehicle {theme.id}</p>
                    {isSelected ? (
                      <h3 className={`text-base font-extrabold leading-tight ${theme.text}`}>
                        {v.make} {v.model} <span className="opacity-70">({v.year})</span>
                      </h3>
                    ) : (
                      <h3 className="text-sm font-semibold text-slate-500">Select specifications</h3>
                    )}
                  </div>
                </div>

                {/* Card Body - Dropdowns */}
                <div className="p-6 space-y-4">
                  <CustomSelect value={v.make} onChange={v.setMake} options={makes} placeholder="1. Select Make" />
                  <CustomSelect value={v.model} onChange={v.setModel} options={v.models} placeholder={v.make ? "2. Select Model" : "2. Select Make first"} disabled={!v.make} />
                  <CustomSelect value={v.year === '' ? '' : String(v.year)} onChange={val => v.setYear(val ? Number(val) : '')} options={v.years.map(String)} placeholder={v.model ? "3. Select Year" : "3. Select Model first"} disabled={!v.model} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button 
            whileHover={{ scale: canCompare && !loading ? 1.02 : 1 }}
            whileTap={{ scale: canCompare && !loading ? 0.98 : 1 }}
            disabled={!canCompare || loading} 
            onClick={onCompare}
            className={`flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 rounded-xl text-base font-bold text-white shadow-lg transition-all duration-300 ${
              canCompare ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {loading ? (
              <><span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Analyzing Specifications...</>
            ) : (
              <><Search className="h-5 w-5" /> Compare Vehicles Now</>
            )}
          </motion.button>
          
          <button 
            onClick={onReset}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors"
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
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Analysis Results</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Detailed breakdown of specifications and our tailored recommendation.</p>
                </div>
                
                {/* Recommendation Banner */}
                {recommendedIndex !== -1 && (
                  <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Best Match identified based on your profile</span>
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
                      className={`relative flex flex-col rounded-2xl bg-white transition-all duration-300 ${
                        isRec 
                          ? 'ring-4 ring-emerald-500 border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-[1.02] z-10' 
                          : 'border border-slate-200 shadow-xl shadow-slate-200/40 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50'
                      }`}
                    >
                      {/* Best Match Badge */}
                      {isRec && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-20">
                          <CheckCircle2 className="w-4 h-4" /> 
                          Recommended For You
                        </div>
                      )}

                      {/* Card Header (Vehicle Identity) */}
                      <div className={`p-6 pb-5 border-b rounded-t-2xl ${isRec ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${theme.bg} text-white`}>
                            Option {theme.id}
                          </span>
                          {!vehicle.found && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-red-600">
                              Not Found
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-slate-900 leading-tight min-h-[56px] flex items-center">
                          {vehicle.name || `Unknown Vehicle ${theme.id}`}
                        </h3>
                        
                        {vehicle.found ? (
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Car className="w-4 h-4" /> 
                            {vehicle.vehicle_class || 'Standard Class'}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs font-medium text-red-500">{vehicle.message || 'Data unavailable in catalog.'}</p>
                        )}
                      </div>

                      {/* Card Body (Specs List) */}
                      <div className="flex-1 p-6 space-y-4">
                        {[
                          { label: 'Engine Size', value: vehicle.engine_size, suffix: 'L' },
                          { label: 'Engine Type', value: vehicle.engine_type },
                          { label: 'Transmission', value: vehicle.transmission },
                          { label: 'Fuel Type', value: vehicle.fuel },
                          { label: 'City / Comb (L/100km)', value: vehicle.comb_l_per_100, isEfficiency: true },
                          { label: 'Highway (L/100km)', value: vehicle.hwy_l_per_100, isEfficiency: true },
                          { label: 'Tyre Size', value: vehicle.tyre_size },
                        ].map((spec, specIdx) => {
                          const val = fmt(spec.value);
                          
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
                            <div key={specIdx} className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                {spec.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isWinner ? 'text-emerald-600' : 'text-slate-800'} ${val === '—' ? 'opacity-50' : ''}`}>
                                  {val} {val !== '—' && spec.suffix && spec.suffix}
                                </span>
                                {isWinner && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                                    Best
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Optional Description at bottom */}
                      {vehicle.description && vehicle.description !== '—' && (
                        <div className="p-5 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                          <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-3">
                            {vehicle.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Informational Footer */}
              <div className="mt-8 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-5">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-blue-800 leading-relaxed">
                  The recommended <strong className="font-extrabold text-blue-900">Best Match</strong> is calculated by analyzing your customized profile preferences, prioritizing your preferred fuel type, vehicle class requirements, and fuel efficiency scoring against our extensive database.
                </p>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
