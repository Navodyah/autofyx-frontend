"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ChevronLeft, Car, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

function CompareCell({ a, b, label }: { a: any; b: any; label: string }) {
  const fmtA = fmt(a);
  const fmtB = fmt(b);

  // Highlight winner for numeric fields (lower = better for consumption, higher = better for engine)
  let aClass = '';
  let bClass = '';

  const consumptionFields = ['COMB (L/100 km)', 'HWY (L/100 km)'];
  if (consumptionFields.includes(label) && fmtA !== '—' && fmtB !== '—') {
    const nA = parseFloat(fmtA);
    const nB = parseFloat(fmtB);
    if (!isNaN(nA) && !isNaN(nB)) {
      if (nA < nB) aClass = 'compare-winner';
      else if (nB < nA) bClass = 'compare-winner';
    }
  }

  return (
    <div
      className="compare-row grid grid-cols-3 gap-4 py-3 px-5 rounded-lg"
      style={{ borderBottom: '1px solid var(--border-secondary)' }}
    >
      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className={`text-sm ${aClass}`} style={{ color: aClass ? undefined : 'var(--text-secondary)' }}>{fmtA}</div>
      <div className={`text-sm ${bClass}`} style={{ color: bClass ? undefined : 'var(--text-secondary)' }}>{fmtB}</div>
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
    <select
      className="af-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

export default function ComparePage() {
  const [makes, setMakes] = useState<string[]>([]);
  const [modelsA, setModelsA] = useState<string[]>([]);
  const [modelsB, setModelsB] = useState<string[]>([]);
  const [yearsA, setYearsA] = useState<number[]>([]);
  const [yearsB, setYearsB] = useState<number[]>([]);

  const [makeA, setMakeA] = useState("");
  const [modelA, setModelA] = useState("");
  const [yearA, setYearA] = useState<number | "">("");

  const [makeB, setMakeB] = useState("");
  const [modelB, setModelB] = useState("");
  const [yearB, setYearB] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResponse | null>(null);

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

  useEffect(() => {
    if (!makeA) return;
    (async () => {
      try {
        setModelA(""); setYearA(""); setYearsA([]);
        const data = await fetchJSON<CatalogListResponse>(`${API_BASE}/lookup/models?make=${encodeURIComponent(makeA)}`);
        setModelsA(data.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load models (A)");
      }
    })();
  }, [makeA]);

  useEffect(() => {
    if (!makeB) return;
    (async () => {
      try {
        setModelB(""); setYearB(""); setYearsB([]);
        const data = await fetchJSON<CatalogListResponse>(`${API_BASE}/lookup/models?make=${encodeURIComponent(makeB)}`);
        setModelsB(data.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load models (B)");
      }
    })();
  }, [makeB]);

  useEffect(() => {
    if (!makeA || !modelA) return;
    (async () => {
      try {
        setYearA("");
        const data = await fetchJSON<YearsListResponse>(`${API_BASE}/lookup/years?make=${encodeURIComponent(makeA)}&model=${encodeURIComponent(modelA)}`);
        setYearsA(data.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load years (A)");
      }
    })();
  }, [makeA, modelA]);

  useEffect(() => {
    if (!makeB || !modelB) return;
    (async () => {
      try {
        setYearB("");
        const data = await fetchJSON<YearsListResponse>(`${API_BASE}/lookup/years?make=${encodeURIComponent(makeB)}&model=${encodeURIComponent(modelB)}`);
        setYearsB(data.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load years (B)");
      }
    })();
  }, [makeB, modelB]);

  const canCompare = useMemo(() => {
    return makeA && modelA && yearA !== "" && makeB && modelB && yearB !== "";
  }, [makeA, modelA, yearA, makeB, modelB, yearB]);

  async function onCompare() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        selections: [
          { make: makeA, model: modelA, year: Number(yearA) },
          { make: makeB, model: modelB, year: Number(yearB) },
        ],
      };

      const res = await fetch(`${API_BASE}/compare/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as any;

      if (!res.ok) {
        const msg =
          typeof json?.detail === "string"
            ? json.detail
            : Array.isArray(json?.detail)
            ? JSON.stringify(json.detail)
            : json?.message || `Compare failed (${res.status})`;
        setError(msg);
        return;
      }

      const list: CompareResponse = Array.isArray(json) ? json : json?.items || [];
      setResult(list);

      if (!Array.isArray(list) || list.length < 2) {
        setError("Compare response invalid. Expected 2 vehicles.");
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
    setResult(null); setError(null);
  }

  const items = result || [];
  const left = items[0];
  const right = items[1];

  const comparisonRows = [
    { label: 'Vehicle Class', a: left?.vehicle_class, b: right?.vehicle_class },
    { label: 'Engine Size', a: left?.engine_size, b: right?.engine_size },
    { label: 'Engine Type', a: left?.engine_type, b: right?.engine_type },
    { label: 'Transmission', a: left?.transmission, b: right?.transmission },
    { label: 'Fuel', a: left?.fuel, b: right?.fuel },
    { label: 'COMB (L/100 km)', a: left?.comb_l_per_100, b: right?.comb_l_per_100 },
    { label: 'HWY (L/100 km)', a: left?.hwy_l_per_100, b: right?.hwy_l_per_100 },
    { label: 'Tyre Size', a: left?.tyre_size, b: right?.tyre_size },
    { label: 'Description', a: left?.description, b: right?.description },
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
        <Link href="/user_dashboard" className="flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
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

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Compare Vehicles
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Select make, model, and year for both vehicles to see a side-by-side comparison.
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Vehicle A */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="af-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
              >
                A
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Vehicle A
                </h3>
                {makeA && modelA && yearA !== "" && (
                  <p className="text-xs" style={{ color: 'var(--text-accent)' }}>
                    {makeA} {modelA} ({yearA})
                  </p>
                )}
              </div>
            </div>

            <SelectField
              value={makeA}
              onChange={setMakeA}
              options={makes}
              placeholder="Select Make"
            />
            <SelectField
              value={modelA}
              onChange={setModelA}
              options={modelsA}
              placeholder={makeA ? "Select Model" : "Select Make first"}
              disabled={!makeA}
            />
            <select
              className="af-select"
              value={yearA === "" ? "" : String(yearA)}
              onChange={(e) => setYearA(Number(e.target.value))}
              disabled={!modelA}
            >
              <option value="">{modelA ? "Select Year" : "Select Model first"}</option>
              {yearsA.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </motion.div>

          {/* VS Divider */}
          <div className="hidden md:flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '2px solid var(--border-primary)' }}
            >
              VS
            </div>
          </div>

          {/* Vehicle B */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="af-card p-6 space-y-4 md:-ml-8"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              >
                B
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Vehicle B
                </h3>
                {makeB && modelB && yearB !== "" && (
                  <p className="text-xs" style={{ color: '#a78bfa' }}>
                    {makeB} {modelB} ({yearB})
                  </p>
                )}
              </div>
            </div>

            <SelectField
              value={makeB}
              onChange={setMakeB}
              options={makes}
              placeholder="Select Make"
            />
            <SelectField
              value={modelB}
              onChange={setModelB}
              options={modelsB}
              placeholder={makeB ? "Select Model" : "Select Make first"}
              disabled={!makeB}
            />
            <select
              className="af-select"
              value={yearB === "" ? "" : String(yearB)}
              onChange={(e) => setYearB(Number(e.target.value))}
              disabled={!modelB}
            >
              <option value="">{modelB ? "Select Year" : "Select Model first"}</option>
              {yearsB.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            disabled={!canCompare || loading}
            onClick={onCompare}
            className="af-btn-primary py-3 px-6 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="af-spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                Comparing...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                Compare Now
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="af-btn-secondary py-3 px-5"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {items.length === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="af-card rounded-2xl overflow-hidden"
            >
              {/* Comparison Header */}
              <div
                className="grid grid-cols-3 gap-4 px-5 py-4"
                style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}
              >
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Specification
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {left?.name || "Vehicle A"}
                  </p>
                  {!left?.found && (
                    <p className="text-xs" style={{ color: '#f87171' }}>Not found</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {right?.name || "Vehicle B"}
                  </p>
                  {!right?.found && (
                    <p className="text-xs" style={{ color: '#f87171' }}>Not found</p>
                  )}
                </div>
              </div>

              {/* Not found warning */}
              {(!left?.found || !right?.found) && (
                <div
                  className="mx-5 mt-4 rounded-xl border p-3 text-sm"
                  style={{
                    background: 'rgba(245,158,11,0.08)',
                    borderColor: 'rgba(245,158,11,0.25)',
                    color: '#fbbf24',
                  }}
                >
                  {left?.found === false && <div>⚠️ <b>{left?.name}</b>: {left?.message || "Not found"}</div>}
                  {right?.found === false && <div>⚠️ <b>{right?.name}</b>: {right?.message || "Not found"}</div>}
                </div>
              )}

              {/* Rows */}
              <div className="py-2 px-2">
                {comparisonRows.map((row) => (
                  <CompareCell key={row.label} label={row.label} a={row.a} b={row.b} />
                ))}
              </div>

              <div
                className="px-5 py-3 text-xs"
                style={{
                  borderTop: '1px solid var(--border-secondary)',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-tertiary)',
                }}
              >
                ✅ Green values indicate better fuel efficiency (lower consumption).
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
