'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Search,
  SlidersHorizontal,
  Calendar,
  Car,
  DollarSign,
  Zap,
  ChevronDown,
  Heart,
  SearchX,
} from 'lucide-react';

// --- Palettes ---
const L = {
  bg: '#F7F7F8', cardBg: '#FFFFFF', primary: '#0A0A0B', primaryText: '#FFFFFF',
  text: '#18181B', muted: '#71717A', border: '#E4E4E7',
  shadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)', iconBg: '#F4F4F5',
};
const D = {
  bg: '#0B0F19', cardBg: '#161B22', primary: '#FFFFFF', primaryText: '#000000',
  text: '#FFFFFF', muted: '#8B949E', border: 'rgba(255, 255, 255, 0.08)',
  shadow: '0 4px 24px -4px rgba(0, 0, 0, 0.5)', iconBg: 'rgba(255,255,255,0.03)',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type VehicleData = {
  vehicle_id: number;
  model_name: string;
  manufacturing_year: number;
  minimum_price: string | null;
  max_price: string | null;
  image_url: string | null;
  brand?: { brand_name: string };
  fuel_type?: { fuel_type_name: string };  // actual field from ORM serialization
  vehicle_class?: { class_name: string };
};

// Empty filter state
const EMPTY_FILTERS = {
  searchQuery: '',
  filterMake: '',
  filterModel: '',
  filterPrice: '',
  filterYear: '',
  filterFuel: '',
};

export default function SearchPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const P = isDarkMode ? D : L;

  // All vehicles from DB
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Brand names from DB
  const [brands, setBrands] = useState<string[]>([]);
  // Fuel type names from DB
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);

  // Pending filter values (what user is selecting in the dropdown)
  const [pending, setPending] = useState(EMPTY_FILTERS);

  // Applied filters (what is actually used for filtering the results)
  const [applied, setApplied] = useState(EMPTY_FILTERS);

  // Whether any filter was ever applied – controls blank-state
  const [hasSearched, setHasSearched] = useState(false);

  // userId fetched safely on client after mount only
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Safe client-only localStorage read
    const token =
      window.localStorage.getItem('access_token') ||
      window.localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const id =
        payload?.user_id || payload?.sub || payload?.id || payload?._id || '';
      setUserId(String(id));
    } catch {
      const stored =
        window.localStorage.getItem('user') ||
        window.localStorage.getItem('userData');
      if (stored) {
        try {
          const obj = JSON.parse(stored);
          setUserId(obj?.user_id || obj?._id || obj?.id || '');
        } catch { }
      }
    }
  }, []);

  // Fetch all vehicles, brands, and fuel types on mount
  useEffect(() => {
    // Vehicles
    fetch(`${API_BASE}/vehicles/?limit=500`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setVehicles(data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Brands — fetch directly from brands table
    fetch(`${API_BASE}/brands/?limit=200`)
      .then((r) => r.json())
      .then((data: { brand_name: string }[]) => {
        if (Array.isArray(data))
          setBrands(data.map((b) => b.brand_name).filter(Boolean).sort());
      })
      .catch(console.error);

    // Fuel types — fetch directly from fuel_types table
    fetch(`${API_BASE}/fuel_types/?limit=100`)
      .then((r) => r.json())
      .then((data: { fuel_type_name: string }[]) => {
        if (Array.isArray(data))
          setFuelTypes(data.map((f) => f.fuel_type_name).filter(Boolean).sort());
      })
      .catch(console.error);
  }, []);

  // Fetch wishlist when userId is known
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/wishlist?user_id=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items) setWishlist(data.items);
      })
      .catch(console.error);
  }, [userId]);

  // Available models: when no make is selected, show ALL unique model names from vehicle table
  // When a make IS selected, scope to that make only
  const availableModels = useMemo(() => {
    const src = pending.filterMake
      ? vehicles.filter((v) => v.brand?.brand_name === pending.filterMake)
      : vehicles;
    return Array.from(
      new Set(src.map((v) => v.model_name).filter(Boolean))
    ).sort() as string[];
  }, [vehicles, pending.filterMake]);

  // Unique years — filtered by make+model in pending (so user sees only relevant years)
  const availableYears = useMemo(() => {
    let src = vehicles;
    if (pending.filterMake) src = src.filter((v) => v.brand?.brand_name === pending.filterMake);
    if (pending.filterModel) src = src.filter((v) => v.model_name === pending.filterModel);
    return Array.from(
      new Set(src.map((v) => v.manufacturing_year).filter((y) => y && y > 1900))
    ).sort((a, b) => b - a) as number[];
  }, [vehicles, pending.filterMake, pending.filterModel]);

  // Reset downstream filters when make changes
  useEffect(() => {
    setPending((p) => ({ ...p, filterModel: '', filterYear: '' }));
  }, [pending.filterMake]);

  // Reset year when model changes
  useEffect(() => {
    setPending((p) => ({ ...p, filterYear: '' }));
  }, [pending.filterModel]);

  // ------ Apply filters (called on mouse leave from the filter panel) ------
  const applyFilters = useCallback(() => {
    setApplied({ ...pending });
    const hasAny = Object.values(pending).some((v) => v !== '');
    if (hasAny) {
      setHasSearched(true);
      // Auto-close filter bar after applying
      setIsFiltersOpen(false);
    }
  }, [pending]);

  // Update pending text search
  const handleSearchChange = (val: string) => {
    setPending((p) => ({ ...p, searchQuery: val }));
  };

  // ------ Filtered results ------
  const filteredVehicles = useMemo(() => {
    const hasAnyAppliedFilters = Object.values(applied).some((v) => v !== '');

    // If no search is applied, show up to 100 vehicles by default
    if (!hasAnyAppliedFilters) {
      return vehicles.slice(0, 100);
    }

    return vehicles.filter((v) => {
      // Search term
      const term = applied.searchQuery.toLowerCase();
      if (term) {
        const full = `${v.brand?.brand_name} ${v.model_name} ${v.manufacturing_year}`.toLowerCase();
        if (!full.includes(term)) return false;
      }
      // Make
      if (applied.filterMake && v.brand?.brand_name !== applied.filterMake) return false;
      // Model
      if (applied.filterModel && v.model_name !== applied.filterModel) return false;
      // Fuel
      // Fuel — match fuel_type_name from fuel_types table against vehicle's fuel_type.fuel_type_name
      if (applied.filterFuel) {
        const vFuel = (v.fuel_type?.fuel_type_name || '').toLowerCase();
        const selFuel = applied.filterFuel.toLowerCase();
        if (vFuel !== selFuel) return false;
      }
      // Year — exact match from DB year values
      if (applied.filterYear) {
        const yr = v.manufacturing_year;
        if (yr !== Number(applied.filterYear)) return false;
      }
      // Price
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

  // ------ Wishlist toggle ------
  const toggleWishlist = async (vehicle_id: number) => {
    if (!userId) {
      alert('Please login first to add to Garage.');
      return;
    }
    const isLiked = wishlist.includes(vehicle_id);
    const action = isLiked ? 'remove' : 'add';
    setWishlist((prev) =>
      isLiked ? prev.filter((id) => id !== vehicle_id) : [...prev, vehicle_id]
    );
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, vehicle_id, action }),
      });
      const data = await res.json();
      if (data.items) setWishlist(data.items);
    } catch (e) {
      console.error(e);
    }
  };

  const selectClasses = `w-full appearance-none rounded-xl px-4 py-3.5 text-[14px] font-semibold cursor-pointer outline-none transition-all`;
  const activeFiltersCount = Object.values(applied).filter((v) => v !== '').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full pb-12 pt-6 px-4 xl:px-6 transition-colors duration-500 rounded-[32px] m-3"
      style={{ background: P.bg, minHeight: 'calc(100vh - 100px)' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: P.text }}>
              Discover Vehicles
            </h1>
            <p className="text-sm font-medium mt-1" style={{ color: P.muted }}>
              Use the filters to search and instantly see matching vehicles.
            </p>
          </div>
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-11 h-11 rounded-full transition-colors duration-500 shadow-sm shrink-0"
            style={{ background: P.cardBg, border: `1px solid ${P.border}`, color: P.text }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDarkMode ? 'moon' : 'sun'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── SEARCH & FILTERS BAR ── */}
        <div
          className="p-3 lg:p-4 rounded-[28px] shadow-lg transition-colors duration-500 border relative z-20"
          style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}
        >
          {/* Main Search Row */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-6 h-6" style={{ color: P.muted }} />
              </div>
              <input
                value={pending.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                type="text"
                placeholder="Search by brand or model (e.g. 'Toyota Corolla')"
                className="w-full pl-14 pr-6 py-4 rounded-2xl text-[16px] font-medium outline-none transition-all placeholder:font-normal"
                style={{
                  background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F4F4F5',
                  color: P.text,
                  border: '1px solid transparent',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl text-[14px] font-bold border transition-colors hover:opacity-80 whitespace-nowrap relative"
                style={{
                  background: isFiltersOpen ? P.border : 'transparent',
                  borderColor: P.border,
                  color: P.text,
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button
                onClick={applyFilters}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl text-[14px] font-bold border transition-colors shadow-lg hover:opacity-90 whitespace-nowrap"
                style={{
                  background: "var(--bg-primary, #2563eb)",
                  borderColor: "transparent",
                  color: "#ffffff",
                }}
              >
                <Search className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* ── FILTER PANEL ── */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 rounded-[20px] mb-2 border"
                  style={{ background: isDarkMode ? 'rgba(255,255,255,0.01)' : '#FAFAFA', borderColor: P.border }}
                >
                  {/* Make */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Car className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                    <select
                      value={pending.filterMake}
                      onChange={(e) => setPending((p) => ({ ...p, filterMake: e.target.value }))}
                      className={`${selectClasses} pl-10`}
                      style={{ background: P.cardBg, border: `1px solid ${P.border}`, color: P.text }}
                    >
                      <option value="">Select Make</option>
                      {brands.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                  </div>

                  {/* Model — always enabled, scoped to make when make is selected */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Car className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                    <select
                      value={pending.filterModel}
                      onChange={(e) => setPending((p) => ({ ...p, filterModel: e.target.value }))}
                      className={`${selectClasses} pl-10`}
                      style={{ background: P.cardBg, border: `1px solid ${P.border}`, color: P.text }}
                    >
                      <option value="">Select Model</option>
                      {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                  </div>

                  {/* Year — exact years from vehicles table, scoped by make+model */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                    <select
                      value={pending.filterYear}
                      onChange={(e) => setPending((p) => ({ ...p, filterYear: e.target.value }))}
                      className={`${selectClasses} pl-10`}
                      style={{ background: P.cardBg, border: `1px solid ${P.border}`, color: P.text }}
                    >
                      <option value="">Select Year</option>
                      {availableYears.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                  </div>

                  {/* Fuel */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Zap className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                    <select
                      value={pending.filterFuel}
                      onChange={(e) => setPending((p) => ({ ...p, filterFuel: e.target.value }))}
                      className={`${selectClasses} pl-10`}
                      style={{ background: P.cardBg, border: `1px solid ${P.border}`, color: P.text }}
                    >
                      <option value="">Select Fuel Type</option>
                      {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                    <select
                      value={pending.filterPrice}
                      onChange={(e) => setPending((p) => ({ ...p, filterPrice: e.target.value }))}
                      className={`${selectClasses} pl-10`}
                      style={{ background: P.cardBg, border: `1px solid ${P.border}`, color: P.text }}
                    >
                      <option value="">Select Price</option>
                      <option value="Under 5M LKR">Under 5M LKR</option>
                      <option value="5M - 10M LKR">5M – 10M LKR</option>
                      <option value="10M - 20M LKR">10M – 20M LKR</option>
                      <option value="Above 20M LKR">Above 20M LKR</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ChevronDown className="w-4 h-4" style={{ color: P.muted }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RESULTS GRID ── */}
        <div className="pt-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-zinc-200 animate-spin" />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 rounded-3xl border text-center gap-3"
              style={{ background: P.cardBg, borderColor: P.border }}
            >
              <SearchX className="w-14 h-14" style={{ color: P.muted }} />
              <p className="text-lg font-bold" style={{ color: P.text }}>No vehicles match your filters</p>
              <p className="text-sm" style={{ color: P.muted }}>Try adjusting your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold" style={{ color: P.text }}>
                  {Object.values(applied).some((v) => v !== '') ? 'Search Results' : 'Explore Vehicles'}
                </h2>
                <p className="text-[13px] font-bold" style={{ color: P.muted }}>
                  {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((car, idx) => {
                  const isLiked = wishlist.includes(car.vehicle_id);
                  return (
                    <motion.div
                      key={car.vehicle_id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (idx % 12) * 0.04 }}
                      className="group flex flex-col rounded-[24px] border overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}
                    >
                      {/* Image */}
                      <div className="relative h-[200px] overflow-hidden flex items-center justify-center"
                        style={{ background: isDarkMode ? '#0d1117' : '#f1f5f9' }}>
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[11px] font-bold bg-black/40 backdrop-blur-md text-white border border-white/20">
                          {car.vehicle_class?.class_name || 'Standard'}
                        </div>

                        {/* Heart / Like button */}
                        <button
                          onClick={() => toggleWishlist(car.vehicle_id)}
                          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 transition-all hover:scale-110 shadow-lg"
                          title={isLiked ? 'Remove from Garage' : 'Add to Garage'}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        </button>

                        {car.image_url ? (
                          <img
                            src={car.image_url}
                            alt={car.model_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <Car className="w-16 h-16 opacity-10" style={{ color: P.muted }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Details */}
                      <div className="p-5 flex-1 flex flex-col">
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: P.muted }}>
                          {car.brand?.brand_name} · {car.manufacturing_year} · {car.fuel_type?.fuel_type_name}
                        </p>
                        <h3 className="text-[17px] font-extrabold line-clamp-1 mb-4" style={{ color: P.text }}>
                          {car.model_name}
                        </h3>

                        <div className="mt-auto pt-3 border-t" style={{ borderColor: P.border }}>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: P.muted }}>Est. Value</p>
                          <p className="text-xl font-bold tracking-tight" style={{ color: P.text }}>
                            LKR {car.minimum_price ? parseFloat(car.minimum_price).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </motion.div>
  );
}
