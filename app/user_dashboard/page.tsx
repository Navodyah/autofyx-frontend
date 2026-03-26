"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ChevronUp, ChevronDown, Car, Fuel, Gauge, Zap, Scale } from "lucide-react";
import Link from "next/link";

type RecommendResponse = {
  message?: string | null;
  count: number;
  items: Record<string, any>[];
};

function ScoreBadge({ score }: { score: number }) {
  const pct = typeof score === 'number' ? score : parseFloat(String(score).replace('%', ''));
  const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
  const bg = pct >= 85 ? 'rgba(16,185,129,0.12)' : pct >= 70 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: bg, color }}
    >
      {pct.toFixed(1)}%
    </span>
  );
}

export default function SearchPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [searchQuery, setSearchQuery] = useState("");
  const [salary, setSalary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedParams, setParsedParams] = useState<any>(null);
  const [results, setResults] = useState<RecommendResponse | null>(null);
  const [showParsed, setShowParsed] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setResults(null);
    setParsedParams(null);
    setShowParsed(false);

    try {
      const monthly_income =
        salary.trim() !== "" && Number.isFinite(Number(salary)) ? Number(salary) : undefined;

      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: searchQuery, monthly_income }),
      });

      const parseJson = await parseRes.json();
      if (!parseRes.ok || !parseJson?.ok) {
        setError(parseJson?.message || "Gemini parsing failed");
        setLoading(false);
        return;
      }

      const params = parseJson.params;
      setParsedParams(params);

      const recRes = await fetch(`${API_BASE}/recommendations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const recJson = (await recRes.json()) as RecommendResponse;

      if (!recRes.ok) {
        setError((recJson as any)?.message || `Backend request failed (${recRes.status})`);
        setLoading(false);
        return;
      }

      setResults(recJson);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const items = results?.items || [];
  const hasItems = items.length > 0;

  const suggestions = [
    "Family SUV, city driving, diesel automatic, max 8L/100km",
    "Performance highway, premium petrol, automatic",
    "Daily commute mixed roads, regular petrol, max 7L",
    "Electric or hybrid, eco-friendly, city use",
  ];

  return (
    <div className="af-dashboard-bg min-h-screen">
      {/* ── Top Navbar ── */}
      <nav
        className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 edge-0"
        style={{
          background: 'var(--navbar-bg)',
          borderBottom: '1px solid var(--border-primary)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Link href="/landing_page" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
          >
            <Car className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Auto<span style={{ color: 'var(--text-accent)' }}>Fyx</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/user_dashboard/compare">
            <button
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Scale className="h-4 w-4" />
              Compare
            </button>
          </Link>

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            U
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            AI Vehicle
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {' '}Recommender
            </span>
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Describe your ideal vehicle in plain English — our AI does the rest.
          </p>
        </motion.div>

        {/* ── Search Form ── */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {/* Animated rainbow border wrapper */}
          <motion.div
            className="relative rounded-2xl p-[2px]"
            style={{
              background:
                'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
              backgroundSize: '300% 100%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="rounded-[14px] overflow-hidden"
              style={{ background: 'var(--bg-card)' }}
            >
              {/* Salary + Query Row */}
              <div className="flex flex-wrap md:flex-nowrap items-center">
                {/* Salary input */}
                <div
                  className="flex items-center gap-2 px-4 py-4 border-b md:border-b-0 md:border-r w-full md:w-auto shrink-0"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    LKR
                  </span>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setSalary(value);
                    }}
                    placeholder="0"
                    className="w-full md:w-24 text-base bg-transparent focus:outline-none font-medium"
                    style={{ color: 'var(--text-primary)' }}
                    title="Monthly income in LKR"
                  />
                  {/* Stepper */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => setSalary((p) => String(Math.min(Number(p || 0) + 50000, 999999999)))}
                      className="p-0.5 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSalary((p) => String(Math.max(Number(p || 0) - 50000, 0)))}
                      className="p-0.5 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-accent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Search query */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='e.g. "Family car, city, diesel automatic"'
                  className="flex-1 px-4 py-4 w-full md:w-auto text-base bg-transparent focus:outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />

                {/* Search button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="m-2 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-60 w-[calc(100%-16px)] md:w-auto"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    flexShrink: 0,
                  }}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(59,130,246,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="af-spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {loading ? 'Analyzing...' : 'Search'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.form>

        {/* Suggestion chips */}
        {!hasItems && !loading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSearchQuery(s)}
                className="text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-accent)';
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-xl border p-4 text-sm"
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

        {/* Parsed Params */}
        {parsedParams && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 af-card rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setShowParsed(!showParsed)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-colors"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--bg-tertiary)',
              }}
            >
              <span>🧠 Gemini Extracted Parameters</span>
              <ChevronDown
                className="h-4 w-4 transition-transform duration-200"
                style={{ transform: showParsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
            {showParsed && (
              <pre
                className="px-5 py-4 text-xs overflow-auto af-no-scrollbar rounded-b-xl"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace',
                  maxHeight: '200px',
                }}
              >
                {JSON.stringify(parsedParams, null, 2)}
              </pre>
            )}
          </motion.div>
        )}

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Recommendations
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {hasItems ? `${items.length} vehicles found` : results.message || "No results"}
                </p>
              </div>
              {hasItems && (
                <span className="af-badge af-badge-green">
                  <Sparkles className="h-3 w-3" />
                  AI Ranked
                </span>
              )}
            </div>

            {hasItems && (
              <>
                {/* Card grid for top 3 */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {items.slice(0, 3).map((r, idx) => {
                     // Add fallbacks for cards just like the table
                     const score = r.Compatibility_Score ?? r.compatibility_score ?? 0;
                     const year = r.YEAR ?? r.Year ?? r.year ?? '-';
                     const make = r.MAKE ?? r.Make ?? r.make ?? '-';
                     const model = r.MODEL ?? r.Model ?? r.model ?? '-';
                     const vehicleClass = r['VEHICLE CLASS'] ?? r.VEHICLE_CLASS ?? r.vehicle_class ?? r.Class ?? '-';
                     const engine = r['ENGINE SIZE'] ?? r.ENGINE_SIZE ?? r.engine_size ?? r.Engine ?? '-';
                     const trans = r.TRANSMISSION ?? r.Transmission ?? r.transmission ?? r.Trans ?? '-';
                     const fuel = r.FUEL ?? r.Fuel ?? r.fuel ?? '-';
                     const l100 = r['COMB (L/100 km)'] ?? r.COMB_L_100 ?? r.comb_l_100 ?? r['Comb L/100'] ?? '-';

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="af-card af-card-hover p-5 relative overflow-hidden border"
                        style={{ borderColor: 'var(--border-primary)' }}
                      >
                        {idx === 0 && (
                          <div
                            className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                          >
                            Best Match
                          </div>
                        )}

                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'var(--bg-tertiary)' }}
                          >
                            <Car className="h-5 w-5" style={{ color: 'var(--text-accent)' }} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {make} {model}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {year} · {vehicleClass}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <Fuel className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                            {fuel}
                          </div>
                          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <Gauge className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                            {l100} L/100
                          </div>
                          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <Zap className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                            {engine}L Engine
                          </div>
                          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <Car className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                            {trans}
                          </div>
                        </div>

                        <div
                          className="mt-4 pt-3 flex items-center justify-between"
                          style={{ borderTop: '1px solid var(--border-secondary)' }}
                        >
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Match Score
                          </span>
                          <ScoreBadge score={score} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Full table for remaining */}
                {items.length > 3 && (
                  <div className="af-card rounded-xl overflow-hidden mt-8 border" style={{ borderColor: 'var(--border-primary)' }}>
                    <div
                      className="px-5 py-4 text-sm font-semibold flex items-center justify-between"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border-primary)',
                      }}
                    >
                      <span>All Results ({items.length} vehicles)</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="text-xs uppercase tracking-wider" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                            <th className="px-4 py-3 font-medium border-b" style={{ borderColor: 'var(--border-primary)' }}>Score</th>
                            <th className="px-4 py-3 font-medium border-b" style={{ borderColor: 'var(--border-primary)' }}>Year</th>
                            <th className="px-4 py-3 font-medium border-b" style={{ borderColor: 'var(--border-primary)' }}>Make</th>
                            <th className="px-4 py-3 font-medium border-b" style={{ borderColor: 'var(--border-primary)' }}>Model</th>
                            <th className="px-4 py-3 font-medium border-b" style={{ borderColor: 'var(--border-primary)' }}>Class</th>
                            <th className="px-4 py-3 font-medium border-b text-center" style={{ borderColor: 'var(--border-primary)' }}>Engine (L)</th>
                            <th className="px-4 py-3 font-medium border-b text-center" style={{ borderColor: 'var(--border-primary)' }}>Cyl</th>
                            <th className="px-4 py-3 font-medium border-b text-center" style={{ borderColor: 'var(--border-primary)' }}>Trans</th>
                            <th className="px-4 py-3 font-medium border-b text-center" style={{ borderColor: 'var(--border-primary)' }}>Fuel</th>
                            <th className="px-4 py-3 font-medium border-b text-right" style={{ borderColor: 'var(--border-primary)' }}>Comb (L/100km)</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y" style={{ borderColor: 'var(--border-secondary)' }}>
                          {items.map((r, idx) => {
                            // Extract values with robust fallbacks
                            const score = r.Compatibility_Score ?? r.compatibility_score ?? 0;
                            const year = r.YEAR ?? r.Year ?? r.year ?? '-';
                            const make = r.MAKE ?? r.Make ?? r.make ?? '-';
                            const model = r.MODEL ?? r.Model ?? r.model ?? '-';
                            const vehicleClass = r['VEHICLE CLASS'] ?? r.VEHICLE_CLASS ?? r.vehicle_class ?? r.Class ?? '-';
                            const engine = r['ENGINE SIZE'] ?? r.ENGINE_SIZE ?? r.engine_size ?? r.Engine ?? '-';
                            const cyl = r.CYLINDERS ?? r.Cylinders ?? r.cylinders ?? r.Cyl ?? '-';
                            const trans = r.TRANSMISSION ?? r.Transmission ?? r.transmission ?? r.Trans ?? '-';
                            const fuel = r.FUEL ?? r.Fuel ?? r.fuel ?? '-';
                            const l100 = r['COMB (L/100 km)'] ?? r.COMB_L_100 ?? r.comb_l_100 ?? r['Comb L/100'] ?? '-';

                            return (
                              <tr 
                                key={idx} 
                                className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                              >
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <ScoreBadge score={score} />
                                </td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{year}</td>
                                <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{make}</td>
                                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{model}</td>
                                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                                  <span className="px-2 py-1 rounded-md text-xs bg-black/5 dark:bg-white/5">{vehicleClass}</span>
                                </td>
                                <td className="px-4 py-3 text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                                  {engine}
                                </td>
                                <td className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                                  {cyl}
                                </td>
                                <td className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                                  {trans}
                                </td>
                                <td className="px-4 py-3 text-center font-medium" style={{ color: 'var(--text-secondary)' }}>
                                  {fuel}
                                </td>
                                <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--text-primary)' }}>
                                  {l100}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {!hasItems && (
              <div
                className="af-card rounded-xl p-10 text-center"
              >
                <Car className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {results.message || "No vehicles found matching your criteria."}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Try broadening your search query.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}