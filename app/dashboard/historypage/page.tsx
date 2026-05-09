'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, Car, ArrowLeft, ArrowUpRight, Calendar, Fuel, DollarSign } from "lucide-react";
import Link from "next/link";
import axios from "axios";

// Light Palette
const L = {
  bg: "#F0F4FF", cardBg: "#FFFFFF", primary: "#155dfc", primaryText: "#FFFFFF",
  text: "#030304", muted: "#6B7280", border: "#DBEAFE", glow: "rgba(21,93,252,0.15)",
  shadow: "0 4px 20px -2px rgba(21, 93, 252, 0.06), 0 0 3px rgba(21,93,252,0.04)",
  hoverShadow: "0 12px 24px -4px rgba(21,93,252,0.12)", iconBg: "#EFF6FF"
};

// Dark Palette
const D = {
  bg: "#030304", cardBg: "#0F111A", primary: "#155dfc", primaryText: "#FFFFFF",
  text: "#FFFFFF", muted: "#8B949E", border: "rgba(21, 93, 252, 0.2)", glow: "rgba(21, 93, 252, 0.25)",
  shadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
  hoverShadow: "0 12px 30px -4px rgba(0,0,0,0.5), 0 0 25px rgba(21,93,252,0.12)", iconBg: "rgba(21,93,252,0.08)"
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function HistoryPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    if (stored) setIsDarkMode(true);
    const handler = (e: any) => setIsDarkMode(e.detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const raw = localStorage.getItem('user_data');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.user_id) {
            const res = await axios.get(`${API_BASE}/recommendations/history/${parsed.user_id}`);
            setHistory(res.data.vehicles || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const P = isDarkMode ? D : L;
  
  // Format price
  const formatPrice = (min?: number, max?: number) => {
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}`;
    if (max) return `$${max.toLocaleString()}`;
    return 'Price N/A';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-full pb-12 pt-6 px-4 xl:px-6 relative overflow-hidden transition-colors duration-500 rounded-[32px] m-3 min-h-[calc(100vh-100px)]"
      style={{ background: P.bg }}
    >
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold mb-4 transition-colors" style={{ color: P.muted }}>
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight transition-colors duration-500" style={{ color: P.text }}>
              Recommendation <span style={{ color: P.primary }}>History</span>
            </h1>
            <p className="text-sm font-medium transition-colors duration-500" style={{ color: P.muted }}>
              Your past vehicle recommendations, saved automatically.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: P.primary, borderTopColor: 'transparent' }} />
           </div>
        ) : history.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-32 text-center" style={{ background: P.cardBg, borderRadius: '24px', border: `1px solid ${P.border}` }}>
              <History className="w-16 h-16 mb-4 opacity-50" style={{ color: P.muted }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: P.text }}>No History Yet</h3>
              <p className="text-sm max-w-md" style={{ color: P.muted }}>
                You haven&apos;t generated any vehicle recommendations. Head over to the recommendation module to get started.
              </p>
              <Link href="/dashboard/recomendation" className="mt-6 px-6 py-3 rounded-full text-sm font-bold transition-all" style={{ background: P.primary, color: P.primaryText, boxShadow: P.shadow }}>
                Get Recommendations
              </Link>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {history.map((vehicle, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, boxShadow: P.hoverShadow }}
                  className="flex flex-col overflow-hidden transition-all duration-300 group"
                  style={{ background: P.cardBg, borderRadius: "24px", border: `1px solid ${P.border}`, boxShadow: P.shadow }}
                >
                  <div className="h-40 bg-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img 
                      src={isDarkMode ? "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop" : "https://images.unsplash.com/photo-1503376713356-2dbfdfaa52a1?q=80&w=800&auto=format&fit=crop"}
                      alt={vehicle.model}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-lg border border-white/10" style={{ background: P.primary, color: P.primaryText }}>
                      {vehicle.score ? `${Number(vehicle.score).toFixed(1)}% Match` : 'Top Match'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: P.muted }}>{vehicle.brand || 'Unknown Brand'}</span>
                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: P.bg, color: P.muted }}>{vehicle.year}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-4 line-clamp-1" style={{ color: P.text }}>{vehicle.model || 'Unknown Model'}</h3>
                    
                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center gap-3 text-sm font-medium" style={{ color: P.muted }}>
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: P.bg }}><Fuel className="w-3.5 h-3.5" /></div>
                        {vehicle.fuel_type || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium" style={{ color: P.muted }}>
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: P.bg }}><Car className="w-3.5 h-3.5" /></div>
                        {vehicle.vehicle_class || 'N/A'}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium" style={{ color: P.muted }}>
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: P.bg }}><DollarSign className="w-3.5 h-3.5" /></div>
                        {formatPrice(vehicle.min_price, vehicle.max_price)}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t flex items-center justify-between transition-colors" style={{ borderColor: P.border }}>
                      <span className="text-[10px] font-bold flex items-center gap-1.5" style={{ color: P.muted }}>
                        <Calendar className="w-3.5 h-3.5" /> {new Date(vehicle.recommended_at).toLocaleDateString()}
                      </span>
                      <Link href={`/dashboard/recomendation`} className="text-[11px] font-bold flex items-center gap-1 hover:underline group-hover:opacity-100 opacity-70 transition-opacity" style={{ color: P.primary }}>
                        Details <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
             ))}
           </div>
        )}
      </div>
    </motion.div>
  );
}
