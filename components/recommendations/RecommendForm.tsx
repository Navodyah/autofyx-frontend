"use client";

import React, { useState } from "react";
import { ChevronDown, SlidersHorizontal, ChevronUp, Cpu, DollarSign, Info, Sparkles, X } from "lucide-react";
import { ClassPreview } from "./ClassPreview";

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

function FL({ text }: { text: string }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{text}</p>;
}

export function RecommendForm({
  values, loading, groqParams, groqLoading, groqError,
  onChange, onSubmit, onGroqSearch, onClearGroq,
}: RecommendFormProps) {
  const [prompt, setPrompt] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const salary = parseFloat(values.salary) || 0;

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
        className="relative overflow-hidden rounded-2xl mb-6 px-8 py-10 text-center"
        style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #e0e7ff 100%)" }}
      >
        <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white/70 px-3 py-1 text-xs font-semibold text-cyan-700 backdrop-blur-sm">
            <Cpu className="h-3 w-3" /> Next-Gen Automotive Intelligence
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            AI Vehicle Recommender
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
            Describe what you need — salary, purpose, fuel type, budget — and our AI will find your perfect match.
          </p>
        </div>
      </div>

      {/* ── Prompt Search Bar ── */}
      <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <Sparkles className="ml-2 h-4 w-4 flex-shrink-0 text-cyan-500" />
        <input
          id="rec-prompt"
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "Family SUV for city, diesel, salary 300k, 60 months loan"'
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        {prompt && (
          <button
            type="button"
            onClick={() => { setPrompt(""); onClearGroq(); }}
            className="rounded-full p-1 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          id="rec-submit"
          type="button"
          onClick={handleSearch}
          disabled={loading || groqLoading}
          className="flex-shrink-0 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #0891b2, #1d4ed8)" }}
        >
          {(loading || groqLoading) ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Cpu className="h-4 w-4" />
          )}
          {groqLoading ? "Parsing…" : loading ? "Searching…" : "AI Search"}
        </button>
      </div>

      {/* ── Groq parse error ── */}
      {groqError && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
          AI parse failed: {groqError}. Using form values only.
        </div>
      )}

      {/* ── Groq extracted params pill row ── */}
      {groqParams && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/80 px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-700 flex-shrink-0">AI extracted:</span>
          {groqParams.salary && (
            <Pill label={`Salary LKR ${groqParams.salary.toLocaleString()}`} />
          )}
          {groqParams.purpose && <Pill label={`Purpose: ${groqParams.purpose.replace("_", " ")}`} />}
          {groqParams.area && <Pill label={`Area: ${groqParams.area}`} />}
          {groqParams.fuel && <Pill label={`Fuel: ${groqParams.fuel}`} />}
          {groqParams.transmission && <Pill label={`Trans: ${groqParams.transmission}`} />}
          {groqParams.max_comb_l_per_100 && <Pill label={`≤${groqParams.max_comb_l_per_100} L/100`} />}
          {groqParams.vehicle_class && <Pill label={groqParams.vehicle_class} />}
          {groqParams.rate_of_interest && <Pill label={`${groqParams.rate_of_interest}% int.`} />}
          {groqParams.number_of_months && <Pill label={`${groqParams.number_of_months} mo`} />}
          <button
            type="button"
            onClick={onClearGroq}
            className="ml-auto text-[10px] font-semibold text-cyan-600 hover:text-cyan-800 underline"
          >
            clear
          </button>
        </div>
      )}

      {/* ── Quick suggestions ── */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSuggestion(s)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-cyan-300 hover:text-cyan-700 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Advanced Filters toggle ── */}
      <button
        type="button"
        onClick={() => setFiltersOpen((o) => !o)}
        className="mb-4 flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900 transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Advanced Filters
        {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        <span className="ml-1 text-[10px] font-normal text-slate-400">(manual selections override AI)</span>
      </button>

      {/* ── Filter Panels ── */}
      {filtersOpen && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Vehicle Specifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Vehicle Specifications</span>
            </div>

            {/* Salary manual override */}
            <div className="mb-3">
              <FL text="Monthly Salary (LKR)" />
              <input
                id="rec-salary"
                type="number"
                min={1}
                placeholder={groqParams?.salary ? `AI: ${groqParams.salary.toLocaleString()}` : "e.g. 250000"}
                className={inp}
                value={values.salary}
                onChange={(e) => onChange("salary", e.target.value)}
              />
              {!values.salary && groqParams?.salary && (
                <p className="mt-1 text-[10px] text-cyan-600">Using AI-extracted: LKR {groqParams.salary.toLocaleString()}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FL text="Purpose" />
                <select id="rec-purpose" className={sel} value={values.purpose} onChange={(e) => onChange("purpose", e.target.value)}>
                  <option value="daily_commute">Commuting</option>
                  <option value="family">Family</option>
                  <option value="performance">Performance</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div>
                <FL text="Driving Area" />
                <select id="rec-area" className={sel} value={values.area} onChange={(e) => onChange("area", e.target.value)}>
                  <option value="city">Urban/City</option>
                  <option value="mixed">Mixed</option>
                  <option value="highway">Highway</option>
                  <option value="off-road">Off-Road</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <FL text="Fuel Type" />
              <div className="flex flex-wrap gap-2">
                {FUEL_PILLS.map((fp) => (
                  <button
                    key={fp.value}
                    type="button"
                    onClick={() => onChange("fuel", fp.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${values.fuel === fp.value
                      ? "border-cyan-500 bg-cyan-500 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-cyan-300"
                      }`}
                  >
                    {fp.label}
                  </button>
                ))}
              </div>
              {values.fuel === "" && groqParams?.fuel && (
                <p className="mt-1 text-[10px] text-cyan-600">AI suggested: {groqParams.fuel}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FL text="Transmission" />
                <select id="rec-trans" className={sel} value={values.transmission} onChange={(e) => onChange("transmission", e.target.value)}>
                  <option value="">Any</option>
                  <option value="A">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <FL text="Max L/100km" />
                <input id="rec-maxfuel" type="number" step={0.5} min={0}
                  placeholder={groqParams?.max_comb_l_per_100 ? String(groqParams.max_comb_l_per_100) : "e.g. 10"}
                  className={inp} value={values.maxFuel} onChange={(e) => onChange("maxFuel", e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <FL text="Maintainability" />
              <select id="rec-maint" className={sel} value={values.maintainability} onChange={(e) => onChange("maintainability", e.target.value)}>
                <option value="">Auto (by income tier)</option>
                <option value="high">High – Japanese/Korean</option>
                <option value="average">Average – Balanced</option>
                <option value="none">None – No bias</option>
              </select>
            </div>

            <ClassPreview salary={salary || (groqParams?.salary ?? 0)} purpose={values.purpose} area={values.area} />

          </div>

          {/* Financial Parameters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Financial Parameters</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FL text="Duration (Months)" />
                <input id="rec-months" type="number" min={1}
                  placeholder={groqParams?.number_of_months ? String(groqParams.number_of_months) : "60"}
                  className={inp} value={values.months} onChange={(e) => onChange("months", e.target.value)} />
              </div>
              <div>
                <FL text="Interest Rate (%)" />
                <input id="rec-rate" type="number" step={0.1} min={0}
                  placeholder={groqParams?.rate_of_interest ? String(groqParams.rate_of_interest) : "13"}
                  className={inp} value={values.rate} onChange={(e) => onChange("rate", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FL text="Down Payment (LKR)" />
                <input id="rec-dpa" type="number"
                  placeholder={groqParams?.down_payment_amount ? String(groqParams.down_payment_amount) : "Optional"}
                  className={inp} value={values.dpa} onChange={(e) => onChange("dpa", e.target.value)} />
              </div>

            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <FL text="Top N Results" />
                <input id="rec-topn" type="number" min={1} max={50} className={inp} value={values.topN} onChange={(e) => onChange("topN", e.target.value)} />
              </div>
              <div>
                <FL text="Candidate Limit" />
                <input id="rec-cand" type="number" min={100} max={20000} className={inp} value={values.candidateLimit} onChange={(e) => onChange("candidateLimit", e.target.value)} />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>
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

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-cyan-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-cyan-700 shadow-sm">
      {label}
    </span>
  );
}
