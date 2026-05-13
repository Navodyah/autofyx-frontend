"use client";

import React, { useState, useEffect } from "react";

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

interface FinanceSummaryProps {
  finance: Record<string, unknown>;
  salary: number;
  purpose: string;
  area: string;
  vehicleClasses: string[];
}

function StatCard({ label, value, P, isDarkMode }: { label: string; value: string; P: any; isDarkMode: boolean }) {
  return (
    <div className="rounded-2xl border px-5 py-4 shadow-sm transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 transition-colors duration-500" style={{ color: P.muted }}>{label}</p>
      <p className="text-xl font-black transition-colors duration-500" style={{ color: P.primary }}>{value}</p>
    </div>
  );
}

export function FinanceSummary({ finance, salary, purpose, area, vehicleClasses }: FinanceSummaryProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const rate = asNum(finance.rate_of_interest);
  const mo   = asNum(finance.number_of_months);

  useEffect(() => {
    // Read initial theme from localStorage
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    setIsDarkMode(stored);
    // Listen for theme changes dispatched by the sidebar
    const handler = (e: any) => setIsDarkMode(e.detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  const P = isDarkMode ? D : L;

  return (
    <div className="mb-8">
      {/* Status row */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: P.text }}>
        <span className="px-3 py-1.5 rounded-md border shadow-sm transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border, color: P.primary }}>
          LKR {new Intl.NumberFormat("en-LK").format(salary)}
        </span>
        <span className="opacity-40 text-lg">·</span>
        <span className="px-3 py-1.5 rounded-md border shadow-sm transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>{purpose.replace("_", " ")}</span>
        <span className="opacity-40 text-lg">·</span>
        <span className="px-3 py-1.5 rounded-md border shadow-sm transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>{area}</span>
      </div>

      {/* Auto-selected classes */}
      <div className="mb-6 rounded-2xl border px-5 py-4 transition-colors duration-500 shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.05)' : '#F0F4FF', borderColor: P.border }}>
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-500" style={{ color: P.primary }}>
          Auto-selected vehicle classes
        </p>
        <div className="flex flex-wrap gap-2">
          {vehicleClasses.map((c) => (
            <span key={c} className="rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors duration-500 hover:-translate-y-0.5" style={{ background: P.cardBg, borderColor: P.border, color: P.text }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Finance stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Max EMI"       value={fmtLKR(finance.max_monthly_emi)} P={P} isDarkMode={isDarkMode} />
        <StatCard label="Down Payment"  value={
          finance.down_payment_amount != null
            ? fmtLKR(finance.down_payment_amount)
            : finance.down_payment_ratio != null
            ? `${((asNum(finance.down_payment_ratio) ?? 0) * 100).toFixed(0)}%`
            : "—"
        } P={P} isDarkMode={isDarkMode} />
        <StatCard label="Interest"      value={rate != null ? `${rate.toFixed(1)}%` : "—"} P={P} isDarkMode={isDarkMode} />
        <StatCard label="Tenure"        value={mo   != null ? `${mo} months`        : "—"} P={P} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}
