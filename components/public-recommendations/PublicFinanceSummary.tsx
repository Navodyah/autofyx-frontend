"use client";

import React from "react";
import { motion } from "framer-motion";

function asNum(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function fmtLKR(v: unknown) {
  const n = asNum(v);
  if (n === null) return "—";
  return "LKR " + new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(n);
}

interface PublicFinanceSummaryProps {
  finance: Record<string, unknown>;
  salary: number;
  purpose: string;
  area: string;
  vehicleClasses: string[];
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-sm">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.3), transparent 70%)" }}
      />
      <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-zinc-500">{label}</p>
      <p className={`text-xl font-black ${accent ? "text-blue-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function PublicFinanceSummary({ finance, salary, purpose, area, vehicleClasses }: PublicFinanceSummaryProps) {
  const rate = asNum(finance.rate_of_interest);
  const mo = asNum(finance.number_of_months);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      className="mb-8 space-y-5"
    >
      {/* Status chips */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest">
        <span className="px-3 py-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 text-blue-300">
          LKR {new Intl.NumberFormat("en-LK").format(salary)}
        </span>
        <span className="opacity-30 text-lg">·</span>
        <span className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300">
          {purpose.replace("_", " ")}
        </span>
        <span className="opacity-30 text-lg">·</span>
        <span className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300">{area}</span>
      </motion.div>

      {/* Auto-selected classes */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-blue-500/15 bg-blue-500/5 px-5 py-4 backdrop-blur-sm"
      >
        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-blue-400">
          Auto-selected vehicle classes
        </p>
        <div className="flex flex-wrap gap-2">
          {vehicleClasses.map((c) => (
            <motion.span
              key={c}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:border-white/20 cursor-default transition-colors"
            >
              {c}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Finance stat cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Max EMI" value={fmtLKR(finance.max_monthly_emi)} accent />
        <StatCard
          label="Down Payment"
          value={
            finance.down_payment_amount != null
              ? fmtLKR(finance.down_payment_amount)
              : finance.down_payment_ratio != null
              ? `${((asNum(finance.down_payment_ratio) ?? 0) * 100).toFixed(0)}%`
              : "—"
          }
        />
        <StatCard label="Interest" value={rate != null ? `${rate.toFixed(1)}%` : "—"} />
        <StatCard label="Tenure" value={mo != null ? `${mo} months` : "—"} />
      </motion.div>
    </motion.div>
  );
}
