"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ChevronLeft, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRegistrationPreferences } from '@/lib/appwrite';
import { parseBrowserAuthToken, type BrowserAuthTokenPayload } from '@/lib/auth-token';

type CatalogListResponse = { items: string[] };
type YearsListResponse = { items: number[] };

type CompareItem = {
  found: boolean;
  name: string;
  message?: string;
  make?: string;
  model?: string;
  year?: number;
  vehicle_class?: string | null;
  engine_size?: number | string | null;
  engine_type?: string | null;
  transmission?: string | null;
  fuel?: string | null;
  comb_l_per_100?: number | string | null;
  hwy_l_per_100?: number | string | null;
  tyre_size?: string | null;
  description?: string | null;
};

type CompareResponse = CompareItem[];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed: ${res.status} ${text ? `- ${text}` : ""}`);
  }
  return res.json();
}

function fmt(v: any) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function CompareCell({ a, b, c, label }: { a: any; b: any; c: any; label: string }) {
  const fmtA = fmt(a);
  const fmtB = fmt(b);
  const fmtC = fmt(c);

  let aClass = '';
  let bClass = '';
  let cClass = '';

  const consumptionFields = ['COMB (L/100 km)', 'HWY (L/100 km)'];
  if (consumptionFields.includes(label)) {
    const nums = [fmtA, fmtB, fmtC].map(v => v !== '—' ? parseFloat(v) : Infinity);
    const min = Math.min(...nums);
    if (min !== Infinity) {
      if (nums[0] === min) aClass = 'compare-winner';
      if (nums[1] === min) bClass = 'compare-winner';
      if (nums[2] === min) cClass = 'compare-winner';
    }
  }

  return (
    <div
      className="compare-row grid grid-cols-4 gap-4 py-3 px-5 rounded-lg"
      style={{ borderBottom: '1px solid var(--border-secondary)' }}
    >
      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className={`text-sm ${aClass}`} style={{ color: aClass ? undefined : 'var(--text-secondary)' }}>{fmtA}</div>
      <div className={`text-sm ${bClass}`} style={{ color: bClass ? undefined : 'var(--text-secondary)' }}>{fmtB}</div>
      <div className={`text-sm ${cClass}`} style={{ color: cClass ? undefined : 'var(--text-secondary)' }}>{fmtC}</div>
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function ComparePage() {
  const [makes, setMakes] = useState<string[]>([]);

  // States A
  const [modelsA, setModelsA] = useState<string[]>([]);
  const [yearsA, setYearsA] = useState<number[]>([]);
  const [makeA, setMakeA] = useState("");
  const [modelA, setModelA] = useState("");
  const [yearA, setYearA] = useState<number | "">("");

  // States B
  const [modelsB, setModelsB] = useState<string[]>([]);
  const [yearsB, setYearsB] = useState<number[]>([]);
  const [makeB, setMakeB] = useState("");
  const [modelB, setModelB] = useState("");
  const [yearB, setYearB] = useState<number | "">("");

  // States C
  const [modelsC, setModelsC] = useState<string[]>([]);
  const [yearsC, setYearsC] = useState<number[]>([]);
  const [makeC, setMakeC] = useState("");
  const [modelC, setModelC] = useState("");
  const [yearC, setYearC] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);

  // User preferences
  const identity = useMemo<BrowserAuthTokenPayload | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = window.localStorage.getItem('access_token') || window.localStorage.getItem('token');
    return parseBrowserAuthToken(token);
  }, []);

  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (identity?.user_id) {
        try {
          const p = await getRegistrationPreferences({
            user_id: identity.user_id,
            appwrite_id: identity.appwrite_id,
            email: identity.email,
          });
          setPreferences(p);
        } catch (e) {
          console.error('Failed to load user preferences for recommendation', e);
        }
      }
    })();
  }, [identity]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchJSON<CatalogListResponse>(`${API_BASE}/lookup/makes`);
        setMakes(data.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load makes");
      }
    })();
  }, []);

  // Make changes
  useEffect(() => {
    if (!makeA) return;
    (async () => {
      setModelA(""); setYearA(""); setYearsA([]);
      try {
        const data = await fetchJSON<CatalogListResponse>(`${API_BASE}/lookup/models?make=${encodeURIComponent(makeA)}`);
        setModelsA(data.items || []);
      } catch (e) { }
    })();
  }, [makeA]);

  useEffect(() => {
    if (!makeB) return;
    (async () => {
      setModelB(""); setYearB(""); setYearsB([]);
      try {
        const data = await fetchJSON<CatalogListResponse>(`${API_BASE}/lookup/models?make=${encodeURIComponent(makeB)}`);
        setModelsB(data.items || []);
      } catch (e) { }
    })();
  }, [makeB]);

  useEffect(() => {
    if (!makeC) return;
    (async () => {
      setModelC(""); setYearC(""); setYearsC([]);
      try {
        const data = await fetchJSON<CatalogListResponse>(`${API_BASE}/lookup/models?make=${encodeURIComponent(makeC)}`);
        setModelsC(data.items || []);
      } catch (e) { }
    })();
  }, [makeC]);

  // Model changes
  useEffect(() => {
    if (!makeA || !modelA) return;
    (async () => {
      setYearA("");
      try {
        const data = await fetchJSON<YearsListResponse>(`${API_BASE}/lookup/years?make=${encodeURIComponent(makeA)}&model=${encodeURIComponent(modelA)}`);
        setYearsA(data.items || []);
      } catch (e) { }
    })();
  }, [makeA, modelA]);

  useEffect(() => {
    if (!makeB || !modelB) return;
    (async () => {
      setYearB("");
      try {
        const data = await fetchJSON<YearsListResponse>(`${API_BASE}/lookup/years?make=${encodeURIComponent(makeB)}&model=${encodeURIComponent(modelB)}`);
        setYearsB(data.items || []);
      } catch (e) { }
    })();
  }, [makeB, modelB]);

  useEffect(() => {
    if (!makeC || !modelC) return;
    (async () => {
      setYearC("");
      try {
        const data = await fetchJSON<YearsListResponse>(`${API_BASE}/lookup/years?make=${encodeURIComponent(makeC)}&model=${encodeURIComponent(modelC)}`);
        setYearsC(data.items || []);
      } catch (e) { }
    })();
  }, [makeC, modelC]);

  const canCompare = useMemo(() => {
    return makeA && modelA && yearA !== "" &&
      makeB && modelB && yearB !== "" &&
      makeC && modelC && yearC !== "";
  }, [makeA, modelA, yearA, makeB, modelB, yearB, makeC, modelC, yearC]);

  async function onCompare() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        selections: [
          { make: makeA, model: modelA, year: Number(yearA) },
          { make: makeB, model: modelB, year: Number(yearB) },
          { make: makeC, model: modelC, year: Number(yearC) },
        ],
      };

      const res = await fetch(`${API_BASE}/compare/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as any;

      if (!res.ok) {
        const msg = typeof json?.detail === "string" ? json.detail : json?.message || "Compare failed";
        setError(msg);
        return;
      }

      const list: CompareResponse = Array.isArray(json) ? json : json?.items || [];
      setResult(list);

      if (!Array.isArray(list) || list.length < 3) {
        setError("Compare response invalid. Expected 3 vehicles.");
      }
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setMakeA(""); setModelA(""); setYearA(""); setModelsA([]); setYearsA([]);
    setMakeB(""); setModelB(""); setYearB(""); setModelsB([]); setYearsB([]);
    setMakeC(""); setModelC(""); setYearC(""); setModelsC([]); setYearsC([]);
    setResult(null); setError(null);
  }

  // Calculate recommendation based on user preferences and vehicle stats
  const recommendedIndex = useMemo(() => {
    if (!result || result.length < 3) return -1;
    let scores = [0, 0, 0];

    result.forEach((v, i) => {
      if (!v.found) {
        scores[i] = -999;
        return;
      }
      if (!preferences) {
        // Default generic scoring if no preferences are found
        if (v.comb_l_per_100) {
          const val = parseFloat(String(v.comb_l_per_100));
          if (!isNaN(val)) scores[i] += (20 - val);
        }
        return;
      }

      // Matched Fuel Preference
      if (preferences.fuel_preference && v.fuel) {
        const pref = preferences.fuel_preference.toLowerCase();
        const fuel = v.fuel.toLowerCase();
        if (fuel.includes(pref) || (pref === 'petrol' && ['x', 'z'].includes(fuel)) || (pref === 'diesel' && fuel === 'd')) {
          scores[i] += 15;
        }
      }

      // Match Vehicle Type Class
      if (preferences.preferred_vehicle_types?.length && v.vehicle_class) {
        const prefc = preferences.preferred_vehicle_types.map((c: string) => c.toLowerCase());
        const VC = v.vehicle_class.toLowerCase();
        if (prefc.some((c: string) => VC.includes(c) || c.includes(VC))) {
          scores[i] += 15;
        }
      }

      // Priority Preference
      if (preferences.priority === 'Fuel Efficiency' && v.comb_l_per_100) {
        const val = parseFloat(String(v.comb_l_per_100));
        if (!isNaN(val)) scores[i] += (25 - val);
      }

      // Newer model bias
      if (v.year) scores[i] += (v.year - 2000) * 0.2;
    });

    const maxScore = Math.max(...scores);
    if (maxScore < -100) return -1; // All not found
    return scores.indexOf(maxScore);
  }, [result, preferences]);


  const items = result || [];
  const compA = items[0];
  const compB = items[1];
  const compC = items[2];

  const comparisonRows = [
    { label: 'Vehicle Class', a: compA?.vehicle_class, b: compB?.vehicle_class, c: compC?.vehicle_class },
    { label: 'Engine Size', a: compA?.engine_size, b: compB?.engine_size, c: compC?.engine_size },
    { label: 'Engine Type', a: compA?.engine_type, b: compB?.engine_type, c: compC?.engine_type },
    { label: 'Transmission', a: compA?.transmission, b: compB?.transmission, c: compC?.transmission },
    { label: 'Fuel', a: compA?.fuel, b: compB?.fuel, c: compC?.fuel },
    { label: 'COMB (L/100 km)', a: compA?.comb_l_per_100, b: compB?.comb_l_per_100, c: compC?.comb_l_per_100 },
    { label: 'HWY (L/100 km)', a: compA?.hwy_l_per_100, b: compB?.hwy_l_per_100, c: compC?.hwy_l_per_100 },
    { label: 'Tyre Size', a: compA?.tyre_size, b: compB?.tyre_size, c: compC?.tyre_size },
    { label: 'Description', a: compA?.description, b: compB?.description, c: compC?.description },
  ];

  return (
    <div className="af-dashboard-bg min-h-screen">
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 h-14 flex items-center justify-between px-6"
        style={{
          background: 'var(--navbar-bg)',
          borderBottom: '1px solid var(--border-primary)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <ChevronLeft className="h-4 w-4" />
          Back to Search
        </Link>
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4" style={{ color: 'var(--text-accent)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Vehicle Comparison
          </span>
        </div>
        <div className="w-24" />
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Compare Up To 3 Vehicles
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Select make, model, and year for three vehicles to see a side-by-side comparison. Based on your preferences, we will recommend the best option for you.
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border p-4 text-sm"
              style={{
                background: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.25)',
                color: '#f87171',
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Vehicle A */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <Card className="border-[var(--border-primary)] bg-[var(--bg-card)] shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>A</div>
                  <div>
                    <CardTitle className="text-sm" style={{ color: 'var(--text-primary)' }}>Vehicle A</CardTitle>
                    {makeA && modelA && yearA !== "" && <p className="text-xs" style={{ color: 'var(--text-accent)' }}>{makeA} {modelA} ({yearA})</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField value={makeA} onChange={setMakeA} options={makes} placeholder="Select Make" />
                <SelectField value={modelA} onChange={setModelA} options={modelsA} placeholder={makeA ? "Select Model" : "Select Make first"} disabled={!makeA} />
                <Select value={yearA === "" ? undefined : String(yearA)} onValueChange={(v) => setYearA(Number(v))} disabled={!modelA}>
                  <SelectTrigger className="w-full bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)]">
                    <SelectValue placeholder={modelA ? "Select Year" : "Select Model first"} />
                  </SelectTrigger>
                  <SelectContent>{yearsA.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vehicle B */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4">
            <Card className="border-[var(--border-primary)] bg-[var(--bg-card)] shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>B</div>
                  <div>
                    <CardTitle className="text-sm" style={{ color: 'var(--text-primary)' }}>Vehicle B</CardTitle>
                    {makeB && modelB && yearB !== "" && <p className="text-xs text-purple-500">{makeB} {modelB} ({yearB})</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField value={makeB} onChange={setMakeB} options={makes} placeholder="Select Make" />
                <SelectField value={modelB} onChange={setModelB} options={modelsB} placeholder={makeB ? "Select Model" : "Select Make first"} disabled={!makeB} />
                <Select value={yearB === "" ? undefined : String(yearB)} onValueChange={(v) => setYearB(Number(v))} disabled={!modelB}>
                  <SelectTrigger className="w-full bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)]">
                    <SelectValue placeholder={modelB ? "Select Year" : "Select Model first"} />
                  </SelectTrigger>
                  <SelectContent>{yearsB.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vehicle C */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <Card className="border-[var(--border-primary)] bg-[var(--bg-card)] shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>C</div>
                  <div>
                    <CardTitle className="text-sm" style={{ color: 'var(--text-primary)' }}>Vehicle C</CardTitle>
                    {makeC && modelC && yearC !== "" && <p className="text-xs text-orange-500">{makeC} {modelC} ({yearC})</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField value={makeC} onChange={setMakeC} options={makes} placeholder="Select Make" />
                <SelectField value={modelC} onChange={setModelC} options={modelsC} placeholder={makeC ? "Select Model" : "Select Make first"} disabled={!makeC} />
                <Select value={yearC === "" ? undefined : String(yearC)} onValueChange={(v) => setYearC(Number(v))} disabled={!modelC}>
                  <SelectTrigger className="w-full bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-primary)]">
                    <SelectValue placeholder={modelC ? "Select Year" : "Select Model first"} />
                  </SelectTrigger>
                  <SelectContent>{yearsC.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            disabled={!canCompare || loading}
            onClick={onCompare}
            className="py-3 px-6 shadow-md disabled:opacity-50 text-white font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            {loading ? (
              <>
                <span className="af-spinner mr-2" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                Comparing...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Compare 3 Vehicles
              </>
            )}
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            className="py-3 px-5 border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-secondary)] font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {items.length === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              <Card className="rounded-2xl overflow-hidden border-[var(--border-primary)] bg-[var(--bg-card)] gap-0">
                {/* Comparison Header */}
                <div
                  className="grid grid-cols-4 gap-4 px-5 py-6 items-end"
                  style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Specification
                  </div>
                  {[0, 1, 2].map(idx => {
                    const it = items[idx];
                    const isRec = idx === recommendedIndex;
                    return (
                      <div key={idx} className={`relative p-4 rounded-xl transition-all border-2 ${isRec ? 'bg-green-50/50 border-green-500 shadow-sm' : 'border-transparent'}`}>
                        {isRec && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md z-10 whitespace-nowrap">
                            <ShieldCheck className="w-3.5 h-3.5" /> Best Match
                          </div>
                        )}
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: isRec ? '#10b981' : 'var(--text-muted)' }}>
                          Vehicle {['A', 'B', 'C'][idx]}
                        </p>
                        <p className="text-base font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
                          {it?.name || `Vehicle ${['A', 'B', 'C'][idx]}`}
                        </p>
                        {!it?.found && (
                          <p className="text-xs font-bold text-red-500 mt-1">Status: Not found</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Not found warning globally */}
                {(!compA?.found || !compB?.found || !compC?.found) && (
                  <div
                    className="mx-5 my-4 rounded-xl border-l-4 p-4 text-sm font-medium shadow-sm"
                    style={{
                      background: 'rgba(245,158,11,0.06)',
                      borderColor: '#fbbf24',
                      color: '#b45309',
                    }}
                  >
                    {!compA?.found && <div>⚠️ <b>Vehicle A</b>: {compA?.message || "Not found in database."}</div>}
                    {!compB?.found && <div>⚠️ <b>Vehicle B</b>: {compB?.message || "Not found in database."}</div>}
                    {!compC?.found && <div>⚠️ <b>Vehicle C</b>: {compC?.message || "Not found in database."}</div>}
                  </div>
                )}

                {/* Rows */}
                <div className="py-2 px-2">
                  {comparisonRows.map((row) => (
                    <CompareCell key={row.label} label={row.label} a={row.a} b={row.b} c={row.c} />
                  ))}
                </div>

                <div
                  className="px-5 py-4 text-xs font-medium border-t-2"
                  style={{
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-tertiary)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span><b>Best Match</b> is recommended by analyzing your customized vehicle preferences, prioritizing your fuel choice, and vehicle class.</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
