'use client';
import { useMemo, useState } from 'react';
import { Calculator, Wallet, CreditCard, ShieldCheck, TrendingUp } from 'lucide-react';

function toNum(v: string) { const n = Number(v); return isFinite(n) ? n : 0; }
function fmtLkr(v: number) { return `LKR ${new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(v)}`; }

const inp = 'w-full rounded-xl border px-3 py-2.5 text-sm font-medium outline-none transition-all focus:ring-2';
const inpStyle = { borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' };
const inpFocus = { '--tw-ring-color': '#bfdbfe' } as React.CSSProperties;

function Field({ label, id, value, onChange, step, unit }: { label: string; id: string; value: string; onChange: (v: string) => void; step?: string; unit?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#64748b' }}>{label}</label>
      <div className="relative">
        {unit && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: '#94a3b8' }}>{unit}</span>}
        <input id={id} type="number" step={step || '1'} value={value} onChange={e => onChange(e.target.value)}
          className={inp + (unit ? ' pl-12' : '')} style={{ ...inpStyle, ...inpFocus }} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: '#fff', borderColor: '#e2e8f0' }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: color + '18' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-sm font-medium" style={{ color: '#475569' }}>{label}</span>
      </div>
      <span className="text-sm font-extrabold" style={{ color }}>{value}</span>
    </div>
  );
}

export default function FinanceCalc() {
  const [price, setPrice] = useState('9500000');
  const [down, setDown] = useState('2000000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('5');
  const [insurance, setInsurance] = useState('18000');

  const calc = useMemo(() => {
    const p = toNum(price), d = toNum(down);
    const principal = Math.max(0, p - d);
    const months = Math.max(1, toNum(years)) * 12;
    const mr = Math.max(0, toNum(rate)) / 12 / 100;
    let emi = 0;
    if (principal > 0) {
      if (mr === 0) emi = principal / months;
      else { const f = Math.pow(1 + mr, months); emi = (principal * mr * f) / (f - 1); }
    }
    const ins = Math.max(0, toNum(insurance));
    return { principal, emi, monthly: emi + ins, total: d + emi * months + ins * months, ins };
  }, [price, down, rate, years, insurance]);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: '#ffffff', borderColor: '#e2e8f0', boxShadow: '0 4px 24px -4px rgba(15,23,42,0.08)' }}>
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: '#f1f5f9', background: '#f8fafc' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#2563eb' }}>
          <Calculator className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#0f172a' }}>Finance Calculator</p>
          <p className="text-xs" style={{ color: '#64748b' }}>Estimate monthly payments with interest & insurance</p>
        </div>
      </div>

      <div className="p-6 grid sm:grid-cols-2 gap-4">
        <Field label="Vehicle Price" id="fc-price" value={price} onChange={setPrice} unit="LKR" />
        <Field label="Down Payment" id="fc-down" value={down} onChange={setDown} unit="LKR" />
        <Field label="Interest Rate % (Annual)" id="fc-rate" value={rate} onChange={setRate} step="0.1" unit="%" />
        <Field label="Lease Period (1–7 Years)" id="fc-years" value={years} onChange={v => setYears(String(Math.min(7, Math.max(1, toNum(v)))))} />
        <div className="sm:col-span-2">
          <Field label="Insurance / Month (Optional)" id="fc-ins" value={insurance} onChange={setInsurance} unit="LKR" />
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <StatCard icon={Wallet} label="Loan Amount" value={fmtLkr(calc.principal)} color="#2563eb" />
        <StatCard icon={CreditCard} label="Monthly Payment (with interest)" value={fmtLkr(calc.emi)} color="#7c3aed" />
        <StatCard icon={ShieldCheck} label="Insurance Cost / Month" value={fmtLkr(calc.ins)} color="#0891b2" />
        <StatCard icon={TrendingUp} label="Total Monthly Cost" value={fmtLkr(calc.monthly)} color="#059669" />
        <div className="p-4 rounded-xl border-2" style={{ borderColor: '#2563eb', background: '#eff6ff' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#2563eb' }}>Total Payment Over Loan Period</p>
          <p className="text-2xl font-extrabold" style={{ color: '#1d4ed8' }}>{fmtLkr(calc.total)}</p>
        </div>
      </div>
    </div>
  );
}
