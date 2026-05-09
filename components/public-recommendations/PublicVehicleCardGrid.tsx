"use client";

import { motion } from "framer-motion";
import {
  Car,
  Fuel,
  Wrench,
  Info,
  CalendarDays,
  ExternalLink,
  Zap,
} from "lucide-react";

/* ── Helpers ── */
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

interface PublicVehicleCardGridProps {
  items: Record<string, unknown>[];
}

const cardVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: "easeOut" },
  }),
};

export function PublicVehicleCardGrid({ items }: PublicVehicleCardGridProps) {
  return (
    <div className="space-y-6">
      {/* Assumptions banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
        <Info className="h-5 w-5 mt-0.5 shrink-0 text-blue-400" />
        <div className="text-[11px] font-medium leading-relaxed text-zinc-400">
          <span className="font-bold text-zinc-200">Assumptions used in cost calculations:</span>{" "}
          Annual travel distance of{" "}
          <span className="font-bold text-zinc-200">10,000 km/year</span>.{" "}
          Fuel costs computed as:{" "}
          <span className="font-mono font-semibold text-blue-400">
            Fuel Price (LKR/L) × Consumption (L/100 km) × 100
          </span>
          . Maintenance costs fetched directly from the database per vehicle. All costs in{" "}
          <span className="font-bold text-zinc-200">Sri Lankan Rupees (LKR)</span>.
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((v, i) => (
          <PublicVehicleCard key={i} item={v} rank={i + 1} index={i} />
        ))}
      </div>
    </div>
  );
}

function PublicVehicleCard({
  item,
  rank,
  index,
}: {
  item: Record<string, unknown>;
  rank: number;
  index: number;
}) {
  const score = Number(readValue(item, ["Compatibility_Score", "compatibility_score"]) || 0);
  const make = String(readValue(item, ["Make", "MAKE", "make"]) || "—");
  const model = String(readValue(item, ["Model", "MODEL", "model"]) || "—");
  const year = String(readValue(item, ["YEAR", "Year", "year"]) || "—");
  const cls = String(readValue(item, ["VEHICLE CLASS", "vehicle_class"]) || "—");
  const origin = String(readValue(item, ["brand_origin"]) || "other").toLowerCase();
  const boosted = Boolean(readValue(item, ["lk_brand_boosted"]));
  const engine = readValue(item, ["ENGINE SIZE", "ENGINE_SIZE", "engine_size"]);
  const cyls = readValue(item, ["CYLINDERS", "cylinders"]);
  const comb = asNum(readValue(item, ["fuel_efficiency_combined", "COMB (L/100 km)", "comb_l_100"]));
  const trans = String(readValue(item, ["Transmission", "TRANSMISSION", "transmission", "Trans"]) || "—");
  const fuelName = String(readValue(item, ["fuel_type_name", "FUEL", "Fuel", "fuel"]) || "—");
  const minP = readValue(item, ["minimum_price"]);
  const maxP = readValue(item, ["max_price"]);
  const emi = asNum(readValue(item, ["monthly_emi"]));
  const emiPct = asNum(readValue(item, ["emi_vs_salary_percent"]));
  const total = readValue(item, ["total_payable_amount"]);
  const maint = asNum(readValue(item, ["maintainability_score"]));
  const imageUrl = readValue(item, ["image_url"]);

  const downPayment = asNum(readValue(item, ["down_payment_amount"]));
  const averagePrice = asNum(readValue(item, ["average_price"]));
  const loanPrincipal = asNum(readValue(item, ["loan_principal"]));
  const downPaymentPct =
    downPayment !== null && averagePrice !== null && averagePrice > 0
      ? (downPayment / averagePrice) * 100
      : null;

  const fuelPrice = asNum(readValue(item, ["fuel_price"]));
  const annualFuelCost = asNum(readValue(item, ["annual_fuel_cost"]));
  const monthlyFuelCost = asNum(readValue(item, ["monthly_fuel_cost"]));
  const kmPerYear = asNum(readValue(item, ["km_per_year_assumption"])) ?? 10_000;

  const maintYearlyCost = asNum(readValue(item, ["maintenance_yearly_cost"]));
  const maintMonthlyCost = asNum(readValue(item, ["maintenance_monthly_cost"]));
  const maintRecordCount = asNum(readValue(item, ["maintenance_record_count"]));

  const fiveYearFuelCost = annualFuelCost !== null ? annualFuelCost * 5 : null;
  const fiveYearMaintCost = maintYearlyCost !== null ? maintYearlyCost * 5 : null;
  const fiveYearTotalCost =
    fiveYearFuelCost !== null || fiveYearMaintCost !== null
      ? (fiveYearFuelCost ?? 0) + (fiveYearMaintCost ?? 0)
      : null;

  const ikmanMake = make !== "—" ? make.trim().split(/\s+/)[0] : "";
  const ikmanModel = model !== "—" ? model.trim().split(/\s+/)[0] : "";
  const ikmanQuery = encodeURIComponent([ikmanMake, ikmanModel].filter(Boolean).join(" "));
  const ikmanUrl = `https://ikman.lk/en/ads?query=${ikmanQuery}`;

  const originLabel =
    origin === "japanese" ? "🇯🇵 Japanese" : origin === "korean" ? "🇰🇷 Korean" : "🌐 Other";

  const scoreColor =
    score >= 85 ? "#60a5fa" : score >= 70 ? "#f59e0b" : "#ef4444";
  const scoreBg =
    score >= 85
      ? "rgba(96,165,250,0.12)"
      : score >= 70
      ? "rgba(245,158,11,0.12)"
      : "rgba(239,68,68,0.12)";

  const originStyle =
    origin === "japanese"
      ? { bg: "rgba(16,185,129,0.12)", color: "#34d399" }
      : origin === "korean"
      ? { bg: "rgba(139,92,246,0.12)", color: "#a78bfa" }
      : { bg: "rgba(148,163,184,0.08)", color: "#94a3b8" };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}
      className="group relative flex flex-col rounded-3xl border border-white/10 bg-[#0d0d11] overflow-hidden transition-all duration-300"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
    >
      {/* Ambient inner glow */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none z-0"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.25), transparent 60%)" }}
      />

      {/* Top score accent bar */}
      <div
        className="h-1 w-full shrink-0 z-10 relative"
        style={{
          background: `linear-gradient(90deg, ${scoreColor}, #4f46e5)`,
          opacity: Math.max(score / 100, 0.3),
        }}
      />

      {/* Vehicle Image */}
      <div className="relative h-[220px] bg-[#080810] overflow-hidden shrink-0 z-10">
        {/* Rank badge */}
        <span
          className="absolute top-4 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white shadow-lg border border-white/10"
          style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)" }}
        >
          #{rank}
        </span>

        {/* Origin badge */}
        <span
          className="absolute top-4 right-4 z-20 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md"
          style={{ background: originStyle.bg, color: originStyle.color }}
        >
          {originLabel}{boosted ? " ↑" : ""}
        </span>

        {/* Image */}
        {imageUrl && typeof imageUrl === "string" ? (
          <img
            src={imageUrl}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                const fallback = parent.querySelector<HTMLDivElement>(".pub-img-fallback");
                if (fallback) fallback.style.display = "flex";
              }
            }}
          />
        ) : null}
        <div
          className="pub-img-fallback w-full h-full flex-col items-center justify-center gap-2"
          style={{ display: imageUrl && typeof imageUrl === "string" ? "none" : "flex" }}
        >
          <Car className="h-16 w-16 text-zinc-700" />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: "linear-gradient(to top, #0d0d11 0%, transparent 60%)" }}
        />

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <p className="text-xl font-black text-white drop-shadow-xl leading-tight line-clamp-1">
            {make} {model}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 drop-shadow-md mt-1">
            {year} · {cls}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 space-y-4 relative z-10">

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-3">
          <DarkSpec label="Min Price" value={fmtLKR(minP)} />
          <DarkSpec label="Max Price" value={fmtLKR(maxP)} />
          <DarkSpec label="Engine" value={engine ? `${engine}L${cyls ? ` ${cyls}cyl` : ""}` : "—"} />
          <DarkSpec label="Fuel Eff." value={comb != null ? `${comb.toFixed(1)} L/100km` : "—"} />
          <DarkSpec label="Transmission" value={trans} small />
          <DarkSpec label="Fuel Type" value={fuelName} />
          {maint != null && (
            <DarkSpec label="Maintainability" value={`${(maint * 100).toFixed(1)}%`} accent="#34d399" />
          )}
        </div>

        {/* Fuel Cost */}
        {(fuelPrice !== null || annualFuelCost !== null) && (
          <div className="rounded-xl border border-orange-500/15 bg-orange-500/5 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Fuel className="h-3.5 w-3.5 text-orange-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                Fuel Cost Estimate
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {fuelPrice !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Price/Litre</p>
                  <p className="text-xs font-bold text-zinc-300">{fmtLKR(fuelPrice)}</p>
                </div>
              )}
              {comb !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Consumption</p>
                  <p className="text-xs font-bold text-zinc-300">{comb.toFixed(1)} L/100km</p>
                </div>
              )}
              {annualFuelCost !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                    Annual ({(kmPerYear / 1000).toFixed(0)}K km)
                  </p>
                  <p className="text-xs font-bold text-orange-300">{fmtLKR(annualFuelCost)}</p>
                </div>
              )}
              {monthlyFuelCost !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Monthly Fuel</p>
                  <p className="text-xs font-bold text-orange-300">{fmtLKR(monthlyFuelCost)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maintenance Cost */}
        {maintYearlyCost !== null && (
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-emerald-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Maintenance Cost
                </p>
              </div>
              {maintRecordCount !== null && maintRecordCount > 0 && (
                <span className="text-[9px] text-emerald-500 font-medium">
                  avg of {maintRecordCount} record{maintRecordCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Yearly</p>
                <p className="text-xs font-bold text-emerald-300">{fmtLKR(maintYearlyCost)}</p>
              </div>
              {maintMonthlyCost !== null && (
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Monthly</p>
                  <p className="text-xs font-bold text-emerald-300">{fmtLKR(maintMonthlyCost)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5-Year Ownership */}
        {fiveYearTotalCost !== null && (
          <div
            className="rounded-xl p-3 border border-cyan-500/20"
            style={{ background: "linear-gradient(135deg, rgba(8,8,24,0.9) 0%, rgba(15,23,42,0.9) 100%)" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarDays className="h-3.5 w-3.5 text-cyan-400" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                5-Year Ownership Cost
              </p>
              <span className="ml-auto text-[9px] text-zinc-600 font-medium">10K km/yr · DB rates</span>
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
            <p className="text-[9px] text-zinc-600">
              Fuel + Maintenance running costs only · excludes purchase price &amp; insurance
            </p>
          </div>
        )}

        {/* Compatibility bar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              Compatibility
            </span>
            <span
              className="rounded-md px-2.5 py-0.5 text-[10px] font-black tracking-widest"
              style={{ background: scoreBg, color: scoreColor }}
            >
              {score.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(score, 100)}%`,
                background: "linear-gradient(90deg, #2563eb, #4f46e5)",
              }}
            />
          </div>
        </div>
      </div>

      {/* EMI + Down Payment footer */}
      {(emi != null || downPayment !== null) && (
        <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 space-y-3 z-10 relative">
          {downPayment !== null && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Down Payment</p>
                <p className="text-sm font-bold text-zinc-200">{fmtLKR(downPayment)}</p>
              </div>
              <div className="text-right">
                {downPaymentPct !== null && (
                  <span
                    className="inline-block rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
                    style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}
                  >
                    {downPaymentPct.toFixed(1)}% of value
                  </span>
                )}
                {loanPrincipal !== null && (
                  <p className="text-[10px] font-bold mt-1 text-zinc-600">Loan: {fmtLKR(loanPrincipal)}</p>
                )}
              </div>
            </div>
          )}
          {emi != null && (
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Monthly EMI</p>
                <p className="text-sm font-black text-blue-400">{fmtLKR(emi)}</p>
              </div>
              <div className="text-right">
                {emiPct != null && (
                  <p className="text-[11px] font-bold text-zinc-300">{emiPct.toFixed(1)}% of salary</p>
                )}
                {total != null && (
                  <p className="text-[10px] font-bold text-zinc-600">Total: {fmtLKR(total)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ikman.lk link */}
      {ikmanQuery && (
        <div className="px-4 pb-4 z-10 relative">
          <a
            href={ikmanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
            }}
          >
            <span>Search &ldquo;{ikmanMake} {ikmanModel}&rdquo; on ikman.lk</span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
        </div>
      )}
    </motion.div>
  );
}

function DarkSpec({
  label,
  value,
  small,
  accent,
}: {
  label: string;
  value: string;
  small?: boolean;
  accent?: string;
}) {
  return (
    <div className="rounded-xl px-3 py-2 border border-white/5 bg-white/[0.03]">
      <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-zinc-600">{label}</p>
      <p
        className={`font-bold ${small ? "text-[11px]" : "text-xs"}`}
        style={{ color: accent ?? "#e4e4e7" }}
      >
        {value}
      </p>
    </div>
  );
}
