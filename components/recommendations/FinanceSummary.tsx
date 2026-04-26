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

interface FinanceSummaryProps {
  finance: Record<string, unknown>;
  salary: number;
  purpose: string;
  area: string;
  vehicleClasses: string[];
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-base font-bold" style={{ color: accent ?? "#1e293b" }}>{value}</p>
    </div>
  );
}

export function FinanceSummary({ finance, salary, purpose, area, vehicleClasses }: FinanceSummaryProps) {
  const rate = asNum(finance.rate_of_interest);
  const mo   = asNum(finance.number_of_months);

  return (
    <div className="mb-6">
      {/* Status row */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-slate-700">
          LKR {new Intl.NumberFormat("en-LK").format(salary)}
        </span>
        <span className="text-slate-300">·</span>
        <span className="capitalize text-slate-500">{purpose.replace("_", " ")}</span>
        <span className="text-slate-300">·</span>
        <span className="capitalize text-slate-500">{area}</span>
      </div>

      {/* Auto-selected classes */}
      <div className="mb-4 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-700">
          Auto-selected vehicle classes
        </p>
        <div className="flex flex-wrap gap-1.5">
          {vehicleClasses.map((c) => (
            <span key={c} className="rounded-lg border border-cyan-200 bg-white px-2 py-0.5 text-[10px] font-bold text-cyan-700 shadow-sm">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Finance stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Max EMI"       value={fmtLKR(finance.max_monthly_emi)} accent="#0891b2" />
        <StatCard label="Down Payment"  value={
          finance.down_payment_amount != null
            ? fmtLKR(finance.down_payment_amount)
            : finance.down_payment_ratio != null
            ? `${((asNum(finance.down_payment_ratio) ?? 0) * 100).toFixed(0)}%`
            : "—"
        } />
        <StatCard label="Interest"      value={rate != null ? `${rate.toFixed(1)}%` : "—"} />
        <StatCard label="Tenure"        value={mo   != null ? `${mo} months`        : "—"} />
      </div>
    </div>
  );
}
