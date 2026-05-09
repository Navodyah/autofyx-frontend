"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, SlidersHorizontal, ChevronUp, Cpu, DollarSign, Info, Sparkles, X } from "lucide-react";
import { ClassPreview } from "./ClassPreview";
import { ShineBorder } from "@/components/magicui/shine-border";
import { BorderBeam } from "@/components/magicui/border-beam";

// ── Palettes ───────────────────────────────────────────────────
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

export interface FormValues {
  salary: string;
  purpose: string;
  area: string;
  maintainability: string;
  fuel: string;
  transmission: string;
  maxFuel: string;
  rate: string;
  months: string;
  dpr: string;
  dpa: string;
  vcOverride: string;
  topN: string;
  candidateLimit: string;
}

/** Fields that count as "manually touched" (i.e. changed from defaults) */
export const DEFAULT_VALUES: FormValues = {
  salary: "",
  purpose: "daily_commute",
  area: "mixed",
  maintainability: "",
  fuel: "",
  transmission: "",
  maxFuel: "",
  rate: "13",
  months: "60",
  dpr: "0.5",
  dpa: "",
  vcOverride: "",
  topN: "8",
  candidateLimit: "2000",
};

export interface GroqExtracted {
  salary?: number;
  purpose?: string;
  area?: string;
  fuel?: string;
  transmission?: string;
  max_comb_l_per_100?: number;
  vehicle_class?: string;
  rate_of_interest?: number;
  number_of_months?: number;
  down_payment_amount?: number;
  down_payment_ratio?: number;
  maintainability_priority?: string;
}

interface RecommendFormProps {
  values: FormValues;
  loading: boolean;
  groqParams: GroqExtracted | null;
  groqLoading: boolean;
  groqError: string | null;
  onChange: (key: keyof FormValues, value: string) => void;
  onSubmit: () => void;
  onGroqSearch: (text: string) => void;
  onClearGroq: () => void;
}

const SUGGESTIONS = [
  "Electric vehicle for city use",
  "Performance highway car",
  "Off-road luxury SUV with diesel",
  "Family van, monthly salary 300k",
];

const FUEL_PILLS = [
  { label: "Any", value: "" },
  { label: "Petrol", value: "X" },
  { label: "Premium", value: "Z" },
  { label: "Diesel", value: "D" },
  { label: "Electric", value: "E" },
];

const sel = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all";
const inp = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-slate-400";

function FL({ text, P }: { text: string, P: any }) {
  return <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest transition-colors duration-500" style={{ color: P.muted }}>{text}</p>;
}

export function RecommendForm({
  values, loading, groqParams, groqLoading, groqError,
  onChange, onSubmit, onGroqSearch, onClearGroq,
}: RecommendFormProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const salary = parseFloat(values.salary) || 0;

  useEffect(() => {
    const handler = () => setIsDarkMode(prev => !prev);
    window.addEventListener('themeToggle', handler);
    return () => window.removeEventListener('themeToggle', handler);
  }, []);

  const P = isDarkMode ? D : L;

  const sel = `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-all duration-300`;
  const inp = `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition-all duration-300 placeholder:opacity-50`;

  function handleSuggestion(s: string) {
    setPrompt(s);
    onGroqSearch(s);
  }

  function handleSearch() {
    if (prompt.trim()) onGroqSearch(prompt.trim());
    else onSubmit();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden rounded-3xl mb-8 px-8 py-12 text-center border shadow-sm transition-colors duration-500"
        style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}
      >
        <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full mix-blend-multiply blur-3xl opacity-20 transition-colors duration-500" style={{ background: P.primary }} />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full mix-blend-multiply blur-3xl opacity-20 transition-colors duration-500" style={{ background: isDarkMode ? '#10b981' : '#3b82f6' }} />
        <div className="relative">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors duration-500"
            style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF', borderColor: P.border, color: P.primary }}>
            <Cpu className="h-3.5 w-3.5" /> Next-Gen Automotive Intelligence
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl transition-colors duration-500" style={{ color: P.text }}>
            AI Vehicle Recommender
          </h1>
          <p className="mt-3 text-sm font-medium max-w-lg mx-auto leading-relaxed transition-colors duration-500" style={{ color: P.muted }}>
            Describe what you need — salary, purpose, fuel type, budget — and our AI will find your perfect match.
          </p>
        </div>
      </div>

      {/* ── Prompt Search Bar ── */}
      <div className="mb-4 w-full">
        <ShineBorder
          borderRadius={16}
          borderWidth={1.5}
          duration={8}
          color={isDarkMode ? ["#3b82f6", "#8b5cf6", "#ec4899"] : ["#155dfc", "#3b82f6", "#93c5fd"]}
          className="w-full !p-0 !min-w-0 bg-transparent dark:bg-transparent border-0 shadow-sm transition-colors duration-500"
        >
          <div className="flex items-center gap-3 w-full rounded-2xl border p-2 transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>
            <Sparkles className="ml-3 h-5 w-5 flex-shrink-0 transition-colors duration-500" style={{ color: P.primary }} />
            <input
              id="rec-prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "Family SUV for city, diesel, salary 300k, 60 months loan"'
              className="flex-1 bg-transparent text-sm font-medium focus:outline-none transition-colors duration-500 placeholder:opacity-50 z-10"
              style={{ color: P.text }}
            />
            {prompt && (
              <button
                type="button"
                onClick={() => { setPrompt(""); onClearGroq(); }}
                className="rounded-full p-1 transition-colors duration-500 z-10"
                style={{ color: P.muted }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              id="rec-submit"
              type="button"
              onClick={handleSearch}
              disabled={loading || groqLoading}
              className="relative overflow-hidden flex-shrink-0 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black uppercase tracking-widest shadow-md disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] z-10"
              style={{ background: `linear-gradient(135deg, ${P.primary}, #1d4ed8)`, color: '#ffffff' }}
            >
              <BorderBeam size={60} duration={4} delay={0} className="opacity-80" />
              {(loading || groqLoading) ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin relative z-20" />
              ) : (
                <Cpu className="h-4 w-4 relative z-20" />
              )}
              <span className="relative z-20">{groqLoading ? "Parsing…" : loading ? "Searching…" : "AI Search"}</span>
            </button>
          </div>
        </ShineBorder>
      </div>

      {/* ── Groq parse error ── */}
      {groqError && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
          AI parse failed: {groqError}. Using form values only.
        </div>
      )}

      {/* ── Groq extracted params pill row ── */}
      {groqParams && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border px-5 py-3 transition-colors duration-500 shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF', borderColor: P.border }}>
          <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-colors duration-500" style={{ color: P.primary }}>AI extracted:</span>
          {groqParams.salary && (
            <Pill label={`Salary LKR ${groqParams.salary.toLocaleString()}`} P={P} isDarkMode={isDarkMode} />
          )}
          {groqParams.purpose && <Pill label={`Purpose: ${groqParams.purpose.replace("_", " ")}`} P={P} isDarkMode={isDarkMode} />}
          {groqParams.area && <Pill label={`Area: ${groqParams.area}`} P={P} isDarkMode={isDarkMode} />}
          {groqParams.fuel && <Pill label={`Fuel: ${groqParams.fuel}`} P={P} isDarkMode={isDarkMode} />}
          {groqParams.transmission && <Pill label={`Trans: ${groqParams.transmission}`} P={P} isDarkMode={isDarkMode} />}
          {groqParams.max_comb_l_per_100 && <Pill label={`≤${groqParams.max_comb_l_per_100} L/100`} P={P} isDarkMode={isDarkMode} />}
          {groqParams.vehicle_class && <Pill label={groqParams.vehicle_class} P={P} isDarkMode={isDarkMode} />}
          {groqParams.rate_of_interest && <Pill label={`${groqParams.rate_of_interest}% int.`} P={P} isDarkMode={isDarkMode} />}
          {groqParams.number_of_months && <Pill label={`${groqParams.number_of_months} mo`} P={P} isDarkMode={isDarkMode} />}
          <button
            type="button"
            onClick={onClearGroq}
            className="ml-auto text-[10px] font-bold underline transition-colors duration-500"
            style={{ color: P.muted }}
          >
            clear
          </button>
        </div>
      )}

      {/* ── Quick suggestions ── */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest transition-colors duration-500" style={{ color: P.muted }}>Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestion(s)}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5"
            style={{ background: P.cardBg, borderColor: P.border, color: P.text }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Advanced Filters toggle ── */}
      <button
        type="button"
        onClick={() => setFiltersOpen((o) => !o)}
        className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-colors duration-500"
        style={{ color: P.primary }}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Advanced Filters
        {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span className="ml-1 text-[10px] font-bold lowercase tracking-normal opacity-60">(manual selections override AI)</span>
      </button>

      {/* ── Filter Panels ── */}
      {filtersOpen && (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Vehicle Specifications */}
          <div className="relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>
            <div className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at 0% 0%, ${P.primary}, transparent 70%)` }} />
            <div className="relative z-10 mb-5 flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF' }}>
                <Cpu className="h-4 w-4" style={{ color: P.primary }} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest transition-colors duration-500" style={{ color: P.text }}>Vehicle Specifications</span>
            </div>

            {/* Salary manual override */}
            <div className="relative z-10 mb-4">
              <FL text="Monthly Salary (LKR)" P={P} />
              <input
                id="rec-salary"
                type="number"
                min={1}
                placeholder={groqParams?.salary ? `AI: ${groqParams.salary.toLocaleString()}` : "e.g. 250000"}
                className={inp}
                style={{ background: P.bg, borderColor: P.border, color: P.text }}
                value={values.salary}
                onChange={(e) => onChange("salary", e.target.value)}
              />
              {!values.salary && groqParams?.salary && (
                <p className="mt-1.5 text-[10px] font-bold" style={{ color: P.primary }}>Using AI-extracted: LKR {groqParams.salary.toLocaleString()}</p>
              )}
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
              <div>
                <FL text="Purpose" P={P} />
                <select id="rec-purpose" className={sel} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.purpose} onChange={(e) => onChange("purpose", e.target.value)}>
                  <option value="daily_commute">Commuting</option>
                  <option value="family">Family</option>
                  <option value="performance">Performance</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div>
                <FL text="Driving Area" P={P} />
                <select id="rec-area" className={sel} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.area} onChange={(e) => onChange("area", e.target.value)}>
                  <option value="city">Urban/City</option>
                  <option value="mixed">Mixed</option>
                  <option value="highway">Highway</option>
                  <option value="off-road">Off-Road</option>
                </select>
              </div>
            </div>

            <div className="relative z-10 mb-4">
              <FL text="Fuel Type" P={P} />
              <div className="flex flex-wrap gap-2">
                {FUEL_PILLS.map((fp) => (
                  <button
                    key={fp.value}
                    type="button"
                    onClick={() => onChange("fuel", fp.value)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all shadow-sm ${values.fuel === fp.value
                      ? ""
                      : "hover:-translate-y-0.5"
                      }`}
                    style={values.fuel === fp.value ? { background: P.primary, borderColor: P.primary, color: '#fff' } : { background: P.bg, borderColor: P.border, color: P.text }}
                  >
                    {fp.label}
                  </button>
                ))}
              </div>
              {values.fuel === "" && groqParams?.fuel && (
                <p className="mt-1.5 text-[10px] font-bold" style={{ color: P.primary }}>AI suggested: {groqParams.fuel}</p>
              )}
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
              <div>
                <FL text="Transmission" P={P} />
                <select id="rec-trans" className={sel} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.transmission} onChange={(e) => onChange("transmission", e.target.value)}>
                  <option value="">Any</option>
                  <option value="A">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <FL text="Max L/100km" P={P} />
                <input id="rec-maxfuel" type="number" step={0.5} min={0}
                  placeholder={groqParams?.max_comb_l_per_100 ? String(groqParams.max_comb_l_per_100) : "e.g. 10"}
                  className={inp} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.maxFuel} onChange={(e) => onChange("maxFuel", e.target.value)} />
              </div>
            </div>

            <div className="relative z-10 mb-4">
              <FL text="Maintainability" P={P} />
              <select id="rec-maint" className={sel} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.maintainability} onChange={(e) => onChange("maintainability", e.target.value)}>
                <option value="">Auto (by income tier)</option>
                <option value="high">High – Japanese/Korean</option>
                <option value="average">Average – Balanced</option>
                <option value="none">None – No bias</option>
              </select>
            </div>

            <div className="relative z-10">
              <ClassPreview salary={salary || (groqParams?.salary ?? 0)} purpose={values.purpose} area={values.area} />
            </div>
          </div>

          {/* Financial Parameters */}
          <div className="relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>
            <div className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at 100% 0%, ${P.primary}, transparent 70%)` }} />
            <div className="relative z-10 mb-5 flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF' }}>
                <DollarSign className="h-4 w-4" style={{ color: P.primary }} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest transition-colors duration-500" style={{ color: P.text }}>Financial Parameters</span>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
              <div>
                <FL text="Duration (Months)" P={P} />
                <input id="rec-months" type="number" min={1}
                  placeholder={groqParams?.number_of_months ? String(groqParams.number_of_months) : "60"}
                  className={inp} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.months} onChange={(e) => onChange("months", e.target.value)} />
              </div>
              <div>
                <FL text="Interest Rate (%)" P={P} />
                <input id="rec-rate" type="number" step={0.1} min={0}
                  placeholder={groqParams?.rate_of_interest ? String(groqParams.rate_of_interest) : "13"}
                  className={inp} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.rate} onChange={(e) => onChange("rate", e.target.value)} />
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
              <div>
                <FL text="Down Payment (LKR)" P={P} />
                <input id="rec-dpa" type="number"
                  placeholder={groqParams?.down_payment_amount ? String(groqParams.down_payment_amount) : "Optional"}
                  className={inp} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.dpa} onChange={(e) => onChange("dpa", e.target.value)} />
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 mb-5">
              <div>
                <FL text="Top N Results" P={P} />
                <input id="rec-topn" type="number" min={1} max={50} className={inp} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.topN} onChange={(e) => onChange("topN", e.target.value)} />
              </div>
              <div>
                <FL text="Candidate Limit" P={P} />
                <input id="rec-cand" type="number" min={100} max={20000} className={inp} style={{ background: P.bg, borderColor: P.border, color: P.text }} value={values.candidateLimit} onChange={(e) => onChange("candidateLimit", e.target.value)} />
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition-colors duration-500" style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF', borderColor: P.border }}>
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: P.primary }} />
              <span className="text-xs font-semibold leading-relaxed" style={{ color: P.text }}>
                Manual form selections always override AI-extracted values.
                The AI fills in only what you haven&apos;t specified.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ label, P, isDarkMode }: { label: string, P: any, isDarkMode: boolean }) {
  return (
    <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors duration-500"
      style={{ background: P.cardBg, borderColor: P.border, color: P.text }}>
      {label}
    </span>
  );
}
