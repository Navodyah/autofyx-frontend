'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Car,
  DollarSign,
  Zap,
  ChevronDown,
  Heart,
  SearchX,
  X,
  ChevronRight,
  Fuel,
  Tag,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

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

const EMPTY_FILTERS = {
  searchQuery: '',
  filterMake: '',
  filterModel: '',
  filterPrice: '',
  filterYear: '',
  filterFuel: '',
};

export default function SearchPage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [pending, setPending] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [hasSearched, setHasSearched] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const token = window.localStorage.getItem('access_token') || window.localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const id = payload?.user_id || payload?.sub || payload?.id || payload?._id || '';
      setUserId(String(id));
    } catch {
      const stored = window.localStorage.getItem('user') || window.localStorage.getItem('userData');
      if (stored) {
        try { const obj = JSON.parse(stored); setUserId(obj?.user_id || obj?._id || obj?.id || ''); } catch { }
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/vehicles/?limit=500`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setVehicles(data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch(`${API_BASE}/brands/?limit=200`)
      .then((r) => r.json())
      .then((data: { brand_name: string }[]) => {
        if (Array.isArray(data)) setBrands(data.map((b) => b.brand_name).filter(Boolean).sort());
      })
      .catch(console.error);

    fetch(`${API_BASE}/fuel_types/?limit=100`)
      .then((r) => r.json())
      .then((data: { fuel_type_name: string }[]) => {
        if (Array.isArray(data)) setFuelTypes(data.map((f) => f.fuel_type_name).filter(Boolean).sort());
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/wishlist?user_id=${userId}`)
      .then((r) => r.json())
      .then((data) => { if (data.items) setWishlist(data.items); })
      .catch(console.error);
  }, [userId]);

  const availableModels = useMemo(() => {
    const src = pending.filterMake ? vehicles.filter((v) => v.brand?.brand_name === pending.filterMake) : vehicles;
    return Array.from(new Set(src.map((v) => v.model_name).filter(Boolean))).sort() as string[];
  }, [vehicles, pending.filterMake]);

  const availableYears = useMemo(() => {
    let src = vehicles;
    if (pending.filterMake) src = src.filter((v) => v.brand?.brand_name === pending.filterMake);
    if (pending.filterModel) src = src.filter((v) => v.model_name === pending.filterModel);
    return Array.from(new Set(src.map((v) => v.manufacturing_year).filter((y) => y && y > 1900))).sort((a, b) => b - a) as number[];
  }, [vehicles, pending.filterMake, pending.filterModel]);

  useEffect(() => { setPending((p) => ({ ...p, filterModel: '', filterYear: '' })); }, [pending.filterMake]);
  useEffect(() => { setPending((p) => ({ ...p, filterYear: '' })); }, [pending.filterModel]);

  const applyFilters = useCallback(() => {
    setApplied({ ...pending });
    const hasAny = Object.values(pending).some((v) => v !== '');
    if (hasAny) { setHasSearched(true); setIsFiltersOpen(false); }
  }, [pending]);

  const clearAllFilters = useCallback(() => {
    setPending(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setHasSearched(false);
  }, []);

  const filteredVehicles = useMemo(() => {
    const hasAnyAppliedFilters = Object.values(applied).some((v) => v !== '');
    if (!hasAnyAppliedFilters) return vehicles.slice(0, 100);
    return vehicles.filter((v) => {
      const term = applied.searchQuery.toLowerCase();
      if (term) {
        const full = `${v.brand?.brand_name} ${v.model_name} ${v.manufacturing_year}`.toLowerCase();
        if (!full.includes(term)) return false;
      }
      if (applied.filterMake && v.brand?.brand_name !== applied.filterMake) return false;
      if (applied.filterModel && v.model_name !== applied.filterModel) return false;
      if (applied.filterFuel) {
        const vFuel = (v.fuel_type?.fuel_type_name || '').toLowerCase();
        if (vFuel !== applied.filterFuel.toLowerCase()) return false;
      }
      if (applied.filterYear && v.manufacturing_year !== Number(applied.filterYear)) return false;
      if (applied.filterPrice) {
        const p = parseFloat(v.minimum_price || '0');
        if (!p) return false;
        if (applied.filterPrice === 'Under 5M LKR' && p >= 5_000_000) return false;
        if (applied.filterPrice === '5M - 10M LKR' && (p < 5_000_000 || p > 10_000_000)) return false;
        if (applied.filterPrice === '10M - 20M LKR' && (p < 10_000_000 || p > 20_000_000)) return false;
        if (applied.filterPrice === 'Above 20M LKR' && p <= 20_000_000) return false;
      }
      return true;
    });
  }, [vehicles, applied, hasSearched]);

  const toggleWishlist = async (vehicle_id: number) => {
    if (!userId) { alert('Please login first to add to Garage.'); return; }
    const isLiked = wishlist.includes(vehicle_id);
    const action = isLiked ? 'remove' : 'add';
    setWishlist((prev) => isLiked ? prev.filter((id) => id !== vehicle_id) : [...prev, vehicle_id]);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, vehicle_id, action }),
      });
      const data = await res.json();
      if (data.items) setWishlist(data.items);
    } catch (e) { console.error(e); }
  };

  const activeFiltersCount = Object.values(applied).filter((v) => v !== '').length;
  const hasResults = filteredVehicles.length > 0;

  const fuelColors: Record<string, string> = {
    petrol: '#f97316', gasoline: '#f97316', diesel: '#6366f1',
    electric: '#10b981', hybrid: '#3b82f6', default: '#64748b',
  };
  const getFuelColor = (fuel?: string) => {
    if (!fuel) return fuelColors.default;
    const key = fuel.toLowerCase();
    return fuelColors[key] || fuelColors.default;
  };

  const SelectField = ({
    icon, value, onChange, placeholder, children,
  }: {
    icon: React.ReactNode; value: string;
    onChange: (v: string) => void; placeholder: string; children: React.ReactNode;
  }) => (
    <div className="relative group">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none z-10" style={{ color: '#2563eb' }}>
        {icon}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-10 pr-10 py-3 rounded-xl text-sm font-medium outline-none transition-all cursor-pointer border bg-white"
        style={{
          color: value ? '#0f172a' : '#94a3b8',
          borderColor: value ? '#2563eb' : '#e2e8f0',
          boxShadow: value ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
        }}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <ChevronDown className="w-4 h-4" style={{ color: '#94a3b8' }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
      <div className="shrink-0 max-w-7xl mx-auto w-full px-4 xl:px-6 pt-6 space-y-6">

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#2563eb' }}>
                <Search className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#2563eb' }}>Vehicle Catalog</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
              Find Your Perfect Vehicle
            </h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              Browse {vehicles.length.toLocaleString()}+ vehicles — filter by make, model, fuel type & price.
            </p>
          </div>
          {activeFiltersCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: '#fecaca', background: '#fff1f2', color: '#dc2626' }}
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </motion.button>
          )}
        </motion.div>

        {/* ── SEARCH & FILTER BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="relative group rounded-2xl p-[1.5px] transition-all duration-500 bg-slate-200 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.2)]"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
          <div className="relative bg-white rounded-[15px] overflow-hidden flex flex-col">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-0 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: '#e2e8f0' }}>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5" style={{ color: '#2563eb' }} />
              </div>
              <input
                value={pending.searchQuery}
                onChange={(e) => setPending((p) => ({ ...p, searchQuery: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                type="text"
                placeholder="Search make, model or year…"
                className="w-full pl-14 pr-5 py-4 text-base font-medium outline-none bg-transparent placeholder:font-normal"
                style={{ color: '#0f172a' }}
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 sm:py-0">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all relative"
                style={{
                  background: isFiltersOpen ? '#eff6ff' : '#f8fafc',
                  borderColor: isFiltersOpen ? '#93c5fd' : '#e2e8f0',
                  color: isFiltersOpen ? '#2563eb' : '#475569',
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: '#2563eb' }}>
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={applyFilters}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
              >
                <Search className="w-4 h-4" />
                Search
              </motion.button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden border-t"
                style={{ borderColor: '#e2e8f0' }}
              >
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" style={{ background: '#f8fafc' }}>
                  <SelectField icon={<Car className="w-4 h-4" />} value={pending.filterMake} onChange={(v) => setPending((p) => ({ ...p, filterMake: v }))} placeholder="All Makes">
                    {brands.map((m) => <option key={m} value={m}>{m}</option>)}
                  </SelectField>
                  <SelectField icon={<Car className="w-4 h-4" />} value={pending.filterModel} onChange={(v) => setPending((p) => ({ ...p, filterModel: v }))} placeholder="All Models">
                    {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
                  </SelectField>
                  <SelectField icon={<Calendar className="w-4 h-4" />} value={pending.filterYear} onChange={(v) => setPending((p) => ({ ...p, filterYear: v }))} placeholder="All Years">
                    {availableYears.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                  </SelectField>
                  <SelectField icon={<Zap className="w-4 h-4" />} value={pending.filterFuel} onChange={(v) => setPending((p) => ({ ...p, filterFuel: v }))} placeholder="All Fuel Types">
                    {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
                  </SelectField>
                  <SelectField icon={<DollarSign className="w-4 h-4" />} value={pending.filterPrice} onChange={(v) => setPending((p) => ({ ...p, filterPrice: v }))} placeholder="All Prices">
                    <option value="Under 5M LKR">Under 5M LKR</option>
                    <option value="5M - 10M LKR">5M – 10M LKR</option>
                    <option value="10M - 20M LKR">10M – 20M LKR</option>
                    <option value="Above 20M LKR">Above 20M LKR</option>
                  </SelectField>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>

        {/* ── ACTIVE FILTER CHIPS ── */}
        <AnimatePresence>
          {activeFiltersCount > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
              {Object.entries(applied).filter(([, v]) => v !== '').map(([k, v]) => (
                <motion.span
                  key={k}
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
                >
                  {v}
                  <button onClick={() => { const next = { ...applied, [k]: '' }; setApplied(next); setPending(next); }} className="hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SCROLLABLE RESULTS AREA ── */}
      <ScrollArea className="flex-1 mt-2">
        <div className="max-w-7xl mx-auto w-full px-4 xl:px-6 pb-16 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
              </div>
              <p className="text-sm font-medium" style={{ color: '#64748b' }}>Loading vehicles…</p>
            </div>
          ) : !hasResults ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 rounded-2xl border text-center gap-4"
              style={{ background: '#ffffff', borderColor: '#e2e8f0' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                <SearchX className="w-8 h-8" style={{ color: '#94a3b8' }} />
              </div>
              <div>
                <p className="text-lg font-bold mb-1" style={{ color: '#0f172a' }}>No vehicles match your filters</p>
                <p className="text-sm" style={{ color: '#64748b' }}>Try adjusting or clearing your search criteria.</p>
              </div>
              <button onClick={clearAllFilters} className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#2563eb' }}>
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>
                    {Object.values(applied).some((v) => v !== '') ? 'Search Results' : 'All Vehicles'}
                  </h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    {filteredVehicles.length.toLocaleString()} found
                  </span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVehicles.map((car, idx) => {
                  const isLiked = wishlist.includes(car.vehicle_id);
                  const classLabel = car.vehicle_class?.class_name || 'Standard';
                  const yearLabel = car.manufacturing_year ? `${car.manufacturing_year} EDITION` : 'EDITION';
                  return (
                    <motion.div
                      key={car.vehicle_id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: (idx % 9) * 0.04 }}
                      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1.5 cursor-pointer p-[1px] bg-slate-200 hover:bg-gradient-to-b hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_16px_40px_-6px_rgba(37,99,235,0.25)]"
                      style={{
                        boxShadow: '0 2px 16px -4px rgba(15,23,42,0.08)',
                      }}
                    >
                      <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                      <div className="relative flex flex-col flex-1 bg-white rounded-[15px] overflow-hidden">
                      {/* ── IMAGE AREA ── */}
                      <div className="relative h-[200px] overflow-hidden" style={{ background: '#0f172a' }}>
                        {/* Class badge — top left */}
                        <div
                          className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide"
                          style={{ background: 'rgba(255,255,255,0.95)', color: '#0f172a', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                        >
                          {classLabel}
                        </div>

                        {/* Heart — top right */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(car.vehicle_id); }}
                          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110"
                          style={{
                            background: isLiked ? '#fff1f2' : 'rgba(255,255,255,0.92)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                          title={isLiked ? 'Remove from Garage' : 'Add to Garage'}
                        >
                          <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                        </button>

                        {/* Vehicle image */}
                        {car.image_url ? (
                          <img
                            src={car.image_url}
                            alt={car.model_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-16 h-16 opacity-20" style={{ color: '#94a3b8' }} />
                          </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* ── DETAILS AREA ── */}
                      <div className="p-5 flex-1 flex flex-col gap-3">

                        {/* Edition label + model name */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>
                            {yearLabel}
                          </p>
                          <h3 className="text-[17px] font-extrabold leading-snug line-clamp-1" style={{ color: '#0f172a' }}>
                            {car.brand?.brand_name} {car.model_name}
                          </h3>
                        </div>

                        {/* 3-column metrics */}
                        <div
                          className="grid grid-cols-3 gap-2 py-3 rounded-xl px-2"
                          style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                        >
                          {/* Fuel / Energy */}
                          <div className="flex flex-col items-center gap-0.5">
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Energy</p>
                            <Fuel className="w-3.5 h-3.5 mt-0.5" style={{ color: '#64748b' }} />
                            <p className="text-[11px] font-semibold text-center" style={{ color: '#334155' }}>
                              {car.fuel_type?.fuel_type_name || '—'}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="flex flex-col items-center gap-0.5 border-x" style={{ borderColor: '#e2e8f0' }}>
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Year</p>
                            <Calendar className="w-3.5 h-3.5 mt-0.5" style={{ color: '#64748b' }} />
                            <p className="text-[11px] font-semibold" style={{ color: '#334155' }}>
                              {car.manufacturing_year || '—'}
                            </p>
                          </div>

                          {/* Class */}
                          <div className="flex flex-col items-center gap-0.5">
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Class</p>
                            <Tag className="w-3.5 h-3.5 mt-0.5" style={{ color: '#64748b' }} />
                            <p className="text-[11px] font-semibold text-center" style={{ color: '#334155' }}>
                              {car.vehicle_class?.class_name || '—'}
                            </p>
                          </div>
                        </div>

                        {/* Price + CTA */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#94a3b8' }}>Est. Value</p>
                            <p className="text-[18px] font-extrabold tracking-tight" style={{ color: '#2563eb' }}>
                              LKR {car.minimum_price ? parseFloat(car.minimum_price).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                          <div
                            className="flex items-center justify-center w-9 h-9 rounded-full transition-all group-hover:scale-110 shrink-0"
                            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}
                          >
                            <ChevronRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
