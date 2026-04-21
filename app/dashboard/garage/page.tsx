"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, Car, SearchX, Zap } from "lucide-react";
import { parseBrowserAuthToken } from '@/lib/auth-token';

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function GaragePage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const identity = useMemo(() => {
    if (typeof window === 'undefined') return {};
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
    <div className="min-h-full pb-12 pt-6 px-4 xl:px-6 transition-colors duration-500 rounded-[32px] m-3 min-h-[calc(100vh-100px)] af-dashboard-bg">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Garage</h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
              Manage your personal wishlist and track the vehicles you love.
            </p>
          </div>
          <div className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-full font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 fill-rose-500" />
            {wishlistIds.length} Saved
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div className="pt-4">
          {loading ? (
             <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-t-rose-500 border-zinc-200 animate-spin" /></div>
          ) : !identity?.user_id ? (
             <div className="text-center py-20 opacity-50 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm">
                <Heart className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-bold mb-2">Please Login</h3>
                <p>Register or log in to manage your vehicle Garage wishlist.</p>
             </div>
          ) : savedVehicles.length === 0 ? (
             <div className="text-center py-20 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-primary)] shadow-sm">
               <SearchX className="w-16 h-16 mx-auto mb-4 text-slate-300" />
               <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Your Garage is Empty</h3>
               <p className="text-[var(--text-muted)] max-w-sm mx-auto">You haven't liked any vehicles yet. Head over to the Search page to discover some amazing cars!</p>
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
                    transition={{ duration: 0.3, delay: (idx % 10) * 0.05 }}
                    className="group flex flex-col rounded-[24px] border overflow-hidden transition-all duration-300 hover:-translate-y-1 block"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    {/* Image Wrap */}
                    <div className="relative h-[200px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 object-cover flex justify-center items-center">
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[11px] font-bold bg-black/40 backdrop-blur-md text-white border border-white/20 shadow-lg">
                        {car.vehicle_class?.class_name || "Standard"}
                      </div>
                      
                      {/* Unlike Button */}
                      <button 
                        onClick={() => removeWishlist(car.vehicle_id)}
                        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-rose-500 border border-white/20 transition-all hover:scale-110 shadow-lg hover:bg-rose-50"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-80 pointer-events-none" />
                    </div>
                    
                    {/* Details */}
                    <div className="p-6 flex-1 flex flex-col pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-[12px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-accent)' }}>
                            {car.brand?.brand_name} • {car.manufacturing_year}
                          </p>
                          <h3 className="text-lg font-extrabold line-clamp-1" style={{ color: 'var(--text-primary)' }}>{car.model_name}</h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 mb-4">
                        <span className="flex items-center text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                           <Zap className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                           {car.fuel_type?.fuel_type_name}
                        </span>
                      </div>

                      <div className="mt-auto pt-2 border-t border-[var(--border-secondary)]">
                        <p className="text-xs font-semibold opacity-60 mb-0.5" style={{ color: 'var(--text-muted)' }}>Estimated Value</p>
                        <p className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
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

      </div>
    </div>
  );
}
