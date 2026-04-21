"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Car,
  Fuel,
  Gauge,
  Zap,
  Scale,
  Settings2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { VehicleRecommendationCard } from "@/components/vehicles/vehicle-recommendation-card";
type RecommendPayload = {
  salary: number;
  purpose?: "daily_commute" | "family" | "performance" | "luxury";
  area?: "city" | "highway" | "mixed" | "off-road";
  fuel?: string;
  transmission?: string;
  max_comb_l_per_100?: number;
  vehicle_class?: string;
  rate_of_interest?: number;
  number_of_months?: number;
  down_payment_amount?: number;
  down_payment_ratio?: number;
  top_n: number;
  candidate_limit: number;
};

type RecommendResponse = {
  message?: string | null;
  count: number;
  items: Record<string, unknown>[];
  finance?: Record<string, unknown>;
};

type FuelTypeResponse = {
  fuel_type_id: number;
  fuel_price?: number | null;
};

function ScoreBadge({ score }: { score: number }) {
  const pct = Number.isFinite(score) ? score : 0;
  const color = pct >= 85 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444";
  const bg = pct >= 85 ? "rgba(16,185,129,0.12)" : pct >= 70 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)";

  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: bg, color }}>
      {pct.toFixed(1)}%
    </span>
  );
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: unknown) {
  const parsed = asNumber(value);
  if (parsed === null) return "-";
  return new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(parsed);
}

function formatCurrencyLabel(value: unknown, emptyLabel = "Unavailable") {
  const parsed = asNumber(value);
  if (parsed === null) return emptyLabel;
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(parsed)}`;
}

function readValue(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function toVehicleCardData(item: Record<string, unknown>, idx: number) {
  const score = Number(readValue(item, ["Compatibility_Score", "compatibility_score"]) || 0);
  const yearValue = asNumber(readValue(item, ["YEAR", "Year", "year"]));
  const make = String(readValue(item, ["Make", "MAKE", "make"]) || "").trim();
  const model = String(readValue(item, ["Model", "MODEL", "model"]) || "").trim();
  const fuel = String(readValue(item, ["FUEL", "Fuel", "fuel"]) || "-");
  const transmission = String(readValue(item, ["Transmission", "TRANSMISSION", "transmission", "Trans"]) || "-");
  const engine = String(readValue(item, ["ENGINE SIZE", "ENGINE_SIZE", "engine_size", "Engine"]) || "-");
  const marketPrice = asNumber(readValue(item, ["average_price"])) ?? 0;
  const monthlyEMI = asNumber(readValue(item, ["monthly_emi"])) ?? 0;
  const annualFuelCost = asNumber(readValue(item, ["fuel_cost"])) ?? 0;
  const yearlyMaintenance = asNumber(readValue(item, ["maintenance_yearly_cost"])) ?? 0;

  return {
    id: String(readValue(item, ["id", "vehicle_id", "VEHICLE_ID"]) || `${make}-${model}-${idx}`),
    name: `${make} ${model}`.trim() || "Unknown Vehicle",
    year: yearValue ?? new Date().getFullYear(),
    imageUrl:
      String(readValue(item, ["image_url", "imageUrl", "image", "Image", "thumbnail"]) || "") ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'%3E%3Crect width='1200' height='675' fill='%230f172a'/%3E%3Ctext x='50%25' y='50%25' fill='%23e2e8f0' font-size='48' font-family='Arial' text-anchor='middle' dominant-baseline='middle'%3EVehicle Image%3C/text%3E%3C/svg%3E",
    matchScore: score,
    fuelType: fuel,
    engineCapacity: engine,
    transmission,
    marketPrice,
    monthlyEMI,
    annualFuelCost,
    fiveYearOwnershipCost: annualFuelCost * 5 + yearlyMaintenance * 5,
    currency: "LKR",
  };
}

export default function SearchPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  const [searchQuery, setSearchQuery] = useState("");
  const [salary, setSalary] = useState("");
  const [purpose, setPurpose] = useState("");
  const [area, setArea] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [vehicleClass, setVehicleClass] = useState("");
  const [maxComb, setMaxComb] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [months, setMonths] = useState("");
  const [downPaymentAmount, setDownPaymentAmount] = useState("");
  const [downPaymentRatio, setDownPaymentRatio] = useState("");
  const [topN, setTopN] = useState("10");
  const [candidateLimit, setCandidateLimit] = useState("2000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedParams, setParsedParams] = useState<Record<string, unknown> | null>(null);
  const [results, setResults] = useState<RecommendResponse | null>(null);
  const [showParsed, setShowParsed] = useState(false);

  const suggestions = [
    "Family SUV, city driving, diesel automatic, max 8L/100km",
    "Performance highway car, premium petrol, automatic",
    "Daily commute mixed roads, regular petrol, max 7L/100km",
    "Electric vehicle for city use with low running cost",
  ];

  function buildManualParams(): Partial<RecommendPayload> {
    const payload: Partial<RecommendPayload> = {
      top_n: Math.max(1, Math.min(toOptionalNumber(topN) ?? 10, 50)),
      candidate_limit: Math.max(100, Math.min(toOptionalNumber(candidateLimit) ?? 2000, 20000)),
    };

    const salaryValue = toOptionalNumber(salary);
    if (salaryValue !== undefined) payload.salary = salaryValue;
    if (purpose) payload.purpose = purpose as RecommendPayload["purpose"];
    if (area) payload.area = area as RecommendPayload["area"];
    if (fuelType) payload.fuel = fuelType;
    if (transmission) payload.transmission = transmission;
    if (vehicleClass.trim()) payload.vehicle_class = vehicleClass.trim().toUpperCase();

    const maxCombValue = toOptionalNumber(maxComb);
    if (maxCombValue !== undefined) payload.max_comb_l_per_100 = maxCombValue;

    const interestRateValue = toOptionalNumber(interestRate);
    if (interestRateValue !== undefined) payload.rate_of_interest = interestRateValue;

    const monthsValue = toOptionalNumber(months);
    if (monthsValue !== undefined) payload.number_of_months = monthsValue;

    const downPaymentAmountValue = toOptionalNumber(downPaymentAmount);
    if (downPaymentAmountValue !== undefined) payload.down_payment_amount = downPaymentAmountValue;

    const downPaymentRatioValue = toOptionalNumber(downPaymentRatio);
    if (downPaymentRatioValue !== undefined) payload.down_payment_ratio = downPaymentRatioValue;

    return payload;
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setResults(null);
    setParsedParams(null);
    setShowParsed(false);

    try {
      const manualParams = buildManualParams();
      let params: Record<string, unknown> = { ...manualParams };

      if (searchQuery.trim()) {
        const parseRes = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: searchQuery, salary: manualParams.salary }),
        });

        const parseJson = (await parseRes.json()) as { ok?: boolean; message?: string; params?: Record<string, unknown> };
        if (!parseRes.ok || !parseJson?.ok) {
          setError(parseJson?.message || "Gemini parsing failed");
          setLoading(false);
          return;
        }

        params = { ...(parseJson.params || {}), ...manualParams };
        setParsedParams(parseJson.params || null);
      }

      if (!params.salary) {
        setError("Monthly salary is required to get recommendations.");
        setLoading(false);
        return;
      }

      const recRes = await fetch(`${API_BASE}/recommendations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const recJson = (await recRes.json()) as RecommendResponse;
      if (!recRes.ok) {
        setError(recJson?.message || `Backend request failed (${recRes.status})`);
        setLoading(false);
        return;
      }

      const uniqueFuelIds = Array.from(
        new Set(
          (recJson.items || [])
            .map((item) => asNumber(readValue(item, ["fuel_type_id"])))
            .filter((value): value is number => value !== null)
        )
      );

      const fuelPriceMap = new Map<number, number | null>();
      await Promise.all(
        uniqueFuelIds.map(async (fuelId) => {
          try {
            const fuelRes = await fetch(`${API_BASE}/fuel_types/${fuelId}`);
            if (!fuelRes.ok) {
              fuelPriceMap.set(fuelId, null);
              return;
            }

            const fuelJson = (await fuelRes.json()) as FuelTypeResponse;
            fuelPriceMap.set(fuelId, asNumber(fuelJson.fuel_price));
          } catch {
            fuelPriceMap.set(fuelId, null);
          }
        })
      );

      const enrichedItems = (recJson.items || []).map((item) => {
        const nextItem = { ...item };
        const fuelId = asNumber(readValue(item, ["fuel_type_id"]));
        const responseFuelPrice = asNumber(readValue(item, ["fuel_price"]));
        const fallbackFuelPrice = fuelId !== null ? fuelPriceMap.get(fuelId) ?? null : null;
        const fuelPrice = responseFuelPrice ?? fallbackFuelPrice;
        const combinedFuel = asNumber(readValue(item, ["COMB (L/100 km)", "COMB_L_100", "comb_l_100"]));

        nextItem.fuel_price = fuelPrice;
        if (fuelPrice !== null && combinedFuel !== null) {
          nextItem.fuel_cost = fuelPrice * combinedFuel * 100;
        }

        return nextItem;
      });

      setResults({
        ...recJson,
        items: enrichedItems,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const items = results?.items || [];
  const hasItems = items.length > 0;
  const finance = results?.finance || {};

  return (
    <div className="af-dashboard-bg min-h-screen">
      <nav
        className="sticky top-0 z-50 flex h-14 items-center justify-between px-6"
        style={{
          background: "var(--navbar-bg)",
          borderBottom: "1px solid var(--border-primary)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Link href="/landing_page" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            <Car className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Auto<span style={{ color: "var(--text-accent)" }}>Fyx</span>
          </span>
        </Link>

        <Link href="/user_dashboard/compare" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm" style={{ color: "var(--text-secondary)", background: "var(--bg-tertiary)" }}>
          <Scale className="h-4 w-4" />
          Compare
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <motion.div className="mb-10 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
            AI Vehicle Recommender
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Type a vehicle request, review the controller fields, and submit the query.
          </p>
        </motion.div>

        <motion.form onSubmit={handleSearch} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <motion.div
            className="relative rounded-2xl p-[2px]"
            style={{ background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)", backgroundSize: "300% 100%" }}
            animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" as const }}
          >
            <div className="rounded-[14px] overflow-hidden" style={{ background: "var(--bg-card)" }}>
              <div className="flex flex-wrap items-center md:flex-nowrap">
                <div className="flex w-full shrink-0 items-center gap-2 border-b px-4 py-4 md:w-auto md:border-b-0 md:border-r" style={{ borderColor: "var(--border-primary)" }}>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>LKR</span>
                  <input
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value.replace(/\D/g, ""))}
                    placeholder="Salary"
                    className="w-full bg-transparent text-base font-medium focus:outline-none md:w-28"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => setSalary((p) => String(Math.min(Number(p || 0) + 50000, 999999999)))} className="rounded p-0.5">
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button type="button" onClick={() => setSalary((p) => String(Math.max(Number(p || 0) - 50000, 0)))} className="rounded p-0.5">
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Type your request, for example: "Family SUV, city, diesel automatic"'
                  className="w-full flex-1 bg-transparent px-4 py-4 text-base focus:outline-none md:w-auto"
                  style={{ color: "var(--text-primary)" }}
                />

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="m-2 flex w-[calc(100%-16px)] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 md:w-auto"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", flexShrink: 0 }}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? <span className="af-spinner" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.3)" }} /> : <Search className="h-4 w-4" />}
                  {loading ? "Searching..." : "Search"}
                </motion.button>
              </div>
            </div>
          </motion.div>

          <div className="mt-5 rounded-2xl border p-5" style={{ borderColor: "var(--border-primary)", background: "var(--bg-card)" }}>
            <div className="mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Settings2 className="h-4 w-4" />
              <span className="text-sm font-semibold">Recommender form</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                <option value="">Purpose</option>
                <option value="daily_commute">Daily commute</option>
                <option value="family">Family</option>
                <option value="performance">Performance</option>
                <option value="luxury">Luxury</option>
              </select>
              <select value={area} onChange={(e) => setArea(e.target.value)} className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                <option value="">Area</option>
                <option value="city">City</option>
                <option value="highway">Highway</option>
                <option value="mixed">Mixed</option>
                <option value="off-road">Off-road</option>
              </select>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                <option value="">Fuel</option>
                <option value="X">Regular petrol</option>
                <option value="Z">Premium petrol</option>
                <option value="D">Diesel</option>
                <option value="E">Electric</option>
              </select>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                <option value="">Transmission</option>
                <option value="A">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
              <input value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value)} placeholder="Vehicle class" className="rounded-xl border px-3 py-3 text-sm uppercase" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              <input value={maxComb} onChange={(e) => setMaxComb(e.target.value)} placeholder="Max L/100km" type="number" step="0.1" className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              <input value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="Interest %" type="number" step="0.1" className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              <input value={months} onChange={(e) => setMonths(e.target.value)} placeholder="Months" type="number" className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              <input value={downPaymentAmount} onChange={(e) => setDownPaymentAmount(e.target.value)} placeholder="Down payment amount" type="number" className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              <input value={downPaymentRatio} onChange={(e) => setDownPaymentRatio(e.target.value)} placeholder="Down payment ratio" type="number" min="0" max="1" step="0.01" className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              <input value={topN} onChange={(e) => setTopN(e.target.value)} placeholder="Top N" type="number" min="1" max="50" className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
              <input value={candidateLimit} onChange={(e) => setCandidateLimit(e.target.value)} placeholder="Candidate limit" type="number" min="100" max="20000" className="rounded-xl border px-3 py-3 text-sm" style={{ borderColor: "var(--border-primary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
            </div>
          </div>
        </motion.form>

        {!hasItems && !loading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => setSearchQuery(s)} className="cursor-pointer rounded-full px-3 py-1.5 text-xs transition-colors" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)", border: "1px solid var(--border-primary)" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 rounded-xl border p-4 text-sm" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)", color: "#f87171" }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {parsedParams && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-primary)" }}>
            <button onClick={() => setShowParsed(!showParsed)} className="flex w-full items-center justify-between px-5 py-3 text-sm font-semibold" style={{ color: "var(--text-secondary)", background: "var(--bg-tertiary)" }}>
              <span>Extracted query parameters</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200" style={{ transform: showParsed ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            {showParsed && (
              <pre className="max-h-[220px] overflow-auto px-5 py-4 text-xs" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                {JSON.stringify(parsedParams, null, 2)}
              </pre>
            )}
          </motion.div>
        )}

        {results && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Recommendations</h2>
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{hasItems ? `${items.length} vehicles found` : results.message || "No results"}</p>
              </div>
              {hasItems && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  AI Ranked
                </span>
              )}
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-4">
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-primary)", background: "var(--bg-card)" }}>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}><Wallet className="h-3.5 w-3.5" /> Salary</div>
                <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>LKR {formatCurrency(finance.salary)}</div>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-primary)", background: "var(--bg-card)" }}>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}><Gauge className="h-3.5 w-3.5" /> Max EMI</div>
                <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>LKR {formatCurrency(finance.max_monthly_emi)}</div>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-primary)", background: "var(--bg-card)" }}>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}><Zap className="h-3.5 w-3.5" /> Interest</div>
                <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{asNumber(finance.rate_of_interest)?.toFixed(1) ?? "-"}%</div>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-primary)", background: "var(--bg-card)" }}>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}><Fuel className="h-3.5 w-3.5" /> Months</div>
                <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{asNumber(finance.number_of_months)?.toFixed(0) ?? "-"}</div>
              </div>
            </div>

            {hasItems && (
              <>
                <div className="mb-6 space-y-5">
                  {items.slice(0, 3).map((item, idx) => (
                    <VehicleRecommendationCard
                      key={String(readValue(item, ["id", "vehicle_id", "VEHICLE_ID"]) || idx)}
                      vehicle={toVehicleCardData(item, idx)}
                    />
                  ))}
                </div>

                <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-primary)", background: "var(--bg-card)" }}>
                  <div className="flex items-center justify-between px-5 py-4 text-sm font-semibold" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", borderBottom: "1px solid var(--border-primary)" }}>
                    <span>All Results ({items.length} vehicles)</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full border-collapse text-left">
                      <thead>
                        <tr className="text-xs uppercase tracking-wider" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                          <th className="border-b px-4 py-3 font-medium" style={{ borderColor: "var(--border-primary)" }}>Score</th>
                          <th className="border-b px-4 py-3 font-medium" style={{ borderColor: "var(--border-primary)" }}>Vehicle</th>
                          <th className="border-b px-4 py-3 font-medium" style={{ borderColor: "var(--border-primary)" }}>Fuel</th>
                          <th className="border-b px-4 py-3 font-medium" style={{ borderColor: "var(--border-primary)" }}>Trans</th>
                          <th className="border-b px-4 py-3 font-medium text-right" style={{ borderColor: "var(--border-primary)" }}>Comb</th>
                          <th className="border-b px-4 py-3 font-medium text-right" style={{ borderColor: "var(--border-primary)" }}>Fuel Cost</th>
                          <th className="border-b px-4 py-3 font-medium text-right" style={{ borderColor: "var(--border-primary)" }}>Avg Price</th>
                          <th className="border-b px-4 py-3 font-medium text-right" style={{ borderColor: "var(--border-primary)" }}>Monthly EMI</th>
                          <th className="border-b px-4 py-3 font-medium text-right" style={{ borderColor: "var(--border-primary)" }}>Yearly Maintenance</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y" style={{ borderColor: "var(--border-secondary)" }}>
                        {items.map((r, idx) => {
                          const score = Number(readValue(r, ["Compatibility_Score", "compatibility_score"]) || 0);
                          const year = String(readValue(r, ["YEAR", "Year", "year"]) || "-");
                          const make = String(readValue(r, ["Make", "MAKE", "make"]) || "-");
                          const model = String(readValue(r, ["Model", "MODEL", "model"]) || "-");
                          const fuel = String(readValue(r, ["FUEL", "Fuel", "fuel"]) || "-");
                          const trans = String(readValue(r, ["Transmission", "TRANSMISSION", "transmission", "Trans"]) || "-");
                          const l100 = String(readValue(r, ["COMB (L/100 km)", "COMB_L_100", "comb_l_100", "Comb L/100"]) || "-");
                          const fuelCost = formatCurrencyLabel(readValue(r, ["fuel_cost"]));
                          const avgPrice = formatCurrency(readValue(r, ["average_price"]));
                          const emi = formatCurrency(readValue(r, ["monthly_emi"]));
                          const maintenanceCost = formatCurrencyLabel(readValue(r, ["maintenance_yearly_cost"]));

                          return (
                            <tr key={idx}>
                              <td className="px-4 py-3"><ScoreBadge score={score} /></td>
                              <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{make} {model}<div className="text-xs" style={{ color: "var(--text-muted)" }}>{year}</div></td>
                              <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{fuel}</td>
                              <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{trans}</td>
                              <td className="px-4 py-3 text-right" style={{ color: "var(--text-secondary)" }}>{l100}</td>
                              <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>{fuelCost}</td>
                              <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>LKR {avgPrice}</td>
                              <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>LKR {emi}</td>
                              <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>{maintenanceCost}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {!hasItems && (
              <div className="rounded-xl p-10 text-center" style={{ background: "var(--bg-card)" }}>
                <Car className="mx-auto mb-4 h-12 w-12" style={{ color: "var(--text-muted)" }} />
                <p className="font-medium" style={{ color: "var(--text-secondary)" }}>{results.message || "No vehicles found matching your criteria."}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Try broadening your search query or relaxing some form filters.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

