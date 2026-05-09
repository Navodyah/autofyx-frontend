"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Car, SearchX, Zap } from "lucide-react";
import { parseBrowserAuthToken, type BrowserAuthTokenPayload } from '@/lib/auth-token';

type VehicleData = {
  vehicle_id: number;
  model_name: string;
  manufacturing_year: number;
  minimum_price: string | null;
  max_price: string | null;
  image_url: string | null;
  brand?: { brand_name: string };
  fuel_type?: { fuel_type_name: string };
  vehicle_class?: { class_name: string };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

export default function GaragePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const identity = useMemo<BrowserAuthTokenPayload | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = window.localStorage.getItem('access_token') || window.localStorage.getItem('token');
    return parseBrowserAuthToken(token);
  }, []);

  useEffect(() => {
    // Basic fetch of all vehicles to map IDs
    fetch(`${API_BASE}/vehicles/?limit=500`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setVehicles(data);
      })
      .catch(console.error);
      
    // Fetch user wishlist
    if (identity?.user_id) {
      fetch(`/api/wishlist?user_id=${identity.user_id}`)
        .then(r => r.json())
        .then(data => {
          if (data.items) setWishlistIds(data.items);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    if (stored) setIsDarkMode(true);
    const handler = (e: any) => setIsDarkMode(e.detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  const P = isDarkMode ? D : L;

  const removeWishlist = async (vehicle_id: number) => {
    if (!identity?.user_id) return;
    
    // Optimistic update
    setWishlistIds(prev => prev.filter(id => id !== vehicle_id));
    
    try {
      const res = await fetch(`/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: identity.user_id, vehicle_id, action: 'remove' })
      });
      const data = await res.json();
      if (data.items) setWishlistIds(data.items);
    } catch (e) {
      console.error(e);
    }
  };

  const savedVehicles = useMemo(() => {
    return vehicles.filter(v => wishlistIds.includes(v.vehicle_id));
  }, [vehicles, wishlistIds]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-full pb-12 pt-6 px-4 xl:px-6 relative overflow-hidden transition-colors duration-500 rounded-[32px] m-3 min-h-[calc(100vh-100px)]"
      style={{ background: P.bg, margin: '1px' }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-10 max-w-7xl mx-auto space-y-6">

        {/* ── SUPER MODERN HEADER ── */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border transition-colors duration-500 shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.05)' : '#F0F4FF', borderColor: P.border }}>
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-40 transition-colors duration-500" style={{ background: P.primary }} />
          
          <div className="relative z-10 space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 mb-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-500 shadow-sm"
              style={{ background: isDarkMode ? 'rgba(21,93,252,0.15)' : '#FFFFFF', color: P.primary }}
            >
              <Heart className="w-3.5 h-3.5" />
              Personal Collection
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight transition-colors duration-500" style={{ color: P.text }}>
              My Garage
            </h1>
            <p className="text-sm font-medium mt-2 max-w-xl transition-colors duration-500 leading-relaxed" style={{ color: P.muted }}>
              Manage your personal wishlist and track the vehicles you love. Monitor their prices and specifications over time.
            </p>
          </div>
          
          <div className="relative z-10 flex-shrink-0">
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl border backdrop-blur-md shadow-xl transition-colors duration-500" style={{ background: isDarkMode ? 'rgba(244,63,94,0.1)' : '#fff1f2', borderColor: isDarkMode ? 'rgba(244,63,94,0.2)' : '#ffe4e6' }}>
              <div className="flex items-center justify-center w-12 h-12 rounded-full mb-3 shadow-inner" style={{ background: '#f43f5e', color: '#ffffff' }}>
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#f43f5e] mb-1">Saved</span>
              <span className="text-lg font-black text-center" style={{ color: isDarkMode ? '#e5e7eb' : '#881337' }}>{wishlistIds.length} Vehicles</span>
            </div>
          </div>
        </motion.div>

        {/* ── RESULTS ── */}
        <div className="pt-2">
          {loading ? (
             <div className="flex justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-t-[#155dfc] border-slate-200 animate-spin" /></div>
          ) : !identity?.user_id ? (
             <div className="relative overflow-hidden text-center p-12 md:py-24 rounded-3xl border shadow-sm transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at 50% 50%, #f43f5e, transparent 50%)` }} />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-sm" style={{ background: isDarkMode ? 'rgba(244,63,94,0.1)' : '#fff1f2' }}>
                    <Heart className="w-10 h-10 text-rose-500" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 transition-colors duration-500" style={{ color: P.text }}>Please Login</h3>
                  <p className="text-sm font-medium max-w-sm mx-auto transition-colors duration-500 leading-relaxed" style={{ color: P.muted }}>Register or log in to manage your vehicle Garage wishlist and save your favorite cars.</p>
                </div>
             </div>
          ) : savedVehicles.length === 0 ? (
             <div className="relative overflow-hidden text-center p-12 md:py-24 rounded-3xl border shadow-sm transition-colors duration-500" style={{ background: P.cardBg, borderColor: P.border }}>
                <div className="absolute inset-0 opacity-10 pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at 50% 50%, ${P.primary}, transparent 50%)` }} />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-sm" style={{ background: isDarkMode ? 'rgba(21,93,252,0.1)' : '#EFF6FF' }}>
                    <SearchX className="w-10 h-10" style={{ color: P.primary }} />
                  </div>
                  <h3 className="text-2xl font-black mb-3 transition-colors duration-500" style={{ color: P.text }}>Your Garage is Empty</h3>
                  <p className="text-sm font-medium max-w-sm mx-auto transition-colors duration-500 leading-relaxed" style={{ color: P.muted }}>You haven't liked any vehicles yet. Head over to the Search page to discover some amazing cars!</p>
                </div>
             </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedVehicles.map((car, idx) => (
                  <motion.div
                    key={car.vehicle_id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: (idx % 10) * 0.05 }}
                    className="relative group flex flex-col rounded-3xl border overflow-hidden transition-all duration-500 hover:-translate-y-2 block"
                    style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}
                  >
                    {/* Subtle ambient glow inside the card */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500" 
                         style={{ background: `radial-gradient(circle at 50% 0%, ${P.primary}, transparent 60%)` }} />

                    {/* Image Wrap */}
                    <div className="relative h-[220px] overflow-hidden flex justify-center items-center transition-colors duration-500 z-10" style={{ background: P.iconBg }}>
                      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-lg">
                        {car.vehicle_class?.class_name || "Standard"}
                      </div>
                      
                      {/* Unlike Button */}
                      <button 
                        onClick={() => removeWishlist(car.vehicle_id)}
                        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-rose-500 border border-white/20 transition-all duration-300 hover:scale-110 shadow-lg hover:bg-rose-50 hover:text-rose-600"
                        title="Remove from Garage"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>

                      {car.image_url ? (
                        <img 
                          src={car.image_url} 
                          alt={car.model_name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <Car className="w-16 h-16 opacity-10" />
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-80 pointer-events-none transition-colors duration-500 z-10" style={{ backgroundImage: `linear-gradient(to top, ${P.cardBg}, transparent)` }} />
                    </div>
                    
                    {/* Details */}
                    <div className="p-6 flex-1 flex flex-col relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5 transition-colors duration-500" style={{ color: P.primary }}>
                            {car.brand?.brand_name} • {car.manufacturing_year}
                          </p>
                          <h3 className="text-xl font-black leading-tight line-clamp-1 transition-colors duration-500" style={{ color: P.text }}>{car.model_name}</h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 mb-5">
                        <span className="flex items-center text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors duration-500" style={{ background: P.iconBg, color: P.muted }}>
                           <Zap className="w-3.5 h-3.5 mr-1.5" style={{ color: P.primary }} />
                           {car.fuel_type?.fuel_type_name}
                        </span>
                      </div>

                      <div className="mt-auto pt-4 border-t transition-colors duration-500" style={{ borderColor: P.border }}>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-60 mb-1 transition-colors duration-500" style={{ color: P.muted }}>Estimated Value</p>
                        <p className="text-2xl font-black tracking-tight transition-colors duration-500" style={{ color: P.primary }}>
                          LKR {car.minimum_price ? parseFloat(car.minimum_price).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

        </div>

      </motion.div>
    </motion.div>
  );
}
