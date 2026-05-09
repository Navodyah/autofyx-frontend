'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle, Activity, Sparkles, TrendingUp, RefreshCcw, LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell,
  AreaChart, Area
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

export default function AccessDataPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const P = isDarkMode ? D : L;
  const [state, setState] = useState<{leaderboard: any[]; timeline: any[]; loading:boolean; error:string|null; ts:string}>({
    leaderboard: [], timeline: [], loading:true, error:null, ts:'',
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
        
        const lRes = await fetch(`${API_BASE}/recommendations/leaderboard?limit=15`);
        const lData = lRes.ok ? await lRes.json() : { leaderboard: [] };
        
        const tRes = await fetch(`${API_BASE}/recommendations/timeline`);
        const tData = tRes.ok ? await tRes.json() : { timeline: [] };

        if (!cancelled) setState({
            leaderboard: lData.leaderboard || [], 
            timeline: tData.timeline || [], 
            loading:false, 
            error:null, 
            ts:new Date().toLocaleString()
        });
      } catch (e) {
        if (!cancelled) setState(s => ({...s, loading:false, error:(e as Error).message}));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  /* ── Loading ────────────────────────────────────── */
  if (state.loading) return (
    <div className="space-y-6">
      {[1,2,3].map(i => (
        <div key={i} className="rounded-[28px] animate-pulse h-36" style={{background:P.cardBg, border:`1px solid ${P.border}`}}/>
      ))}
    </div>
  );

  /* ── Error ──────────────────────────────────────── */
  if (state.error) return (
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

  return (
    <div className="space-y-8 pb-10">

      {/* Hero Header */}
      <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
        className="overflow-hidden rounded-[32px] p-8 xl:p-10 text-white shadow-2xl relative"
        style={{background:isDarkMode?'linear-gradient(135deg,#0F111A,#1a1e2e)':'linear-gradient(135deg,#155dfc,#3b82f6)'}}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"/>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest backdrop-blur"
              style={{background:'rgba(255,255,255,0.1)',borderColor:'rgba(255,255,255,0.2)'}}>
              <LayoutGrid className="h-3.5 w-3.5"/> Access Data Analytics
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-[52px] leading-tight">
              Recommendation Insights
            </h1>
            <p className="text-sm leading-relaxed md:text-[15px]" style={{color:'rgba(255,255,255,0.8)'}}>
              Global overview of user recommendation activity, AI picks leaderboard, and time-series history tracking across the platform.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            <div className="rounded-2xl px-5 py-3.5 text-center min-w-[120px]"
              style={{background:isDarkMode?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.12)'}}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:'rgba(255,255,255,0.65)'}}>Unique Leaders</p>
              <p className="mt-1 text-lg font-black">{state.leaderboard.length}</p>
            </div>
            <div className="rounded-2xl px-5 py-3.5 text-center min-w-[120px]"
              style={{background:isDarkMode?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.12)'}}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:'rgba(255,255,255,0.65)'}}>Active Days</p>
              <p className="mt-1 text-lg font-black">{state.timeline.length}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Timeline Chart */}
      <MiniChartCard title="Platform Recommendation Activity" sub="Number of vehicle matches served over time" P={P} delay={0.1} badge="Timeline">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={state.timeline} margin={{top:10,right:10,left:0,bottom:0}}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={P.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={P.chartGrid}/>
              <XAxis dataKey="date" tick={{fill:P.chartText,fontSize:11}} tickFormatter={(val) => {
                  if(!val) return '';
                  const d = new Date(val);
                  return `${d.getMonth()+1}/${d.getDate()}`;
              }}/>
              <YAxis tick={{fill:P.chartText,fontSize:11}} allowDecimals={false} />
              <Tooltip 
                contentStyle={{borderRadius:'14px',border:`1px solid ${P.border}`,background:P.cardBg,color:P.text}} 
                labelStyle={{fontWeight:'bold',color:P.muted,marginBottom:'4px'}}
                formatter={(v:any)=>[`${v} Vehicles`,'Recommended']}
              />
              <Area type="monotone" dataKey="count" stroke={P.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{r:6, fill:P.primary, stroke:P.cardBg, strokeWidth:2}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MiniChartCard>

      {/* Leaderboard Section */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Leaderboard Chart */}
        <MiniChartCard title="Top Recommended Vehicles" sub="Most frequently suggested by the AI globally" P={P} delay={0.2} badge="AI Picks">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={state.leaderboard.slice(0, 8)} layout="vertical" margin={{top:0,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={P.chartGrid}/>
                <XAxis type="number" tick={{fill:P.chartText,fontSize:11}} allowDecimals={false}/>
                <YAxis type="category" dataKey="model" width={110} tick={{fill:P.chartText,fontSize:11, fontWeight: 'bold'}}/>
                <Tooltip contentStyle={{borderRadius:'14px',border:`1px solid ${P.border}`,background:P.cardBg,color:P.text}} cursor={{fill:isDarkMode?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)'}}/>
                <Bar dataKey="recommendation_count" name="Times Recommended" radius={[0,8,8,0]} barSize={24}>
                  {state.leaderboard.slice(0, 8).map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MiniChartCard>
        
        {/* Top Vehicles List */}
        <MiniChartCard title="Leaderboard Details" sub="Detailed breakdown of top recommended vehicles" P={P} delay={0.3} badge="Details">
          <div className="h-[360px] overflow-y-auto pr-2">
             {state.leaderboard.length === 0 ? (
               <div className="flex h-full flex-col items-center justify-center text-sm font-medium" style={{ color: P.muted }}>
                 <TrendingUp className="w-10 h-10 mb-2 opacity-20"/>
                 No recommendation data yet.
               </div>
             ) : (
               <div className="space-y-3">
                 {state.leaderboard.map((v: any, i: number) => (
                   <div key={i} className="flex items-center gap-4 p-3.5 rounded-2xl border transition-colors hover:border-blue-500/50" style={{ borderColor: P.border, background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFF' }}>
                     <div className="w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm" style={{ background: COLORS[i%COLORS.length] + '20', color: COLORS[i%COLORS.length] }}>
                       #{i+1}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold truncate" style={{ color: P.text }}>{v.model || v.brand}</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: P.muted }}>{v.brand} • {v.vehicle_class || 'N/A'}</p>
                     </div>
                     <div className="text-right flex-shrink-0">
                       <p className="text-xl font-black" style={{ color: P.text }}>{v.recommendation_count}</p>
                       <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: P.muted }}>Picks</p>
                     </div>
                     <div className="hidden sm:block text-right border-l pl-4 ml-2" style={{borderColor: P.border}}>
                       <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P.muted }}>Last Seen</p>
                       <p className="text-xs font-semibold" style={{ color: P.text }}>
                         {v.last_recommended_at ? new Date(v.last_recommended_at).toLocaleDateString() : 'N/A'}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </MiniChartCard>
      </div>

    </div>
  );
}
