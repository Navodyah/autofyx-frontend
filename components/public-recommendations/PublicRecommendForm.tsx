"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  DollarSign,
  Info,
  Sparkles,
  X,
  SlidersHorizontal,
  Zap,
  Gauge,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ClassPreview } from "@/components/recommendations/ClassPreview";

/* ── Re-export types so page.tsx can import from one place ── */
export type { FormValues, GroqExtracted } from "@/components/recommendations/RecommendForm";
export { DEFAULT_VALUES } from "@/components/recommendations/RecommendForm";

import type { FormValues, GroqExtracted } from "@/components/recommendations/RecommendForm";

interface PublicRecommendFormProps {
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

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ── Shared dark input / select class strings ── */
const darkInput =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all backdrop-blur-sm";
const darkSelect =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all backdrop-blur-sm appearance-none cursor-pointer";

function FieldLabel({ text }: { text: string }) {
  return (
    <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
      {text}
    </p>
  );
}

export function PublicRecommendForm({
  values,
  loading,
  groqParams,
  groqLoading,
  groqError,
  onChange,
  onSubmit,
  onGroqSearch,
  onClearGroq,
}: PublicRecommendFormProps) {
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
    <div className="w-full space-y-6">

      {/* ── AI Prompt Bar ── */}
      <div className="relative">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#16161a]/80 p-2 shadow-2xl backdrop-blur-2xl overflow-hidden group">
          {/* Subtle glare */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 6, ease: "linear" }}
            className="absolute top-0 bottom-0 w-[15%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] pointer-events-none"
          />
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex-shrink-0 ml-1">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <input
            id="pub-rec-prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "Family SUV for city, diesel, salary 300k, 60 months loan"'
            className="flex-1 bg-transparent text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
          {prompt && (
            <button
              type="button"
              onClick={() => { setPrompt(""); onClearGroq(); }}
              className="rounded-full p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <motion.button
            id="pub-rec-submit"
            type="button"
            onClick={handleSearch}
            disabled={loading || groqLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold tracking-wide bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 disabled:opacity-50 transition-all"
          >
            {(loading || groqLoading) ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Cpu className="h-4 w-4" />
            )}
            {groqLoading ? "Parsing…" : loading ? "Searching…" : "AI Search"}
          </motion.button>
        </div>
      </div>

      {/* ── Groq Error ── */}
      <AnimatePresence>
        {groqError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400"
          >
            AI parse failed: {groqError}. Using form values only.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Groq Extracted Pills ── */}
      <AnimatePresence>
        {groqParams && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-3"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex-shrink-0">
              AI extracted:
            </span>
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
              className="ml-auto text-[10px] font-bold text-zinc-500 hover:text-zinc-300 underline transition-colors"
            >
              clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Suggestions ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Try:</span>
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s}
            type="button"
            onClick={() => handleSuggestion(s)}
            whileHover={{ y: -2, scale: 1.02 }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:border-white/20 transition-colors backdrop-blur-sm"
          >
            {s}
          </motion.button>
        ))}
      </div>

      {/* ── Advanced Filters Toggle ── */}
      <button
        type="button"
        onClick={() => setFiltersOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors tracking-wide"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Advanced Filters
        {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span className="ml-1 text-[10px] font-medium text-zinc-600 lowercase tracking-normal">
          (manual selections override AI)
        </span>
      </button>

      {/* ── Filter Panels ── */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-2"
            >
              {/* ── Vehicle Specifications Panel ── */}
              <motion.div
                variants={fadeUp}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f14] p-6"
              >
                {/* Ambient top-left glow */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20">
                      <Gauge className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest text-zinc-200">
                      Vehicle Specifications
                    </span>
                  </div>

                  {/* Salary */}
                  <div className="mb-4">
                    <FieldLabel text="Monthly Salary (LKR)" />
                    <input
                      id="pub-rec-salary"
                      type="number"
                      min={1}
                      placeholder={groqParams?.salary ? `AI: ${groqParams.salary.toLocaleString()}` : "e.g. 250000"}
                      className={darkInput}
                      value={values.salary}
                      onChange={(e) => onChange("salary", e.target.value)}
                    />
                    {!values.salary && groqParams?.salary && (
                      <p className="mt-1.5 text-[10px] font-bold text-blue-400">
                        Using AI-extracted: LKR {groqParams.salary.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <FieldLabel text="Purpose" />
                      <select
                        id="pub-rec-purpose"
                        className={darkSelect}
                        value={values.purpose}
                        onChange={(e) => onChange("purpose", e.target.value)}
                        style={{ colorScheme: "dark" }}
                      >
                        <option value="daily_commute">Commuting</option>
                        <option value="family">Family</option>
                        <option value="performance">Performance</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel text="Driving Area" />
                      <select
                        id="pub-rec-area"
                        className={darkSelect}
                        value={values.area}
                        onChange={(e) => onChange("area", e.target.value)}
                        style={{ colorScheme: "dark" }}
                      >
                        <option value="city">Urban/City</option>
                        <option value="mixed">Mixed</option>
                        <option value="highway">Highway</option>
                        <option value="off-road">Off-Road</option>
                      </select>
                    </div>
                  </div>

                  {/* Fuel type pills */}
                  <div className="mb-4">
                    <FieldLabel text="Fuel Type" />
                    <div className="flex flex-wrap gap-2">
                      {FUEL_PILLS.map((fp) => (
                        <button
                          key={fp.value}
                          type="button"
                          onClick={() => onChange("fuel", fp.value)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all ${
                            values.fuel === fp.value
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/25"
                              : "border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100 hover:border-white/20"
                          }`}
                        >
                          {fp.label}
                        </button>
                      ))}
                    </div>
                    {values.fuel === "" && groqParams?.fuel && (
                      <p className="mt-1.5 text-[10px] font-bold text-blue-400">
                        AI suggested: {groqParams.fuel}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <FieldLabel text="Transmission" />
                      <select
                        id="pub-rec-trans"
                        className={darkSelect}
                        value={values.transmission}
                        onChange={(e) => onChange("transmission", e.target.value)}
                        style={{ colorScheme: "dark" }}
                      >
                        <option value="">Any</option>
                        <option value="A">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <FieldLabel text="Max L/100km" />
                      <input
                        id="pub-rec-maxfuel"
                        type="number"
                        step={0.5}
                        min={0}
                        placeholder={groqParams?.max_comb_l_per_100 ? String(groqParams.max_comb_l_per_100) : "e.g. 10"}
                        className={darkInput}
                        value={values.maxFuel}
                        onChange={(e) => onChange("maxFuel", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <FieldLabel text="Maintainability" />
                    <select
                      id="pub-rec-maint"
                      className={darkSelect}
                      value={values.maintainability}
                      onChange={(e) => onChange("maintainability", e.target.value)}
                      style={{ colorScheme: "dark" }}
                    >
                      <option value="">Auto (by income tier)</option>
                      <option value="high">High – Japanese/Korean</option>
                      <option value="average">Average – Balanced</option>
                      <option value="none">None – No bias</option>
                    </select>
                  </div>

                  <ClassPreview
                    salary={salary || (groqParams?.salary ?? 0)}
                    purpose={values.purpose}
                    area={values.area}
                  />
                </div>
              </motion.div>

              {/* ── Financial Parameters Panel ── */}
              <motion.div
                variants={fadeUp}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f14] p-6"
              >
                {/* Ambient top-right glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20">
                      <DollarSign className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest text-zinc-200">
                      Financial Parameters
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <FieldLabel text="Duration (Months)" />
                      <input
                        id="pub-rec-months"
                        type="number"
                        min={1}
                        placeholder={groqParams?.number_of_months ? String(groqParams.number_of_months) : "60"}
                        className={darkInput}
                        value={values.months}
                        onChange={(e) => onChange("months", e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel text="Interest Rate (%)" />
                      <input
                        id="pub-rec-rate"
                        type="number"
                        step={0.1}
                        min={0}
                        placeholder={groqParams?.rate_of_interest ? String(groqParams.rate_of_interest) : "13"}
                        className={darkInput}
                        value={values.rate}
                        onChange={(e) => onChange("rate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <FieldLabel text="Down Payment (LKR)" />
                      <input
                        id="pub-rec-dpa"
                        type="number"
                        placeholder={groqParams?.down_payment_amount ? String(groqParams.down_payment_amount) : "Optional"}
                        className={darkInput}
                        value={values.dpa}
                        onChange={(e) => onChange("dpa", e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel text="Down Payment Ratio" />
                      <input
                        id="pub-rec-dpr"
                        type="number"
                        step={0.05}
                        min={0}
                        max={1}
                        placeholder="e.g. 0.5"
                        className={darkInput}
                        value={values.dpr}
                        onChange={(e) => onChange("dpr", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <FieldLabel text="Top N Results" />
                      <input
                        id="pub-rec-topn"
                        type="number"
                        min={1}
                        max={50}
                        className={darkInput}
                        value={values.topN}
                        onChange={(e) => onChange("topN", e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel text="Candidate Limit" />
                      <input
                        id="pub-rec-cand"
                        type="number"
                        min={100}
                        max={20000}
                        className={darkInput}
                        value={values.candidateLimit}
                        onChange={(e) => onChange("candidateLimit", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Info callout */}
                  <div className="flex items-start gap-3 rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-400" />
                    <span className="text-xs font-medium leading-relaxed text-zinc-400">
                      Manual form selections always override AI-extracted values.
                      The AI fills in only what you haven&apos;t specified.
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
      {label}
    </span>
  );
}
