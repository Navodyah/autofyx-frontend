"use client";

import { useState, useEffect } from "react";
import { Car, Fuel, Wrench, Info, CalendarDays, ExternalLink } from "lucide-react";

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

function asNum(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function fmtLKR(v: unknown) {
  const n = asNum(v);
  if (n === null) return "—";
  return "LKR " + new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(n);
}
function readValue(row: Record<string, unknown>, keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

interface VehicleCardGridProps {
  items: Record<string, unknown>[];
}

export function VehicleCardGrid({ items }: VehicleCardGridProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handler = () => setIsDarkMode(prev => !prev);
    window.addEventListener('themeToggle', handler);
    return () => window.removeEventListener('themeToggle', handler);
  }, []);

  const P = isDarkMode ? D : L;

  return (
    <div className="space-y-6">
      {/* ── Assumptions Banner ── */}
      <div className="flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-sm transition-colors duration-500" style={{ background: isDarkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', borderColor: P.border }}>
        <Info className="h-5 w-5 mt-0.5 shrink-0 transition-colors duration-500" style={{ color: P.primary }} />
        <div className="text-[11px] font-medium leading-relaxed transition-colors duration-500" style={{ color: P.text }}>
          <span className="font-bold">Assumptions used in cost calculations:</span>
          {" "}Annual travel distance of{" "}
          <span className="font-bold">10,000 km/year</span>.
          Fuel costs are computed as:{" "}
          <span className="font-mono font-semibold" style={{ color: P.primary }}>Fuel Price (LKR/L) × Consumption (L/100 km) × 100</span>.
          Maintenance costs are fetched directly from the database per vehicle.
          All costs shown in{" "}
          <span className="font-bold">Sri Lankan Rupees (LKR)</span>.
        </div>
      </div>

      {/* ── Vehicle Cards Grid ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((v, i) => <VehicleCard key={i} item={v} rank={i + 1} P={P} isDarkMode={isDarkMode} />)}
      </div>
    </div>
  );
}

function VehicleCard({ item, rank, P, isDarkMode }: { item: Record<string, unknown>; rank: number, P: any, isDarkMode: boolean }) {
  const score = Number(readValue(item, ["Compatibility_Score", "compatibility_score"]) || 0);
  const make = String(readValue(item, ["Make", "MAKE", "make"]) || "—");
  const model = String(readValue(item, ["Model", "MODEL", "model"]) || "—");
  const year = String(readValue(item, ["YEAR", "Year", "year"]) || "—");
  const cls = String(readValue(item, ["VEHICLE CLASS", "vehicle_class"]) || "—");
  const origin = String(readValue(item, ["brand_origin"]) || "other").toLowerCase();
  const boosted = Boolean(readValue(item, ["lk_brand_boosted"]));
  const engine = readValue(item, ["ENGINE SIZE", "ENGINE_SIZE", "engine_size"]);
  const cyls = readValue(item, ["CYLINDERS", "cylinders"]);
  // fuel_efficiency_combined is now a dedicated column from the backend
  const comb = asNum(readValue(item, ["fuel_efficiency_combined", "COMB (L/100 km)", "comb_l_100"]));
  const trans = String(readValue(item, ["Transmission", "TRANSMISSION", "transmission", "Trans"]) || "—");
  // fuel_type_name is now a dedicated column from the backend
  const fuelName = String(readValue(item, ["fuel_type_name", "FUEL", "Fuel", "fuel"]) || "—");
  const minP = readValue(item, ["minimum_price"]);
  const maxP = readValue(item, ["max_price"]);
  const emi = asNum(readValue(item, ["monthly_emi"]));
  const emiPct = asNum(readValue(item, ["emi_vs_salary_percent"]));
  const total = readValue(item, ["total_payable_amount"]);
  const maint = asNum(readValue(item, ["maintainability_score"]));
  // image_url is now a dedicated column from the backend
  const imageUrl = readValue(item, ["image_url"]);

  // Down payment info (returned by recommender controller)
  const downPayment    = asNum(readValue(item, ["down_payment_amount"]));
  const averagePrice   = asNum(readValue(item, ["average_price"]));
  const loanPrincipal  = asNum(readValue(item, ["loan_principal"]));
  // Down payment as % of average price
  const downPaymentPct =
    downPayment !== null && averagePrice !== null && averagePrice > 0
      ? (downPayment / averagePrice) * 100
      : null;

  // Fuel cost data — fuel_price comes directly from backend via fuel_types JOIN
  const fuelPrice = asNum(readValue(item, ["fuel_price"]));
  // Fuel costs calculated in page.tsx from the backend-provided values
  const annualFuelCost = asNum(readValue(item, ["annual_fuel_cost"]));
  const monthlyFuelCost = asNum(readValue(item, ["monthly_fuel_cost"]));
  const kmPerYear = asNum(readValue(item, ["km_per_year_assumption"])) ?? 10_000;

  // Maintenance costs — fetched via LATERAL JOIN AVG() in the backend pipeline SQL
  const maintYearlyCost = asNum(readValue(item, ["maintenance_yearly_cost"]));
  const maintMonthlyCost = asNum(readValue(item, ["maintenance_monthly_cost"]));
  const maintRecordCount = asNum(readValue(item, ["maintenance_record_count"]));

  // ── 5-Year Cost of Ownership ──────────────────────────────────────────────
  // Formula: (annual fuel cost × 5) + (yearly maintenance × 5)
  const fiveYearFuelCost = annualFuelCost !== null ? annualFuelCost * 5 : null;
  const fiveYearMaintCost = maintYearlyCost !== null ? maintYearlyCost * 5 : null;
  const fiveYearTotalCost =
    (fiveYearFuelCost !== null || fiveYearMaintCost !== null)
      ? (fiveYearFuelCost ?? 0) + (fiveYearMaintCost ?? 0)
      : null;

  // ── ikman.lk search URL ───────────────────────────────────────────────────
  // Use first two tokens: Make (word 1) + Model (word 1)
  const ikmanMake = make !== "—" ? make.trim().split(/\s+/)[0] : "";
  const ikmanModel = model !== "—" ? model.trim().split(/\s+/)[0] : "";
  const ikmanQuery = encodeURIComponent([ikmanMake, ikmanModel].filter(Boolean).join(" "));
  const ikmanUrl = `https://ikman.lk/en/ads?query=${ikmanQuery}`;

  const originLabel =
    origin === "japanese" ? "🇯🇵 Japanese" :
      origin === "korean" ? "🇰🇷 Korean" : "🌐 Other";

  const scoreColor =
    score >= 85 ? P.primary : score >= 70 ? "#f59e0b" : "#ef4444";
  const scoreBg =
    score >= 85 ? (isDarkMode ? "rgba(21,93,252,0.1)" : "rgba(21,93,252,0.1)") : score >= 70 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";

  const originStyle =
    origin === "japanese"
      ? { bg: "rgba(16,185,129,0.1)", color: "#10b981" }
      : origin === "korean"
        ? { bg: "rgba(99,102,241,0.1)", color: "#6366f1" }
        : { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" };

  return (
    <div className="group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-500 hover:-translate-y-2 block" style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}>
      
      {/* Subtle ambient glow inside the card */}
      <div className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500 z-0" 
           style={{ background: `radial-gradient(circle at 50% 0%, ${P.primary}, transparent 60%)` }} />

      {/* Top accent bar */}
      <div
        className="h-1.5 w-full shrink-0 z-10 relative"
        style={{ background: `linear-gradient(90deg, ${P.primary}, #4f46e5)`, opacity: Math.max(score / 100, 0.4) }}
      />

      {/* ── Vehicle Image ── */}
      <div className="relative h-[220px] bg-slate-900 overflow-hidden shrink-0 z-10">
        {/* Rank badge */}
        <span
          className="absolute top-4 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white shadow-lg border border-white/20"
          style={{ background: `linear-gradient(135deg, ${P.primary}, #4f46e5)` }}
        >
          #{rank}
        </span>

        {/* Origin badge */}
        <span
          className="absolute top-4 right-4 z-20 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/10"
          style={{ background: originStyle.bg, color: originStyle.color, backdropFilter: "blur(12px)", backgroundColor: "rgba(255,255,255,0.85)" }}
        >
          {originLabel}{boosted ? " ↑" : ""}
        </span>

        {/* Vehicle image — uses native img with onError fallback */}
        {imageUrl && typeof imageUrl === "string" ? (
          <img
            src={imageUrl}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              // Hide broken image and show placeholder
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                const fallback = parent.querySelector<HTMLDivElement>(".img-fallback");
                if (fallback) fallback.style.display = "flex";
              }
            }}
          />
        ) : null}
        {/* Fallback placeholder — hidden when image loads successfully */}
        <div
          className="img-fallback w-full h-full flex-col items-center justify-center gap-2 transition-colors duration-500"
          style={{ display: imageUrl && typeof imageUrl === "string" ? "none" : "flex", background: P.iconBg }}
        >
          <Car className="h-16 w-16 opacity-10" />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-90 pointer-events-none z-10 transition-colors duration-500" style={{ backgroundImage: `linear-gradient(to top, ${P.cardBg}, transparent)` }} />

        {/* Name overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <p className="text-xl font-black transition-colors duration-500 drop-shadow-lg leading-tight line-clamp-1" style={{ color: P.text }}>{make} {model}</p>
          <p className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-500 drop-shadow-md mt-1" style={{ color: P.primary }}>{year} · {cls}</p>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="flex-1 p-5 space-y-4 relative z-10">

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-3">
          <Spec label="Min Price" value={fmtLKR(minP)} P={P} isDarkMode={isDarkMode} />
          <Spec label="Max Price" value={fmtLKR(maxP)} P={P} isDarkMode={isDarkMode} />
          <Spec label="Engine" value={engine ? `${engine}L${cyls ? ` ${cyls}cyl` : ""}` : "—"} P={P} isDarkMode={isDarkMode} />
          <Spec label="Fuel Eff." value={comb != null ? `${comb.toFixed(1)} L/100km` : "—"} P={P} isDarkMode={isDarkMode} />
          <Spec label="Transmission" value={trans} small P={P} isDarkMode={isDarkMode} />
          <Spec label="Fuel Type" value={fuelName} P={P} isDarkMode={isDarkMode} />
          {maint != null && (
            <Spec label="Maintainability" value={`${(maint * 100).toFixed(1)}%`} accent="#10b981" P={P} isDarkMode={isDarkMode} />
          )}
        </div>

        {/* ── Fuel Cost Section ── */}
        {(fuelPrice !== null || annualFuelCost !== null) && (
          <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Fuel className="h-3.5 w-3.5 text-orange-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">Fuel Cost Estimate</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {fuelPrice !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Price/Litre</p>
                  <p className="text-xs font-bold text-slate-700">{fmtLKR(fuelPrice)}</p>
                </div>
              )}
              {comb !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Consumption</p>
                  <p className="text-xs font-bold text-slate-700">{comb.toFixed(1)} L/100km</p>
                </div>
              )}
              {annualFuelCost !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Annual ({(kmPerYear / 1000).toFixed(0)}K km)</p>
                  <p className="text-xs font-bold text-orange-700">{fmtLKR(annualFuelCost)}</p>
                </div>
              )}
              {monthlyFuelCost !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Monthly Fuel</p>
                  <p className="text-xs font-bold text-orange-700">{fmtLKR(monthlyFuelCost)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Maintenance Cost Section ── */}
        {maintYearlyCost !== null && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-emerald-600" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Maintenance Cost</p>
              </div>
              {maintRecordCount !== null && maintRecordCount > 0 && (
                <span className="text-[9px] text-emerald-600 font-medium">
                  avg of {maintRecordCount} record{maintRecordCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Yearly</p>
                <p className="text-xs font-bold text-emerald-700">{fmtLKR(maintYearlyCost)}</p>
              </div>
              {maintMonthlyCost !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Monthly</p>
                  <p className="text-xs font-bold text-emerald-700">{fmtLKR(maintMonthlyCost)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 5-Year Cost of Ownership ── */}
        {fiveYearTotalCost !== null && (
          <div
            className="rounded-xl p-3 border"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderColor: "#334155",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarDays className="h-3.5 w-3.5 text-cyan-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">5-Year Ownership Cost</p>
              <span className="ml-auto text-[9px] text-slate-500 font-medium">10K km/yr · DB rates</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {fiveYearFuelCost !== null && (
                <div className="rounded-lg bg-white/5 px-2 py-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-orange-400 mb-0.5">Fuel (5yr)</p>
                  <p className="text-[11px] font-bold text-orange-300">{fmtLKR(fiveYearFuelCost)}</p>
                </div>
              )}
              {fiveYearMaintCost !== null && (
                <div className="rounded-lg bg-white/5 px-2 py-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">Maint. (5yr)</p>
                  <p className="text-[11px] font-bold text-emerald-300">{fmtLKR(fiveYearMaintCost)}</p>
                </div>
              )}
              <div className="rounded-lg bg-cyan-500/10 px-2 py-1.5 border border-cyan-500/20">
                <p className="text-[8px] font-bold uppercase tracking-wider text-cyan-400 mb-0.5">Total</p>
                <p className="text-[11px] font-extrabold text-cyan-300">{fmtLKR(fiveYearTotalCost)}</p>
              </div>
            </div>
            <p className="text-[9px] text-slate-500">
              Fuel + Maintenance running costs only · excludes purchase price &amp; insurance
            </p>
          </div>
        )}

        {/* Compatibility bar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest transition-colors duration-500" style={{ color: P.muted }}>Compatibility</span>
            <span
              className="rounded-md px-2.5 py-0.5 text-[10px] font-black tracking-widest shadow-sm"
              style={{ background: scoreBg, color: scoreColor }}
            >
              {score.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full transition-colors duration-500 shadow-inner" style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0' }}>
            <div
              className="h-full rounded-full transition-all duration-700 shadow-sm"
              style={{
                width: `${Math.min(score, 100)}%`,
                background: `linear-gradient(90deg, ${P.primary}, #4f46e5)`,
              }}
            />
          </div>
        </div>
      </div>

        {/* ── EMI + Down Payment footer ── */}
        {(emi != null || downPayment !== null) && (
          <div className="rounded-2xl border px-4 py-4 space-y-3 transition-colors duration-500" style={{ background: isDarkMode ? 'rgba(21,93,252,0.05)' : '#F0F4FF', borderColor: P.border }}>

            {/* Down Payment row */}
            {downPayment !== null && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest transition-colors duration-500" style={{ color: P.muted }}>Down Payment</p>
                  <p className="text-sm font-bold transition-colors duration-500" style={{ color: P.text }}>{fmtLKR(downPayment)}</p>
                </div>
                <div className="text-right">
                  {downPaymentPct !== null && (
                    <span
                      className="inline-block rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors duration-500"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
                    >
                      {downPaymentPct.toFixed(1)}% of value
                    </span>
                  )}
                  {loanPrincipal !== null && (
                    <p className="text-[10px] font-bold mt-1 transition-colors duration-500" style={{ color: P.muted }}>Loan: {fmtLKR(loanPrincipal)}</p>
                  )}
                </div>
              </div>
            )}

            {/* EMI row */}
            {emi != null && (
              <div className="flex items-center justify-between border-t pt-3 transition-colors duration-500" style={{ borderColor: P.border }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest transition-colors duration-500" style={{ color: P.muted }}>Monthly EMI</p>
                  <p className="text-sm font-black transition-colors duration-500" style={{ color: P.primary }}>{fmtLKR(emi)}</p>
                </div>
                <div className="text-right">
                  {emiPct != null && (
                    <p className="text-[11px] font-bold transition-colors duration-500" style={{ color: P.text }}>{emiPct.toFixed(1)}% of salary</p>
                  )}
                  {total != null && (
                    <p className="text-[10px] font-bold transition-colors duration-500" style={{ color: P.muted }}>Total: {fmtLKR(total)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      {/* ── ikman.lk Search Link ── */}
      {ikmanQuery && (
        <div className="border-t border-slate-100 px-4 py-3">
          <a
            href={ikmanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
            }}
          >
            <span>Search &ldquo;{ikmanMake} {ikmanModel}&rdquo; on ikman.lk</span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        </div>
      )}
    </div>
  );
}

function Spec({ label, value, small, accent, P, isDarkMode }: { label: string; value: string; small?: boolean; accent?: string; P: any; isDarkMode: boolean }) {
  return (
    <div className="rounded-xl px-3 py-2 border shadow-sm transition-colors duration-500" style={{ background: P.iconBg, borderColor: P.border }}>
      <p className="text-[9px] font-black uppercase tracking-widest mb-1 transition-colors duration-500" style={{ color: P.muted }}>{label}</p>
      <p
        className={`font-bold ${small ? "text-[11px]" : "text-xs"} transition-colors duration-500`}
        style={{ color: accent ?? P.text }}
      >
        {value}
      </p>
    </div>
  );
}
