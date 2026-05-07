"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Sparkles } from "lucide-react";

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

import {
  RecommendForm,
  FormValues,
  GroqExtracted,
  DEFAULT_VALUES,
} from "@/components/recommendations/RecommendForm";
import { FinanceSummary } from "@/components/recommendations/FinanceSummary";
import { VehicleCardGrid } from "@/components/recommendations/VehicleCardGrid";
import {
  getSalaryInfo,
  getPurposeClasses,
  intersectClasses,
} from "@/components/recommendations/use-vehicle-classes";

/* ── Types ─────────────────────────────────────────────────── */
interface RecommendResponse {
  message?: string | null;
  count: number;
  items: Record<string, unknown>[];
  finance?: Record<string, unknown>;
}

/* ── Constants ──────────────────────────────────────────────── */
const KM_PER_YEAR = 10_000; // assumption: 10,000 km/year

/* ── Helpers ────────────────────────────────────────────────── */
function asNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function readValue(row: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}
function addOpt<T extends Record<string, unknown>>(
  obj: T, key: string, raw: string,
  parse: (v: string) => unknown = (v) => v,
) {
  if (raw.trim() !== "") obj[key as keyof T] = parse(raw) as T[keyof T];
}

function mergeParams(form: FormValues, groq: GroqExtracted | null) {
  const pick = <T,>(formVal: string, defVal: string, groqVal: T | undefined): string => {
    if (formVal.trim() !== "" && formVal !== defVal) return formVal;
    if (groqVal !== undefined && groqVal !== null) return String(groqVal);
    return formVal;
  };
  const pickOrEmpty = <T,>(formVal: string, groqVal: T | undefined): string => {
    if (formVal.trim() !== "") return formVal;
    if (groqVal !== undefined && groqVal !== null) return String(groqVal);
    return "";
  };
  const rawSalary = pick(form.salary, DEFAULT_VALUES.salary, groq?.salary);
  const salary = parseFloat(rawSalary) || 0;
  return {
    salary,
    purpose: pick(form.purpose, DEFAULT_VALUES.purpose, groq?.purpose),
    area: pick(form.area, DEFAULT_VALUES.area, groq?.area),
    fuel: pickOrEmpty(form.fuel, groq?.fuel),
    transmission: pickOrEmpty(form.transmission, groq?.transmission),
    maxFuel: pickOrEmpty(form.maxFuel, groq?.max_comb_l_per_100),
    rate: pick(form.rate, DEFAULT_VALUES.rate, groq?.rate_of_interest),
    months: pick(form.months, DEFAULT_VALUES.months, groq?.number_of_months),
    dpa: pickOrEmpty(form.dpa, groq?.down_payment_amount),
    dpr: pick(form.dpr, DEFAULT_VALUES.dpr, groq?.down_payment_ratio),
    maintainability: pickOrEmpty(form.maintainability, groq?.maintainability_priority),
  };
}

/* ── Page ───────────────────────────────────────────────────── */
export default function RecommendationPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [groqParams, setGroqParams] = useState<GroqExtracted | null>(null);
  const [groqLoading, setGroqLoading] = useState(false);
  const [groqError, setGroqError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendResponse | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    if (stored) setIsDarkMode(true);
    const handler = (e) => setIsDarkMode(e.detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  const P = isDarkMode ? D : L;

  const handleChange = useCallback((key: keyof FormValues, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  async function handleGroqSearch(text: string) {
    setGroqLoading(true); setGroqError(null); setGroqParams(null);
    try {
      const res = await fetch("/api/groq-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json() as { ok: boolean; params?: GroqExtracted; message?: string };
      if (!res.ok || !json.ok) {
        setGroqError(json.message ?? "Parse failed");
      } else {
        setGroqParams(json.params ?? null);
        handleSubmitWithGroq(json.params ?? null);
        return;
      }
    } catch (e) {
      setGroqError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGroqLoading(false);
    }
  }

  function handleClearGroq() { setGroqParams(null); setGroqError(null); }
  async function handleSubmit() { await handleSubmitWithGroq(groqParams); }

  async function handleSubmitWithGroq(gp: GroqExtracted | null) {
    const merged = mergeParams(values, gp);
    if (!merged.salary) {
      setError("Monthly salary is required. Enter it in the form or mention it in your prompt.");
      return;
    }
    setLoading(true); setError(null); setResults(null);

    const salInfo = getSalaryInfo(merged.salary);
    const purpCls = getPurposeClasses(merged.purpose, merged.area);
    const vcOver = values.vcOverride || (gp?.vehicle_class ?? "");
    const finalCls = vcOver ? [vcOver] : intersectClasses(salInfo.classes, purpCls);

    try {
      const body: Record<string, unknown> = {
        salary: merged.salary,
        purpose: merged.purpose,
        area: merged.area,
        vehicle_classes: finalCls,
      };
      if (vcOver) body.vehicle_class = vcOver;
      if (merged.maintainability) body.maintainability_priority = merged.maintainability;
      if (merged.fuel) body.fuel = merged.fuel;
      if (merged.transmission) body.transmission = merged.transmission;
      addOpt(body, "rate_of_interest", merged.rate, parseFloat);
      addOpt(body, "number_of_months", merged.months, parseInt);
      addOpt(body, "down_payment_ratio", merged.dpr, parseFloat);
      addOpt(body, "down_payment_amount", merged.dpa, parseFloat);
      addOpt(body, "max_comb_l_per_100", merged.maxFuel, parseFloat);
      addOpt(body, "top_n", values.topN, parseInt);
      addOpt(body, "candidate_limit", values.candidateLimit, parseInt);

      const res = await fetch(`${API_BASE}/recommendations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as RecommendResponse;
      if (!res.ok) throw new Error(JSON.stringify(data, null, 2));

      /* ── Enrich items with calculated fuel costs ──
         The backend now includes fuel_price and fuel_efficiency_combined
         and maintenance_yearly_cost / maintenance_monthly_cost directly.
         We just compute the derived annual/monthly fuel cost here. */
      const enriched = (data.items || []).map((item) => {
        const next = { ...item };

        const fuelPrice = asNumber(readValue(item, ["fuel_price"]));
        const comb      = asNumber(readValue(item, ["fuel_efficiency_combined", "COMB (L/100 km)"]));

        // Annual fuel cost = fuelPrice (LKR/L) × (km_per_year / 100) × comb (L/100km)
        if (fuelPrice !== null && comb !== null) {
          next.annual_fuel_cost   = fuelPrice * (KM_PER_YEAR / 100) * comb;
          next.monthly_fuel_cost  = (next.annual_fuel_cost as number) / 12;
        }
        next.km_per_year_assumption = KM_PER_YEAR;

        return next;
      });

      setResults({ ...data, items: enriched });
      if (!values.salary) setValues((p) => ({ ...p, salary: String(merged.salary) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false); setGroqLoading(false);
    }
  }

  const merged   = mergeParams(values, groqParams);
  const salInfo  = getSalaryInfo(merged.salary);
  const purpCls  = getPurposeClasses(merged.purpose, merged.area);
  const vcOver   = values.vcOverride || (groqParams?.vehicle_class ?? "");
  const finalCls = vcOver ? [vcOver] : intersectClasses(salInfo.classes, purpCls);

  const items    = results?.items || [];
  const finance  = results?.finance || {};
  const hasItems = items.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-full pb-12 pt-6 px-4 xl:px-6 relative overflow-hidden transition-colors duration-500 rounded-[32px] m-3 min-h-[calc(100vh-100px)]"
      style={{ background: P.bg, margin: '1px' }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-6">
        <RecommendForm
          values={values}
          loading={loading}
          groqParams={groqParams}
          groqLoading={groqLoading}
          groqError={groqError}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onGroqSearch={handleGroqSearch}
          onClearGroq={handleClearGroq}
        />

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 rounded-3xl border p-6 text-sm flex items-start gap-4 shadow-sm backdrop-blur-md"
              style={{ background: isDarkMode ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.02)', borderColor: isDarkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.3)', color: "#ef4444" }}
            >
              <div className="flex-1">
                <strong className="block text-base mb-1">Error</strong>
                <pre className="whitespace-pre-wrap text-xs opacity-90 font-medium">{error}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(loading || groqLoading) && (
          <div className="flex flex-col items-center justify-center gap-5 py-24 transition-colors duration-500">
            <div className="relative h-14 w-14">
              <div className="absolute inset-0 rounded-full border-4 transition-colors duration-500" style={{ borderColor: P.border }} />
              <div className="absolute inset-0 rounded-full border-4 border-b-transparent border-l-transparent animate-spin" style={{ borderColor: P.primary }} />
            </div>
            <p className="text-sm font-bold tracking-widest uppercase transition-colors duration-500" style={{ color: P.muted }}>
              {groqLoading ? "Parsing request with AI..." : "Fetching recommendations..."}
            </p>
          </div>
        )}

        {!loading && !groqLoading && !results && !error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative overflow-hidden rounded-3xl border p-12 text-center shadow-sm max-w-md mx-auto transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}>
              <div className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${P.primary}, transparent 50%)` }} />
              
              <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl shadow-sm transition-colors duration-500"
                style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF' }}>
                <Car className="h-10 w-10" style={{ color: P.primary }} />
              </div>
              <p className="text-2xl font-black transition-colors duration-500" style={{ color: P.text }}>Describe what you need</p>
              <p className="mt-3 text-sm font-medium transition-colors duration-500 leading-relaxed max-w-[280px] mx-auto" style={{ color: P.muted }}>
                Type a prompt above — mention salary, purpose, and fuel type — and hit <strong style={{ color: P.primary }}>AI Search</strong> to find your perfect vehicle.
              </p>
            </div>
          </div>
        )}

        {!loading && !groqLoading && results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight transition-colors duration-500" style={{ color: P.text }}>Analysis Results</h2>
                <p className="mt-1.5 text-sm font-medium transition-colors duration-500" style={{ color: P.muted }}>
                  {hasItems
                    ? `${items.length} top vehicle${items.length !== 1 ? "s" : ""} matched your exact profile.`
                    : results.message || "No results found."}
                </p>
              </div>
              {hasItems && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md transition-all duration-500"
                  style={{ background: `linear-gradient(135deg, ${P.primary}, #1d4ed8)`, color: '#ffffff' }}>
                  <Sparkles className="h-4 w-4" /> AI Optimized
                </div>
              )}
            </div>

            <FinanceSummary finance={finance} salary={merged.salary} purpose={merged.purpose}
              area={merged.area} vehicleClasses={finalCls} />

            {hasItems ? (
              <VehicleCardGrid items={items} />
            ) : (
              <div className="relative overflow-hidden rounded-3xl border p-16 text-center shadow-sm mt-8 transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at 50% 0%, #f43f5e, transparent 50%)` }} />
                <Car className="mx-auto mb-6 h-16 w-16 transition-colors duration-500" style={{ color: P.muted }} />
                <p className="text-2xl font-black transition-colors duration-500" style={{ color: P.text }}>{results.message || "No vehicles found."}</p>
                <p className="mt-2 text-sm font-medium transition-colors duration-500" style={{ color: P.muted }}>Try broadening your salary range or relaxing your specific filters to find more options.</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
