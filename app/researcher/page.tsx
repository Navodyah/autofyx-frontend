'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle, BarChart3, Brain, Fuel, RefreshCcw,
  Wrench, Car, TrendingUp, Gauge, DollarSign, Activity,
  ArrowUpRight, Database, Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { API_BASE } from '@/lib/api';

const L = {
  bg: '#F0F4FF', cardBg: '#FFFFFF', primary: '#155dfc', primaryText: '#FFFFFF',
  text: '#030304', muted: '#6B7280', border: '#DBEAFE',
  glow: 'rgba(21,93,252,0.15)', shadow: '0 4px 20px -2px rgba(21,93,252,0.06)',
  iconBg: '#EFF6FF', chartGrid: '#e2e8f0', chartText: '#64748b',
};
const D = {
  bg: '#030304', cardBg: '#0F111A', primary: '#155dfc', primaryText: '#FFFFFF',
  text: '#FFFFFF', muted: '#8B949E', border: 'rgba(21,93,252,0.2)',
  glow: 'rgba(21,93,252,0.25)', shadow: '0 4px 24px -4px rgba(0,0,0,0.5)',
  iconBg: 'rgba(21,93,252,0.08)', chartGrid: 'rgba(255,255,255,0.05)', chartText: 'rgba(255,255,255,0.4)',
};

const COLORS = ['#155dfc','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316'];

type Summary = {
  vehicle_count: number; brand_count: number; fuel_type_count: number;
  maintenance_record_count: number; avg_price: number; avg_highway_efficiency: number;
  avg_combined_efficiency: number; avg_maintenance_cost: number;
};
type AnalyticsResponse = {
  summary: Summary;
  market_insights: {
    vehicle_count_by_brand: { brand: string; count: number }[];
    vehicle_distribution_by_fuel: { fuel_type: string; count: number }[];
    transmission_usage_distribution: { transmission: string; count: number }[];
  };
  maintenance: {
    maintenance_cost_trend: { period: string; avg_yearly_cost: number; count: number }[];
    average_yearly_maintenance_by_brand: { brand: string; avg_yearly_cost: number; count: number }[];
  };
  fuel_efficiency: {
    efficiency_by_fuel_type: { fuel_type: string; avg_combined_efficiency: number; count: number }[];
    highway_vs_combined_by_fuel: { fuel_type: string; avg_highway_efficiency: number; avg_combined_efficiency: number; count: number }[];
  };
};

function fmt(v: number | null | undefined) {
  if (!v || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(v);
}
function fmtD(v: number | null | undefined, d = 1) {
  if (!v || !Number.isFinite(v)) return '—';
  return v.toFixed(d);
}

/* ── Mini KPI card ──────────────────────────────── */
function KpiCard({ title, value, sub, icon: Icon, accent, P, delay }: {
  title: string; value: string; sub: string;
  icon: React.ComponentType<{className?: string}>;
  accent: string; P: Record<string,string>; delay: number;
}) {
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay}}
      className="rounded-[24px] p-5 flex items-start justify-between gap-3 group cursor-default hover:-translate-y-0.5 transition-transform duration-200"
      style={{background:P.cardBg, border:`1px solid ${P.border}`, boxShadow:P.shadow}}>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{color:P.muted}}>{title}</p>
        <p className="text-3xl font-black leading-none" style={{color:P.text}}>{value}</p>
        <p className="mt-2 text-[11px] font-medium" style={{color:P.muted}}>{sub}</p>
      </div>
      <div className="rounded-2xl p-3 flex-shrink-0" style={{ background: `${accent}18`, color: accent }}>
        <Icon className="w-5 h-5" />
      </div>
    </motion.div>
  );
}

/* ── Chart card ─────────────────────────────────── */
function MiniChartCard({ title, sub, children, P, delay, badge }: {
  title: string; sub: string; children: React.ReactNode;
  P: Record<string,string>; delay: number; badge?: string;
}) {
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.45,delay}}
      className="rounded-[28px] p-6 flex flex-col"
      style={{background:P.cardBg, border:`1px solid ${P.border}`, boxShadow:P.shadow}}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-base font-bold" style={{color:P.text}}>{title}</p>
          <p className="text-xs font-medium mt-0.5" style={{color:P.muted}}>{sub}</p>
        </div>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{background:P.iconBg, color:P.primary}}>{badge}</span>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}

export default function ResearcherOverview() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const P = isDarkMode ? D : L;
  const [state, setState] = useState<{data:AnalyticsResponse|null; leaderboard: any[]; loading:boolean; error:string|null; ts:string}>({
    data:null, leaderboard: [], loading:true, error:null, ts:'',
  });

  useEffect(() => {
    setIsDarkMode(localStorage.getItem('autofyx_theme') === 'dark');
    const h = (e:Event) => setIsDarkMode((e as CustomEvent).detail);
    window.addEventListener('themeSync', h);
    return () => window.removeEventListener('themeSync', h);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setState(s => ({...s, loading:true, error:null}));
        const res = await fetch(`${API_BASE}/researcher/analytics`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || json.message || 'Failed');
        
        let leaderboard = [];
        try {
          const lRes = await fetch(`${API_BASE}/recommendations/leaderboard?limit=10`);
          if (lRes.ok) {
            const lData = await lRes.json();
            leaderboard = lData.leaderboard || [];
          }
        } catch (e) { /* ignore */ }

        if (!cancelled) setState({data:json, leaderboard, loading:false, error:null, ts:new Date().toLocaleString()});
      } catch (e) {
        if (!cancelled) setState(s => ({...s, loading:false, error:(e as Error).message}));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const a = state.data;

  /* ── Loading ────────────────────────────────────── */
  if (state.loading) return (
    <div className="space-y-6">
      {[1,2,3].map(i => (
        <div key={i} className="rounded-[28px] animate-pulse h-36" style={{background:P.cardBg, border:`1px solid ${P.border}`}}/>
      ))}
    </div>
  );

  /* ── Error ──────────────────────────────────────── */
  if (state.error && !a) return (
    <div className="rounded-[32px] p-8" style={{background:isDarkMode?'rgba(239,68,68,0.08)':'#FEF2F2', border:`1px solid ${isDarkMode?'rgba(239,68,68,0.2)':'#FECACA'}`}}>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-red-500/15 text-red-500"><AlertCircle className="h-6 w-6"/></div>
        <div>
          <h2 className="text-xl font-bold" style={{color:isDarkMode?'#FCA5A5':'#991B1B'}}>Analytics unavailable</h2>
          <p className="mt-1 text-sm font-medium" style={{color:isDarkMode?'#F87171':'#B91C1C'}}>{state.error}</p>
          <button onClick={()=>window.location.reload()} className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
            style={{background:P.primary}}>
            <RefreshCcw className="h-4 w-4"/> Retry
          </button>
        </div>
      </div>
    </div>
  );
  if (!a) return null;

  /* ── Derived chart data ─────────────────────────── */
  const fuelPieData = a.market_insights.vehicle_distribution_by_fuel.slice(0,6);
  const topBrands = a.market_insights.vehicle_count_by_brand.slice(0,8);
  const trendData = a.maintenance.maintenance_cost_trend.slice(-12);
  const effData = a.fuel_efficiency.highway_vs_combined_by_fuel;

  /* ── Radial data for efficiency gauge ───────────── */
  const radialData = [
    { name: 'Highway', value: Math.round(a.summary.avg_highway_efficiency * 10), fill: '#155dfc' },
    { name: 'Combined', value: Math.round(a.summary.avg_combined_efficiency * 10), fill: '#10b981' },
  ];

  return (
    <div className="space-y-8 pb-10">

      {/* ── Hero banner ─────────────────────────────── */}
      <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
        className="overflow-hidden rounded-[32px] p-8 xl:p-10 text-white shadow-2xl relative"
        style={{background:isDarkMode?'linear-gradient(135deg,#0F111A,#1a1e2e)':'linear-gradient(135deg,#155dfc,#3b82f6)'}}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"/>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur"
              style={{background:'rgba(255,255,255,0.1)',borderColor:'rgba(255,255,255,0.2)'}}>
              <Brain className="h-3.5 w-3.5"/> Vehicle Intelligence Workspace
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[52px] leading-tight">
              Research Overview
            </h1>
            <p className="text-sm leading-relaxed md:text-[15px]" style={{color:'rgba(255,255,255,0.8)'}}>
              High-level summary of the vehicle intelligence database — {a.summary.vehicle_count.toLocaleString()} vehicles, {a.summary.brand_count} brands, and {a.summary.maintenance_record_count.toLocaleString()} maintenance records.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            {[
              {label:'Last sync', val:state.ts||'Just now'},
              {label:'Data points', val:(a.summary.vehicle_count+a.summary.maintenance_record_count).toLocaleString()},
              {label:'Vehicle classes', val:String((a as any).summary.vehicle_class_count || '—')},
            ].map(({label,val}) => (
              <div key={label} className="rounded-2xl px-5 py-3.5 text-center min-w-[120px]"
                style={{background:isDarkMode?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.12)'}}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:'rgba(255,255,255,0.65)'}}>{label}</p>
                <p className="mt-1 text-lg font-black">{val}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── KPI row ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Vehicles" value={a.summary.vehicle_count.toLocaleString()} sub="Catalogued in the database" icon={Car} accent="#155dfc" P={P} delay={0.05}/>
        <KpiCard title="Avg Vehicle Price" value={`LKR ${a.summary.avg_price >= 1000000 ? (a.summary.avg_price / 1000000).toFixed(1).replace(/\.0$/, '') : fmt(a.summary.avg_price)} M`} sub="Mean across all listings" icon={DollarSign} accent="#10b981" P={P} delay={0.1}/>
        <KpiCard title="Avg Maintenance" value={`LKR ${fmt(a.summary.avg_maintenance_cost)}`} sub="Yearly average cost" icon={Wrench} accent="#f59e0b" P={P} delay={0.15}/>
        <KpiCard title="Avg Efficiency" value={`${fmtD(a.summary.avg_combined_efficiency)} L/100`} sub="Combined fuel consumption" icon={Gauge} accent="#8b5cf6" P={P} delay={0.2}/>
      </div>

      {/* ── Charts row 1 ────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Brand distribution bar */}
        <MiniChartCard title="Vehicles by Brand" sub="Top brands in the catalog by unit count" P={P} delay={0.15} badge="Market">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBrands} layout="vertical" margin={{top:0,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={P.chartGrid}/>
                <XAxis type="number" tick={{fill:P.chartText,fontSize:11}} tickFormatter={v=>`${v}`}/>
                <YAxis type="category" dataKey="brand" width={80} tick={{fill:P.chartText,fontSize:11}}/>
                <Tooltip contentStyle={{borderRadius:'14px',border:`1px solid ${P.border}`,background:P.cardBg,color:P.text}} cursor={{fill:isDarkMode?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)'}}/>
                <Bar dataKey="count" name="Vehicles" radius={[0,8,8,0]}>
                  {topBrands.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MiniChartCard>

        {/* Fuel distribution pie */}
        <MiniChartCard title="Fuel Type Distribution" sub="Share of vehicles by fuel category" P={P} delay={0.2} badge="Fuel">
          <div className="flex items-center gap-6 h-[280px]">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fuelPieData} dataKey="count" nameKey="fuel_type" cx="50%" cy="50%"
                    innerRadius="55%" outerRadius="80%" paddingAngle={4}
                    stroke="none">
                    {fuelPieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:'14px',border:`1px solid ${P.border}`,background:P.cardBg,color:P.text}}
                    formatter={(v:any,n:any)=>[`${v} vehicles`,n]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              {fuelPieData.map((d,i) => (
                <div key={d.fuel_type} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                  <span className="text-xs font-medium" style={{color:P.muted}}>{d.fuel_type}</span>
                  <span className="text-xs font-bold ml-auto pl-4" style={{color:P.text}}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </MiniChartCard>
      </div>

      {/* ── Charts row 2 ────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-2">

        {/* Maintenance cost trend */}
        <MiniChartCard title="Maintenance Cost Trend" sub="Monthly average yearly maintenance cost" P={P} delay={0.25} badge="Trend">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{top:5,right:10,left:0,bottom:5}}>
                <defs>
                  <linearGradient id="maintGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={P.chartGrid}/>
                <XAxis dataKey="period" tick={{fill:P.chartText,fontSize:10}} interval="preserveStartEnd"/>
                <YAxis tick={{fill:P.chartText,fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{borderRadius:'14px',border:`1px solid ${P.border}`,background:P.cardBg,color:P.text}}
                  formatter={(v:any)=>[`LKR ${fmt(Number(v))}`,'Avg yearly cost']}/>
                <Area type="monotone" dataKey="avg_yearly_cost" stroke="#f59e0b" strokeWidth={2.5} fill="url(#maintGrad)" dot={false} activeDot={{r:5,fill:'#f59e0b'}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MiniChartCard>

        {/* Highway vs Combined efficiency */}
        <MiniChartCard title="Fuel Efficiency by Type" sub="Highway vs combined — lower is better (L/100km)" P={P} delay={0.3} badge="Efficiency">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effData} margin={{top:5,right:10,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={P.chartGrid}/>
                <XAxis dataKey="fuel_type" tick={{fill:P.chartText,fontSize:11}}/>
                <YAxis tick={{fill:P.chartText,fontSize:11}} tickFormatter={v=>`${v}L`}/>
                <Tooltip contentStyle={{borderRadius:'14px',border:`1px solid ${P.border}`,background:P.cardBg,color:P.text}}
                  formatter={(v:any,n:any)=>[`${Number(v).toFixed(1)} L/100km`,n]}/>
                <Bar dataKey="avg_highway_efficiency" name="Highway" fill="#155dfc" radius={[6,6,0,0]}/>
                <Bar dataKey="avg_combined_efficiency" name="Combined" fill="#10b981" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MiniChartCard>
      </div>


      {/* ── Quick insights footer ────────────────────── */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.45}}
        className="rounded-[28px] p-6" style={{background:P.cardBg,border:`1px solid ${P.border}`,boxShadow:P.shadow}}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-base font-bold" style={{color:P.text}}>Quick Insights</p>
            <p className="text-xs font-medium mt-0.5" style={{color:P.muted}}>Derived from the current database snapshot</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{background:P.iconBg,color:P.primary}}>
            <Activity className="w-3.5 h-3.5"/> Live
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label:'Most common fuel', val: a.market_insights.vehicle_distribution_by_fuel[0]?.fuel_type||'—', icon: Fuel, accent:'#155dfc' },
            { label:'Most common brand', val: a.market_insights.vehicle_count_by_brand[0]?.brand||'—', icon: Car, accent:'#10b981' },
            { label:'Top transmission', val: a.market_insights.transmission_usage_distribution[0]?.transmission||'—', icon: Zap, accent:'#f59e0b' },
            { label:'Highest maint. brand', val: a.maintenance.average_yearly_maintenance_by_brand[0]?.brand||'—', icon: TrendingUp, accent:'#ef4444' },
          ].map(({label,val,icon:Icon,accent}) => (
            <div key={label} className="rounded-2xl p-4 flex items-center gap-3 group"
              style={{background:isDarkMode?'rgba(255,255,255,0.03)':'#f8faff',border:`1px solid ${P.border}`}}>
              <div className="rounded-xl p-2.5 flex-shrink-0" style={{background:`${accent}18`}}>
                <Icon className="w-4 h-4" style={{color:accent}}/>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:P.muted}}>{label}</p>
                <p className="text-sm font-bold truncate mt-0.5" style={{color:P.text}}>{val}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 ml-auto opacity-30 group-hover:opacity-60 transition flex-shrink-0" style={{color:P.muted}}/>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
