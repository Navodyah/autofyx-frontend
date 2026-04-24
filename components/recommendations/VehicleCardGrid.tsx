"use client";

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((v, i) => <VehicleCard key={i} item={v} rank={i + 1} />)}
    </div>
  );
}

function VehicleCard({ item, rank }: { item: Record<string, unknown>; rank: number }) {
  const score   = Number(readValue(item, ["Compatibility_Score", "compatibility_score"]) || 0);
  const make    = String(readValue(item, ["Make",  "MAKE",  "make"])  || "—");
  const model   = String(readValue(item, ["Model", "MODEL", "model"]) || "—");
  const year    = String(readValue(item, ["YEAR",  "Year",  "year"])  || "—");
  const cls     = String(readValue(item, ["VEHICLE CLASS", "vehicle_class"]) || "—");
  const origin  = String(readValue(item, ["brand_origin"]) || "other").toLowerCase();
  const boosted = Boolean(readValue(item, ["lk_brand_boosted"]));
  const engine  = readValue(item, ["ENGINE SIZE", "ENGINE_SIZE", "engine_size"]);
  const cyls    = readValue(item, ["CYLINDERS", "cylinders"]);
  const comb    = asNum(readValue(item, ["COMB (L/100 km)", "COMB_L_100", "comb_l_100"]));
  const trans   = String(readValue(item, ["Transmission", "TRANSMISSION", "transmission", "Trans"]) || "—");
  const fuel    = String(readValue(item, ["FUEL", "Fuel", "fuel"]) || "—");
  const minP    = readValue(item, ["minimum_price"]);
  const maxP    = readValue(item, ["max_price"]);
  const emi     = asNum(readValue(item, ["monthly_emi"]));
  const emiPct  = asNum(readValue(item, ["emi_vs_salary_percent"]));
  const total   = readValue(item, ["total_payable_amount"]);
  const maint   = asNum(readValue(item, ["maintainability_score"]));
  const maintCost = readValue(item, ["maintenance_yearly_cost"]);

  const originLabel =
    origin === "japanese" ? "🇯🇵 Japanese" :
    origin === "korean"   ? "🇰🇷 Korean"   : "🌐 Other";

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
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-cyan-300 overflow-hidden">

      {/* Top accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, #0891b2, #4f46e5)`, opacity: score / 100 }}
      />

      <div className="flex-1 p-5">
        {/* Rank */}
        <span
          className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #0891b2, #4f46e5)" }}
        >
          {rank}
        </span>

        {/* Name */}
        <p className="pr-8 text-base font-bold text-slate-800">{make} {model}</p>
        <p className="mb-2 text-xs text-slate-400">{year} · {cls}</p>

        {/* Origin badge */}
        <span
          className="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold"
          style={{ background: originStyle.bg, color: originStyle.color }}
        >
          {originLabel}{boosted ? " ↑" : ""}
        </span>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Spec label="Min Price"    value={fmtLKR(minP)} />
          <Spec label="Max Price"    value={fmtLKR(maxP)} />
          <Spec label="Engine"       value={engine ? `${engine}L${cyls ? ` ${cyls}cyl` : ""}` : "—"} />
          <Spec label="Fuel Comb."   value={comb != null ? `${comb.toFixed(1)} L/100` : "—"} />
          <Spec label="Transmission" value={trans} small />
          <Spec label="Fuel Type"    value={fuel} />
          {maint != null && (
            <Spec label="Maintainability" value={`${(maint * 100).toFixed(1)}%`} accent="#059669" />
          )}
          {maintCost != null && (
            <Spec label="Yearly Maint." value={fmtLKR(maintCost)} />
          )}
        </div>

        {/* Compatibility bar */}
        <div className="mb-2">
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

      {/* EMI footer */}
      {emi != null && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-center justify-between">
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
