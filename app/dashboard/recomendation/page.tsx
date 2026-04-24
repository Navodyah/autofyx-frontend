"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Sparkles } from "lucide-react";

import {
  RecommendForm,
  FormValues,
  GroqExtracted,
  DEFAULT_VALUES,
} from "@/components/recommendations/RecommendForm";
import { FinanceSummary }  from "@/components/recommendations/FinanceSummary";
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
interface FuelTypeResponse {
  fuel_type_id: number;
  fuel_price?: number | null;
}

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

/**
 * Merge groq-extracted params with manual form values.
 * Rule: if a form field differs from its DEFAULT, it wins (priority 1).
 *       Otherwise the groq-extracted value is used (priority 2).
 */
function mergeParams(form: FormValues, groq: GroqExtracted | null): {
  salary: number;
  purpose: string;
  area: string;
  fuel: string;
  transmission: string;
  maxFuel: string;
  rate: string;
  months: string;
  dpa: string;
  dpr: string;
  maintainability: string;
} {
  // helpers
  const pick = <T,>(formVal: string, defVal: string, groqVal: T | undefined): string => {
    if (formVal.trim() !== "" && formVal !== defVal) return formVal;   // manual wins
    if (groqVal !== undefined && groqVal !== null) return String(groqVal);
    return formVal;
  };
  const pickOrEmpty = <T,>(formVal: string, groqVal: T | undefined): string => {
    if (formVal.trim() !== "") return formVal;                         // manual wins
    if (groqVal !== undefined && groqVal !== null) return String(groqVal);
    return "";
  };

  const rawSalary = pick(form.salary, DEFAULT_VALUES.salary, groq?.salary);
  const salary   = parseFloat(rawSalary) || 0;

  return {
    salary,
    purpose:        pick(form.purpose,  DEFAULT_VALUES.purpose,  groq?.purpose),
    area:           pick(form.area,     DEFAULT_VALUES.area,      groq?.area),
    fuel:           pickOrEmpty(form.fuel,         groq?.fuel),
    transmission:   pickOrEmpty(form.transmission, groq?.transmission),
    maxFuel:        pickOrEmpty(form.maxFuel,       groq?.max_comb_l_per_100),
    rate:           pick(form.rate,    DEFAULT_VALUES.rate,    groq?.rate_of_interest),
    months:         pick(form.months,  DEFAULT_VALUES.months,  groq?.number_of_months),
    dpa:            pickOrEmpty(form.dpa, groq?.down_payment_amount),
    dpr:            pick(form.dpr, DEFAULT_VALUES.dpr, groq?.down_payment_ratio),
    maintainability: pickOrEmpty(form.maintainability, groq?.maintainability_priority),
  };
}

/* ── Page ───────────────────────────────────────────────────── */
export default function RecommendationPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [values,      setValues]      = useState<FormValues>(DEFAULT_VALUES);
  const [groqParams,  setGroqParams]  = useState<GroqExtracted | null>(null);
  const [groqLoading, setGroqLoading] = useState(false);
  const [groqError,   setGroqError]   = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [results,     setResults]     = useState<RecommendResponse | null>(null);

  const handleChange = useCallback((key: keyof FormValues, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  /* ── Groq parse ─────────────────────────────────────────────── */
  async function handleGroqSearch(text: string) {
    setGroqLoading(true);
    setGroqError(null);
    setGroqParams(null);

    try {
      const res  = await fetch("/api/groq-parse", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text }),
      });
      const json = await res.json() as { ok: boolean; params?: GroqExtracted; message?: string };

      if (!res.ok || !json.ok) {
        setGroqError(json.message ?? "Parse failed");
      } else {
        setGroqParams(json.params ?? null);
        // Auto-submit after successful extraction
        handleSubmitWithGroq(json.params ?? null);
        return; // handleSubmitWithGroq sets loading
      }
    } catch (e) {
      setGroqError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGroqLoading(false);
    }
  }

  function handleClearGroq() {
    setGroqParams(null);
    setGroqError(null);
  }

  /* ── Recommendation submit ─────────────────────────────────── */
  async function handleSubmit() {
    await handleSubmitWithGroq(groqParams);
  }

  async function handleSubmitWithGroq(gp: GroqExtracted | null) {
    const merged = mergeParams(values, gp);
    if (!merged.salary) {
      setError("Monthly salary is required. Enter it in the form or mention it in your prompt.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const salInfo  = getSalaryInfo(merged.salary);
    const purpCls  = getPurposeClasses(merged.purpose, merged.area);
    const vcOver   = values.vcOverride || (gp?.vehicle_class ?? "");
    const finalCls = vcOver ? [vcOver] : intersectClasses(salInfo.classes, purpCls);

    try {
      const body: Record<string, unknown> = {
        salary:          merged.salary,
        purpose:         merged.purpose,
        area:            merged.area,
        vehicle_classes: finalCls,
      };
      if (vcOver) body.vehicle_class = vcOver;
      if (merged.maintainability) body.maintainability_priority = merged.maintainability;
      if (merged.fuel)           body.fuel           = merged.fuel;
      if (merged.transmission)   body.transmission   = merged.transmission;
      addOpt(body, "rate_of_interest",   merged.rate,    parseFloat);
      addOpt(body, "number_of_months",   merged.months,  parseInt);
      addOpt(body, "down_payment_ratio", merged.dpr,     parseFloat);
      addOpt(body, "down_payment_amount",merged.dpa,     parseFloat);
      addOpt(body, "max_comb_l_per_100", merged.maxFuel, parseFloat);
      addOpt(body, "top_n",          values.topN,           parseInt);
      addOpt(body, "candidate_limit",values.candidateLimit, parseInt);

      const res  = await fetch(`${API_BASE}/recommendations/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = (await res.json()) as RecommendResponse;
      if (!res.ok) throw new Error(JSON.stringify(data, null, 2));

      /* Fuel cost enrichment */
      const uniqueFuelIds = Array.from(new Set(
        (data.items || [])
          .map((item) => asNumber(readValue(item, ["fuel_type_id"])))
          .filter((v): v is number => v !== null),
      ));
      const fuelPriceMap = new Map<number, number | null>();
      await Promise.all(
        uniqueFuelIds.map(async (fuelId) => {
          try {
            const fr = await fetch(`${API_BASE}/fuel_types/${fuelId}`);
            const fj = (await fr.json()) as FuelTypeResponse;
            fuelPriceMap.set(fuelId, fr.ok ? asNumber(fj.fuel_price) : null);
          } catch { fuelPriceMap.set(fuelId, null); }
        }),
      );
      const enriched = (data.items || []).map((item) => {
        const next     = { ...item };
        const fuelId   = asNumber(readValue(item, ["fuel_type_id"]));
        const fuelPrice =
          asNumber(readValue(item, ["fuel_price"])) ??
          (fuelId !== null ? (fuelPriceMap.get(fuelId) ?? null) : null);
        const comb = asNumber(readValue(item, ["COMB (L/100 km)", "COMB_L_100", "comb_l_100"]));
        next.fuel_price = fuelPrice;
        if (fuelPrice !== null && comb !== null) next.fuel_cost = fuelPrice * comb * 100;
        return next;
      });

      setResults({ ...data, items: enriched });
      // Store merged salary back so FinanceSummary sees it
      if (!values.salary) {
        setValues((p) => ({ ...p, salary: String(merged.salary) }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
      setGroqLoading(false);
    }
  }

  /* Derived display values */
  const merged   = mergeParams(values, groqParams);
  const salInfo  = getSalaryInfo(merged.salary);
  const purpCls  = getPurposeClasses(merged.purpose, merged.area);
  const vcOver   = values.vcOverride || (groqParams?.vehicle_class ?? "");
  const finalCls = vcOver ? [vcOver] : intersectClasses(salInfo.classes, purpCls);

  const items    = results?.items    || [];
  const finance  = results?.finance  || {};
  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen">
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

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 rounded-2xl border p-4 text-sm"
            style={{ background: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.25)", color: "#ef4444" }}
          >
            <strong>Error</strong>
            <pre className="mt-1 whitespace-pre-wrap text-xs opacity-80">{error}</pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {(loading || groqLoading) && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-400">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
            <div className="absolute inset-0 rounded-full border-[3px] border-t-cyan-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            {groqLoading ? "Parsing your request with AI…" : "Fetching recommendations…"}
          </p>
        </div>
      )}

      {/* Placeholder */}
      {!loading && !groqLoading && !results && !error && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm max-w-sm mx-auto">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg, #e0f2fe, #e0e7ff)" }}
            >
              <Car className="h-7 w-7 text-cyan-600" />
            </div>
            <p className="font-semibold text-slate-700">Describe what you&apos;re looking for</p>
            <p className="mt-1 text-xs text-slate-400">
              Type a prompt above — mention salary, purpose, fuel type — and hit <strong>AI Search</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !groqLoading && results && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recommendations</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {hasItems
                  ? `${items.length} vehicle${items.length !== 1 ? "s" : ""} matched your profile`
                  : results.message || "No results"}
              </p>
            </div>
            {hasItems && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #0891b2, #4f46e5)" }}
              >
                <Sparkles className="h-3 w-3" /> AI Ranked
              </span>
            )}
          </div>

          <FinanceSummary
            finance={finance}
            salary={merged.salary}
            purpose={merged.purpose}
            area={merged.area}
            vehicleClasses={finalCls}
          />

          {hasItems ? (
            <VehicleCardGrid items={items} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Car className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="font-semibold text-slate-600">{results.message || "No vehicles found."}</p>
              <p className="mt-1 text-sm text-slate-400">Try broadening your salary range or relaxing filters.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
