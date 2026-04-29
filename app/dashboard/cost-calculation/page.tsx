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

function InputField({ label, id, value, onChange, type = "number", min, max, step, icon: Icon, unit }: any) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none ${Icon ? 'pl-9' : ''} ${unit ? 'pr-12' : ''}`}
        />
        {unit && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ title, value, icon: Icon, colorClass, bgClass, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-md ${bgClass}`}
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-600">{title}</span>
        </div>
        <span className={`text-lg font-extrabold tracking-tight ${colorClass}`}>{value}</span>
      </div>
    </motion.div>
  );
}

export default function CostCalculationPage() {
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
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 pt-16 pb-32">
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2000&auto=format&fit=crop)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center 60%' 
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/40 to-slate-900/80" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 mb-4 border border-blue-500/20">
              <Calculator className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Financial Planning</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
              Cost & Finance Calculator
            </h1>
            <p className="text-sm font-medium text-slate-300 leading-relaxed">
              Estimate your monthly payments, loan amounts, and total ownership costs before making a decision. 
              Plan your automotive budget with precision.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20">
        
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-xl bg-white p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab("finance")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${
                activeTab === "finance" 
                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Loan & Finance
            </button>
            <button
              onClick={() => setActiveTab("ownership")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${
                activeTab === "ownership" 
                  ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
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
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {activeTab === "finance" ? "Finance Inputs" : "Ownership Inputs"}
                </h2>
                <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                  <Calculator className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-5">
                <InputField label="Vehicle Price" id="fc-price" value={fcPrice} onChange={setFcPrice} icon={Car} unit="LKR" />
                <InputField label="Down Payment" id="fc-down" value={fcDown} onChange={setFcDown} icon={Wallet} unit="LKR" />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Interest Rate" id="fc-rate" value={fcRate} onChange={setFcRate} step="0.1" unit="%" />
                  <InputField label="Lease Period" id="fc-years" value={fcYears} onChange={setFcYears} min="1" max="7" unit="YRS" />
                </div>

                <InputField label="Insurance / Month" id="fc-ins" value={fcInsurance} onChange={setFcInsurance} icon={ShieldCheck} unit="LKR" />

                <AnimatePresence>
                  {activeTab === "ownership" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5 overflow-hidden pt-2"
                    >
                      <div className="border-t border-slate-100 pt-4" />
                      <InputField label="Fuel / Month" id="fuel" value={fuelMonthly} onChange={setFuelMonthly} icon={Fuel} unit="LKR" />
                      <InputField label="Maintenance / Month" id="maint" value={maintenanceMonthly} onChange={setMaintenanceMonthly} icon={TrendingUp} unit="LKR" />
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
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  {activeTab === "finance" ? "Finance Summary" : "Ownership Summary"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">Based on a {fc.months}-month period</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <ResultCard 
                  title="Loan Amount" 
                  value={fmtLkr(fc.principal)} 
                  icon={Wallet} 
                  colorClass="text-blue-600" 
                  bgClass="border-slate-100 bg-white"
                  delay={0.1}
                />
                <ResultCard 
                  title="Monthly EMI" 
                  value={fmtLkr(fc.emi)} 
                  icon={CreditCard} 
                  colorClass="text-violet-600" 
                  bgClass="border-slate-100 bg-white"
                  delay={0.2}
                />
                
                {activeTab === "finance" ? (
                  <>
                    <ResultCard 
                      title="Insurance / Month" 
                      value={fmtLkr(fc.ins)} 
                      icon={ShieldCheck} 
                      colorClass="text-cyan-600" 
                      bgClass="border-slate-100 bg-white"
                      delay={0.3}
                    />
                    <ResultCard 
                      title="Total Monthly Cost" 
                      value={fmtLkr(fc.monthlyFinance)} 
                      icon={TrendingUp} 
                      colorClass="text-emerald-600" 
                      bgClass="border-slate-100 bg-white"
                      delay={0.4}
                    />
                  </>
                ) : (
                  <>
                    <ResultCard 
                      title="Fuel & Maintenance" 
                      value={fmtLkr(fc.fuel + fc.maint)} 
                      icon={Fuel} 
                      colorClass="text-orange-500" 
                      bgClass="border-slate-100 bg-white"
                      delay={0.3}
                    />
                    <ResultCard 
                      title="Total Monthly Cost" 
                      value={fmtLkr(fc.monthlyOwnership)} 
                      icon={TrendingUp} 
                      colorClass="text-emerald-600" 
                      bgClass="border-slate-100 bg-white"
                      delay={0.4}
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
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700" 
                    : "bg-gradient-to-br from-emerald-600 to-teal-700"
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
    </div>
  );
}
