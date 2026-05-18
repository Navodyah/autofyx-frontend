"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PublicNavbar } from "@/components/PublicNavbar";

/* ── New public-landing dark-themed components ── */
import { PublicRecommendForm } from "@/components/public-recommendations/PublicRecommendForm";
import { PublicFinanceSummary } from "@/components/public-recommendations/PublicFinanceSummary";
import { PublicVehicleCardGrid } from "@/components/public-recommendations/PublicVehicleCardGrid";

/* ── Shared types + logic from the original form ── */
import {
  type FormValues,
  type GroqExtracted,
  DEFAULT_VALUES,
} from "@/components/recommendations/RecommendForm";
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

const KM_PER_YEAR = 10_000;

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

export default function PublicRecommendPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [values, setValues] = useState<FormValues>(DEFAULT_VALUES);
  const [groqParams, setGroqParams] = useState<GroqExtracted | null>(null);
  const [groqLoading, setGroqLoading] = useState(false);
  const [groqError, setGroqError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendResponse | null>(null);

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

      const enriched = (data.items || []).map((item) => {
        const next = { ...item };
        const fuelPrice = asNumber(readValue(item, ["fuel_price"]));
        const comb = asNumber(readValue(item, ["fuel_efficiency_combined", "COMB (L/100 km)"]));
        if (fuelPrice !== null && comb !== null) {
          next.annual_fuel_cost = fuelPrice * (KM_PER_YEAR / 100) * comb;
          next.monthly_fuel_cost = (next.annual_fuel_cost as number) / 12;
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

  const merged = mergeParams(values, groqParams);
  const salInfo = getSalaryInfo(merged.salary);
  const purpCls = getPurposeClasses(merged.purpose, merged.area);
  const vcOver = values.vcOverride || (groqParams?.vehicle_class ?? "");
  const finalCls = vcOver ? [vcOver] : intersectClasses(salInfo.classes, purpCls);
  const items = results?.items || [];
  const finance = results?.finance || {};
  const hasItems = items.length > 0;

  return (
    <>
      <LoadingScreen duration={1500} />
      <div className="min-h-screen bg-[#0a0a0c] text-zinc-50 font-sans overflow-x-hidden">

        {/* ── Ambient Lighting (matching landing page) ── */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-[#2a2a30]/15 blur-[150px] rounded-[100%]"
          />
          <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* ── Navbar ── */}
        <PublicNavbar />

        {/* ── Page Hero ── */}
        <div className="relative z-10 pt-36 pb-12 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, type: "spring", stiffness: 100 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-xs font-medium tracking-widest uppercase mb-8 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              AI-Powered Vehicle Matching
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-[4.5rem] font-light tracking-tight text-white mb-6 leading-[1.1]">
              Find Your{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 relative">
                Perfect Vehicle.
                <motion.span
                  initial={{ left: 0 }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
                  className="absolute top-0 bottom-0 w-[1px] bg-white/20 blur-[1px]"
                />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
              Describe your needs in plain English, or use the advanced filters below. Our AI analyzes your lifestyle,
              financial parameters, and driving habits to find your ideal match.
            </p>
          </motion.div>
        </div>

        {/* ── Main Content ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-24 space-y-8">

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f13]/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl"
          >
            {/* Subtle inner top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-white/[0.015] blur-3xl rounded-full pointer-events-none" />

            <PublicRecommendForm
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
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400 flex items-start gap-4 backdrop-blur-sm"
              >
                <div className="flex-1">
                  <strong className="block text-base mb-1 text-red-300">Error</strong>
                  <pre className="whitespace-pre-wrap text-xs opacity-90 font-medium">{error}</pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {(loading || groqLoading) && (
            <div className="flex flex-col items-center justify-center gap-5 py-28">
              {/* Animated scanning car */}
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border border-white/5" />
                <div className="absolute inset-0 rounded-full border border-b-transparent border-l-transparent border-blue-500/60 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-b-transparent border-r-transparent border-indigo-500/40 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold tracking-widest uppercase text-zinc-400">
                  {groqLoading ? "Parsing request with AI…" : "Fetching recommendations…"}
                </p>
                <p className="text-xs text-zinc-600">Processing against 850+ vehicle models</p>
              </div>
            </div>
          )}

          {/* Empty / Prompt State */}
          {!loading && !groqLoading && !results && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f13]/80 p-14 text-center max-w-md mx-auto backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.25), transparent 60%)" }}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 border border-blue-500/20">
                  <Car className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-2xl font-semibold text-white tracking-tight">Describe what you need</p>
                <p className="mt-3 text-sm font-light text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
                  Type a prompt above — mention salary, purpose, and fuel type — and hit{" "}
                  <strong className="text-blue-400 font-semibold">AI Search</strong> to find your perfect vehicle.
                </p>
                <div className="mt-8 pt-6 border-t border-white/5">
                  <p className="text-xs text-zinc-600 mb-3">Want full dashboard features?</p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25"
                  >
                    <Sparkles className="w-4 h-4" />
                    Create Free Account
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Results ── */}
          {!loading && !groqLoading && results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Results Header */}
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white">
                    Analysis{" "}
                    <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
                      Results
                    </span>
                  </h2>
                  <p className="mt-1.5 text-sm font-light text-zinc-400">
                    {hasItems
                      ? `${items.length} top vehicle${items.length !== 1 ? "s" : ""} matched your profile.`
                      : results.message || "No results found."}
                  </p>
                </div>
                {hasItems && (
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-blue-500/25 bg-blue-500/10 text-blue-300">
                      <Sparkles className="h-3.5 w-3.5" /> AI Optimized
                    </div>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Save Results <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              <PublicFinanceSummary
                finance={finance}
                salary={merged.salary}
                purpose={merged.purpose}
                area={merged.area}
                vehicleClasses={finalCls}
              />

              {hasItems ? (
                <PublicVehicleCardGrid items={items} />
              ) : (
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f13]/80 p-16 text-center backdrop-blur-sm">
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle at 50% 0%, #f43f5e, transparent 50%)" }}
                  />
                  <Car className="mx-auto mb-6 h-16 w-16 text-zinc-700" />
                  <p className="text-2xl font-semibold text-white">{results.message || "No vehicles found."}</p>
                  <p className="mt-2 text-sm font-light text-zinc-500">
                    Try broadening your salary range or relaxing specific filters.
                  </p>
                </div>
              )}

              {/* CTA Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#18181c] to-[#0d0d10] border border-white/10 p-12 md:p-16 text-center shadow-2xl"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-white/[0.02] blur-3xl opacity-50 rounded-full pointer-events-none" />

                <h3 className="text-3xl md:text-4xl font-light text-zinc-300 mb-4 tracking-tight relative z-10">
                  Like what you see?{" "}
                  <span className="font-semibold text-white">Start driving.</span>
                </h3>
                <p className="text-zinc-500 max-w-xl mx-auto mb-8 font-light leading-relaxed relative z-10">
                  Create a free account to save your garage, compare vehicles side-by-side, and get personalised alerts when prices drop.
                </p>
                <div className="flex items-center justify-center gap-4 relative z-10">
                  <Link
                    href="/login"
                    className="px-6 py-3 border border-white/10 text-zinc-400 hover:text-white text-sm font-medium rounded-full transition-colors"
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white text-sm font-semibold tracking-wide hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25"
                    >
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* ── Minimal Footer ── */}
        <footer className="relative z-10 bg-[#08080a] border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 border border-zinc-700 bg-gradient-to-br from-zinc-800 to-black text-white flex items-center justify-center rounded-sm">
                <Car className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-zinc-400">AutoFyx</span>
            </div>
            <p className="text-zinc-700 text-xs">
              © {new Date().getFullYear()} AutoFyx Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-zinc-600 hover:text-white transition-colors text-xs">Home</Link>
              <Link href="/about" className="text-zinc-600 hover:text-white transition-colors text-xs">About</Link>
              <Link href="/register" className="text-zinc-600 hover:text-white transition-colors text-xs">Register</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
