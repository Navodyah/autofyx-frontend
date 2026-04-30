"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Wallet, Car, ShieldCheck, Fuel, CreditCard, TrendingUp, ChevronDown } from "lucide-react";

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmtLkr(value: number): string {
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(value)}`;
}

// ── Palettes (mirror dashboard/page.tsx) ────────────────────────────────
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
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
};

function InputField({ label, id, value, onChange, type = "number", min, max, step, icon: Icon, unit, P, isDarkMode }: any) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider transition-colors duration-500" style={{ color: P.muted }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-500" style={{ color: P.muted }}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all focus:border-[#155dfc] focus:ring-4 focus:ring-[#155dfc]/10 outline-none ${Icon ? 'pl-9' : ''} ${unit ? 'pr-12' : ''}`}
          style={{ background: isDarkMode ? '#0a0a14' : '#f8fafc', borderColor: P.border, color: P.text }}
        />
        {unit && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold transition-colors duration-500" style={{ color: P.muted }}>
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ title, value, icon: Icon, colorClass, bgClass, delay, P, isDarkMode }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 ${bgClass}`}
      style={{ borderColor: P.border, background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'white' }}
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl`} style={{ background: isDarkMode ? 'rgba(21,93,252,0.15)' : '#eff6ff', color: P.primary }}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold transition-colors duration-500" style={{ color: P.muted }}>{title}</span>
        </div>
        <span className={`text-lg font-extrabold tracking-tight transition-colors duration-500`} style={{ color: P.text }}>{value}</span>
      </div>
    </motion.div>
  );
}

export default function CostCalculationPage() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [activeTab, setActiveTab] = useState<"finance" | "ownership">("finance");

  // Finance State
  const [fcPrice, setFcPrice] = useState("9500000");
  const [fcDown, setFcDown] = useState("2000000");
  const [fcRate, setFcRate] = useState("12");
  const [fcYears, setFcYears] = useState("5");
  const [fcInsurance, setFcInsurance] = useState("18000");

  // Ownership State (Additional)
  const [fuelMonthly, setFuelMonthly] = useState("35000");
  const [maintenanceMonthly, setMaintenanceMonthly] = useState("12000");

  React.useEffect(() => {
    const handler = () => setIsDarkMode(prev => !prev);
    window.addEventListener('themeToggle', handler);
    return () => window.removeEventListener('themeToggle', handler);
  }, []);

  const P = isDarkMode ? D : L;

  const fc = useMemo(() => {
    const p = toNumber(fcPrice);
    const d = toNumber(fcDown);
    const principal = Math.max(0, p - d);
    const years = Math.max(1, Math.min(7, toNumber(fcYears)));
    const months = years * 12;
    const mr = Math.max(0, toNumber(fcRate)) / 12 / 100;
    
    let emi = 0;
    if (principal > 0) {
      if (mr === 0) emi = principal / months;
      else {
        const f = Math.pow(1 + mr, months);
        emi = (principal * mr * f) / (f - 1);
      }
    }
    
    const ins = Math.max(0, toNumber(fcInsurance));
    const fuel = Math.max(0, toNumber(fuelMonthly));
    const maint = Math.max(0, toNumber(maintenanceMonthly));
    
    const monthlyFinance = emi + ins;
    const monthlyOwnership = emi + ins + fuel + maint;
    
    const totalFinance = d + (emi * months) + (ins * months);
    const totalOwnership = d + (emi * months) + ((ins + fuel + maint) * months);

    return { 
      principal, 
      emi, 
      ins, 
      fuel, 
      maint, 
      monthlyFinance, 
      monthlyOwnership, 
      totalFinance, 
      totalOwnership,
      months
    };
  }, [fcPrice, fcDown, fcRate, fcYears, fcInsurance, fuelMonthly, maintenanceMonthly]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-full pb-12 pt-6 px-4 xl:px-6 relative overflow-hidden transition-colors duration-500"
      style={{ background: P.bg, borderRadius: '32px', margin: '1px', minHeight: 'calc(100vh - 100px)' }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* SUPER MODERN HEADER */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border transition-colors duration-500 shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.05)' : '#F0F4FF', borderColor: P.border }}>
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-40 transition-colors duration-500" style={{ background: P.primary }} />
          
          <div className="relative z-10 space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 mb-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500 shadow-sm"
              style={{ background: isDarkMode ? 'rgba(21,93,252,0.15)' : '#FFFFFF', color: P.primary }}
            >
              <Calculator className="w-3.5 h-3.5" />
              Financial Planning
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight transition-colors duration-500" style={{ color: P.text }}>
              Cost & Finance Calculator
            </h1>
            <p className="text-sm font-medium mt-2 max-w-xl transition-colors duration-500 leading-relaxed" style={{ color: P.muted }}>
              Estimate your monthly payments, loan amounts, and total ownership costs before making a decision. 
              Plan your automotive budget with precision.
            </p>
          </div>
        </motion.div>

      {/* Main Content */}
      <div className="relative z-20 mx-auto max-w-7xl mt-8">
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl p-1.5 shadow-sm border transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>
            <button
              onClick={() => setActiveTab("finance")}
              className={`flex items-center gap-2.5 rounded-xl px-8 py-3 text-sm font-extrabold tracking-wide transition-all duration-500`}
              style={activeTab === "finance" ? { background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF', color: P.primary, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' } : { color: P.muted }}
            >
              <CreditCard className="h-4 w-4" />
              Loan & Finance
            </button>
            <button
              onClick={() => setActiveTab("ownership")}
              className={`flex items-center gap-2.5 rounded-xl px-8 py-3 text-sm font-extrabold tracking-wide transition-all duration-500`}
              style={activeTab === "ownership" ? { background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF', color: P.primary, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' } : { color: P.muted }}
            >
              <Car className="h-4 w-4" />
              Total Ownership Cost
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative overflow-hidden rounded-3xl border p-8 transition-colors duration-500"
              style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}
            >
              {/* Subtle ambient glow inside the card */}
              <div className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500" 
                   style={{ background: `radial-gradient(circle at 0% 0%, ${P.primary}, transparent 70%)` }} />
                   
              <div className="relative z-10 mb-8 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight transition-colors duration-500" style={{ color: P.text }}>
                  {activeTab === "finance" ? "Finance Inputs" : "Ownership Inputs"}
                </h2>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-500 shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF', color: P.primary }}>
                  <Calculator className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-5">
                <InputField label="Vehicle Price" id="fc-price" value={fcPrice} onChange={setFcPrice} icon={Car} unit="LKR" P={P} isDarkMode={isDarkMode} />
                <InputField label="Down Payment" id="fc-down" value={fcDown} onChange={setFcDown} icon={Wallet} unit="LKR" P={P} isDarkMode={isDarkMode} />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Interest Rate" id="fc-rate" value={fcRate} onChange={setFcRate} step="0.1" unit="%" P={P} isDarkMode={isDarkMode} />
                  <InputField label="Lease Period" id="fc-years" value={fcYears} onChange={setFcYears} min="1" max="7" unit="YRS" P={P} isDarkMode={isDarkMode} />
                </div>

                <InputField label="Insurance / Month" id="fc-ins" value={fcInsurance} onChange={setFcInsurance} icon={ShieldCheck} unit="LKR" P={P} isDarkMode={isDarkMode} />

                <AnimatePresence>
                  {activeTab === "ownership" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5 overflow-hidden pt-2"
                    >
                      <div className="border-t pt-4 transition-colors duration-500" style={{ borderColor: P.border }} />
                      <InputField label="Fuel / Month" id="fuel" value={fuelMonthly} onChange={setFuelMonthly} icon={Fuel} unit="LKR" P={P} isDarkMode={isDarkMode} />
                      <InputField label="Maintenance / Month" id="maint" value={maintenanceMonthly} onChange={setMaintenanceMonthly} icon={TrendingUp} unit="LKR" P={P} isDarkMode={isDarkMode} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative overflow-hidden rounded-3xl border p-8 transition-colors duration-500 flex flex-col h-full"
              style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}
            >
              {/* Subtle ambient glow inside the card */}
              <div className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500" 
                   style={{ background: `radial-gradient(circle at 100% 0%, ${P.primary}, transparent 70%)` }} />

              <div className="relative z-10 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight transition-colors duration-500" style={{ color: P.text }}>
                    {activeTab === "finance" ? "Finance Summary" : "Ownership Summary"}
                  </h2>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors duration-500" style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: P.muted }}>
                    <TrendingUp className="w-3 h-3" /> Based on a {fc.months}-month period
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <ResultCard 
                  title="Loan Amount" 
                  value={fmtLkr(fc.principal)} 
                  icon={Wallet} 
                  colorClass={isDarkMode ? 'text-blue-400' : 'text-blue-600'} 
                  bgClass=""
                  delay={0.1}
                  P={P} isDarkMode={isDarkMode}
                />
                <ResultCard 
                  title="Monthly EMI" 
                  value={fmtLkr(fc.emi)} 
                  icon={CreditCard} 
                  colorClass={isDarkMode ? 'text-violet-400' : 'text-violet-600'} 
                  bgClass=""
                  delay={0.2}
                  P={P} isDarkMode={isDarkMode}
                />
                
                {activeTab === "finance" ? (
                  <>
                    <ResultCard 
                      title="Insurance / Month" 
                      value={fmtLkr(fc.ins)} 
                      icon={ShieldCheck} 
                      colorClass={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'} 
                      bgClass=""
                      delay={0.3}
                      P={P} isDarkMode={isDarkMode}
                    />
                    <ResultCard 
                      title="Total Monthly Cost" 
                      value={fmtLkr(fc.monthlyFinance)} 
                      icon={TrendingUp} 
                      colorClass={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} 
                      bgClass=""
                      delay={0.4}
                      P={P} isDarkMode={isDarkMode}
                    />
                  </>
                ) : (
                  <>
                    <ResultCard 
                      title="Fuel & Maintenance" 
                      value={fmtLkr(fc.fuel + fc.maint)} 
                      icon={Fuel} 
                      colorClass={isDarkMode ? 'text-orange-400' : 'text-orange-500'} 
                      bgClass=""
                      delay={0.3}
                      P={P} isDarkMode={isDarkMode}
                    />
                    <ResultCard 
                      title="Total Monthly Cost" 
                      value={fmtLkr(fc.monthlyOwnership)} 
                      icon={TrendingUp} 
                      colorClass={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} 
                      bgClass=""
                      delay={0.4}
                      P={P} isDarkMode={isDarkMode}
                    />
                  </>
                )}
              </div>

              {/* Grand Total Highlight */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className={`relative overflow-hidden rounded-2xl p-6 ${
                  activeTab === "finance" 
                    ? "bg-gradient-to-br from-[#155dfc] to-[#1d4ed8]" 
                    : "bg-gradient-to-br from-[#030304] to-[#155dfc]"
                }`}
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="relative z-10">
                  <p className="text-sm font-bold uppercase tracking-widest text-white/80 mb-2">
                    {activeTab === "finance" ? "Total Payment (Over Loan Period)" : "Total Ownership Cost (Over Loan Period)"}
                  </p>
                  <div className="flex items-end gap-3">
                    <span className="text-4xl font-extrabold tracking-tight text-white">
                      {fmtLkr(activeTab === "finance" ? fc.totalFinance : fc.totalOwnership)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-white/60 mt-3">
                    {activeTab === "finance" 
                      ? "Includes Down Payment, Loan Principal, Total Interest, and Insurance."
                      : "Includes Down Payment, Loan, Interest, Insurance, Fuel, and Maintenance."}
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
  );
}
