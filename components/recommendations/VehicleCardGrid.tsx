"use client";

import { Car, Fuel, Wrench, Info, CalendarDays, ExternalLink } from "lucide-react";

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
  return (
    <div className="space-y-5">
      {/* ── Assumptions Banner ── */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <span className="font-bold">Assumptions used in cost calculations:</span>
          {" "}Annual travel distance of{" "}
          <span className="font-bold">10,000 km/year</span>.
          Fuel costs are computed as:{" "}
          <span className="font-mono font-semibold">Fuel Price (LKR/L) × Consumption (L/100 km) × 100</span>.
          Maintenance costs are fetched directly from the database per vehicle.
          All costs shown in{" "}
          <span className="font-bold">Sri Lankan Rupees (LKR)</span>.
        </div>
      </div>

      {/* ── Vehicle Cards Grid ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((v, i) => <VehicleCard key={i} item={v} rank={i + 1} />)}
      </div>
    </div>
  );
}

function VehicleCard({ item, rank }: { item: Record<string, unknown>; rank: number }) {
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
    score >= 85 ? "#0891b2" : score >= 70 ? "#d97706" : "#ef4444";
  const scoreBg =
    score >= 85 ? "rgba(8,145,178,0.1)" : score >= 70 ? "rgba(217,119,6,0.1)" : "rgba(239,68,68,0.1)";

  const originStyle =
    origin === "japanese"
      ? { bg: "rgba(5,150,105,0.08)", color: "#059669" }
      : origin === "korean"
        ? { bg: "rgba(79,70,229,0.08)", color: "#4f46e5" }
        : { bg: "rgba(100,116,139,0.08)", color: "#64748b" };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-cyan-300 overflow-hidden">

      {/* Top accent bar */}
      <div
        className="h-1 w-full shrink-0"
        style={{ background: `linear-gradient(90deg, #0891b2, #4f46e5)`, opacity: Math.max(score / 100, 0.3) }}
      />

      {/* ── Vehicle Image ── */}
      <div className="relative h-48 bg-slate-900 overflow-hidden shrink-0">
        {/* Rank badge */}
        <span
          className="absolute top-3 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #0891b2, #4f46e5)" }}
        >
          {rank}
        </span>

        {/* Origin badge */}
        <span
          className="absolute top-3 right-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm"
          style={{ background: originStyle.bg, color: originStyle.color, backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,0.85)" }}
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
          className="img-fallback w-full h-full flex-col items-center justify-center gap-2"
          style={{ display: imageUrl && typeof imageUrl === "string" ? "none" : "flex" }}
        >
          <Car className="h-14 w-14 text-slate-600 opacity-40" />
          <p className="text-xs font-medium text-slate-500 opacity-60">No image available</p>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Name overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <p className="text-base font-extrabold text-white drop-shadow-lg leading-tight line-clamp-1">{make} {model}</p>
          <p className="text-xs text-white/70 font-medium">{year} · {cls}</p>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="flex-1 p-4 space-y-3">

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2">
          <Spec label="Min Price" value={fmtLKR(minP)} />
          <Spec label="Max Price" value={fmtLKR(maxP)} />
          <Spec label="Engine" value={engine ? `${engine}L${cyls ? ` ${cyls}cyl` : ""}` : "—"} />
          <Spec label="Fuel Eff." value={comb != null ? `${comb.toFixed(1)} L/100km` : "—"} />
          <Spec label="Transmission" value={trans} small />
          <Spec label="Fuel Type" value={fuelName} />
          {maint != null && (
            <Spec label="Maintainability" value={`${(maint * 100).toFixed(1)}%`} accent="#059669" />
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
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Compatibility</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: scoreBg, color: scoreColor }}
            >
              {score.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(score, 100)}%`,
                background: "linear-gradient(90deg, #0891b2, #4f46e5)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── EMI + Down Payment footer ── */}
      {(emi != null || downPayment !== null) && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-2">

          {/* Down Payment row */}
          {downPayment !== null && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Down Payment</p>
                <p className="text-sm font-bold text-slate-700">{fmtLKR(downPayment)}</p>
              </div>
              <div className="text-right">
                {downPaymentPct !== null && (
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#4f46e5" }}
                  >
                    {downPaymentPct.toFixed(1)}% of vehicle price
                  </span>
                )}
                {loanPrincipal !== null && (
                  <p className="text-[10px] text-slate-400 mt-0.5">Loan: {fmtLKR(loanPrincipal)}</p>
                )}
              </div>
            </div>
          )}

          {/* EMI row */}
          {emi != null && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Monthly EMI</p>
                <p className="text-sm font-bold text-cyan-700">{fmtLKR(emi)}</p>
              </div>
              <div className="text-right">
                {emiPct != null && (
                  <p className="text-xs text-slate-500">{emiPct.toFixed(1)}% of salary</p>
                )}
                {total != null && (
                  <p className="text-[10px] text-slate-400">Total: {fmtLKR(total)}</p>
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

function Spec({ label, value, small, accent }: { label: string; value: string; small?: boolean; accent?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
      <p
        className={`font-semibold ${small ? "text-[10px]" : "text-xs"}`}
        style={{ color: accent ?? "#334155" }}
      >
        {value}
      </p>
    </div>
  );
}
