"use client";

import { useMemo, useState } from "react";

type SalaryLevel = "low" | "medium" | "high" | "luxury";
type Purpose = "daily_commute" | "family" | "performance" | "luxury";
type Area = "city" | "highway" | "mixed" | "off-road";

type RecommendRequest = {
  monthly_income?: number;
  salary_level?: SalaryLevel;

  purpose: Purpose;
  area: Area;

  fuel?: string;
  transmission?: string;
  max_comb_l_per_100?: number;
  vehicle_class?: string;

  top_n: number;
  candidate_limit: number;
};

type RecommendResponse = {
  message?: string | null;
  count: number;
  items: Record<string, any>[];
};

const PURPOSE_OPTIONS: { label: string; value: Purpose }[] = [
  { label: "Daily Commute", value: "daily_commute" },
  { label: "Family", value: "family" },
  { label: "Performance", value: "performance" },
  { label: "Luxury", value: "luxury" },
];

const AREA_OPTIONS: { label: string; value: Area }[] = [
  { label: "City", value: "city" },
  { label: "Highway", value: "highway" },
  { label: "Mixed", value: "mixed" },
  { label: "Off-road", value: "off-road" },
];

// These are just UI strings that match what your backend expects.
// Update labels/values to match your DB exactly if needed.
const FUEL_OPTIONS = [
  "Any",
  "D - Diesel",
  "X - Regular Gasoline",
  "Z - Premium Gasoline",
];

const TRANSMISSION_OPTIONS = [
  "Any",
  "A=Automatic",
  "Manual",
];

const SALARY_LEVEL_OPTIONS: { label: string; value: SalaryLevel }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Luxury", value: "luxury" },
];

function toNumberOrUndefined(v: string): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function VehiclesSearchPage() {
  // ---- API base URL ----
  // Put in .env.local => NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

  // ---- Form state ----
  const [monthlyIncome, setMonthlyIncome] = useState<string>(""); // LKR
  const [salaryLevel, setSalaryLevel] = useState<SalaryLevel | "auto">("auto");

  const [purpose, setPurpose] = useState<Purpose>("daily_commute");
  const [area, setArea] = useState<Area>("mixed");

  const [fuel, setFuel] = useState<string>("Any");
  const [transmission, setTransmission] = useState<string>("Any");
  const [vehicleClass, setVehicleClass] = useState<string>("");

  const [maxComb, setMaxComb] = useState<string>(""); // L/100km

  const [topN, setTopN] = useState<number>(10);
  const [candidateLimit, setCandidateLimit] = useState<number>(2000);

  // ---- UI state ----
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<RecommendResponse | null>(null);

  const requestBody: RecommendRequest = useMemo(() => {
    const body: RecommendRequest = {
      purpose,
      area,
      top_n: topN,
      candidate_limit: candidateLimit,
    };

    const inc = toNumberOrUndefined(monthlyIncome);
    if (inc !== undefined) body.monthly_income = inc;

    if (salaryLevel !== "auto") body.salary_level = salaryLevel;

    const mc = toNumberOrUndefined(maxComb);
    if (mc !== undefined) body.max_comb_l_per_100 = mc;

    if (fuel !== "Any") body.fuel = fuel;
    if (transmission !== "Any") body.transmission = transmission;
    if (vehicleClass.trim()) body.vehicle_class = vehicleClass.trim();

    return body;
  }, [purpose, area, topN, candidateLimit, monthlyIncome, salaryLevel, maxComb, fuel, transmission, vehicleClass]);

  async function onSearch() {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${API_BASE}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const json = (await res.json()) as RecommendResponse;

      if (!res.ok) {
        setError(json?.message || `Request failed (${res.status})`);
        setLoading(false);
        return;
      }

      setData(json);
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  function onReset() {
    setMonthlyIncome("");
    setSalaryLevel("auto");
    setPurpose("daily_commute");
    setArea("mixed");
    setFuel("Any");
    setTransmission("Any");
    setVehicleClass("");
    setMaxComb("");
    setTopN(10);
    setCandidateLimit(2000);
    setData(null);
    setError(null);
  }

  const items = data?.items || [];
  const hasItems = items.length > 0;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold">Find Your Best Vehicle</h1>
          <p className="text-sm text-gray-600">
            Select your budget and preferences. We will filter from the database and rank vehicles using ML scoring.
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Income */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Monthly Income (LKR)</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g., 250000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                If you enter income, backend auto maps to salary_level (low/medium/high/luxury).
              </p>
            </div>

            {/* Salary level override */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Salary Level (override)</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={salaryLevel}
                onChange={(e) => setSalaryLevel(e.target.value as any)}
              >
                <option value="auto">Auto (from income)</option>
                {SALARY_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Choose this only if you want to override income mapping.</p>
            </div>

            {/* Purpose */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Purpose</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as Purpose)}
              >
                {PURPOSE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Primary Usage Area</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={area}
                onChange={(e) => setArea(e.target.value as Area)}
              >
                {AREA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Fuel (optional)</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
              >
                {FUEL_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Transmission (optional)</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                {TRANSMISSION_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle class */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle Class (optional)</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g., COMPACT"
                value={vehicleClass}
                onChange={(e) => setVehicleClass(e.target.value)}
              />
              <p className="text-xs text-gray-500">If provided, this will force that exact class (DB).</p>
            </div>

            {/* Max fuel consumption */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Max Fuel (COMB L/100km)</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g., 10"
                value={maxComb}
                onChange={(e) => setMaxComb(e.target.value)}
              />
            </div>

            {/* Output controls */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Top N</label>
              <input
                type="number"
                min={1}
                max={50}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Candidate Limit (DB)</label>
              <input
                type="number"
                min={100}
                max={20000}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                value={candidateLimit}
                onChange={(e) => setCandidateLimit(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onSearch}
              disabled={loading}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search Vehicles"}
            </button>
            <button
              onClick={onReset}
              disabled={loading}
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              Reset
            </button>
          </div>

          {/* Debug request body (optional) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600">View Request JSON</summary>
            <pre className="mt-2 rounded-xl bg-gray-50 p-3 text-xs overflow-auto">
              {JSON.stringify(requestBody, null, 2)}
            </pre>
          </details>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty / message */}
        {data?.message && (
          <div className="rounded-2xl border bg-white p-4 text-sm text-gray-700">
            {data.message}
          </div>
        )}

        {/* Results */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold">Recommendations</h2>
            <p className="text-sm text-gray-600">
              {hasItems ? `${items.length} results` : "No results yet"}
            </p>
          </div>

          {hasItems ? (
            <div className="mt-4 overflow-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="text-left text-gray-600">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Score</th>
                    <th className="py-2 pr-3">Year</th>
                    <th className="py-2 pr-3">Make</th>
                    <th className="py-2 pr-3">Model</th>
                    <th className="py-2 pr-3">Class</th>
                    <th className="py-2 pr-3">Engine</th>
                    <th className="py-2 pr-3">Cyl</th>
                    <th className="py-2 pr-3">Trans</th>
                    <th className="py-2 pr-3">Fuel</th>
                    <th className="py-2 pr-3">Comb</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 font-medium">
                        {r.Compatibility_Score ?? "-"}
                      </td>
                      <td className="py-2 pr-3">{r.YEAR ?? "-"}</td>
                      <td className="py-2 pr-3">{r.MAKE ?? "-"}</td>
                      <td className="py-2 pr-3">{r.MODEL ?? "-"}</td>
                      <td className="py-2 pr-3">{r["VEHICLE CLASS"] ?? "-"}</td>
                      <td className="py-2 pr-3">{r["ENGINE SIZE"] ?? "-"}</td>
                      <td className="py-2 pr-3">{r.CYLINDERS ?? "-"}</td>
                      <td className="py-2 pr-3">{r.TRANSMISSION ?? "-"}</td>
                      <td className="py-2 pr-3">{r.FUEL ?? "-"}</td>
                      <td className="py-2 pr-3">{r["COMB (L/100 km)"] ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-3 text-xs text-gray-500">
                Tip: If you get “No vehicles matched…”, try setting Fuel/Transmission to “Any” or increasing Candidate Limit.
              </p>
            </div>
          ) : (
            <div className="mt-4 text-sm text-gray-600">
              Fill filters and click <b>Search Vehicles</b>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
