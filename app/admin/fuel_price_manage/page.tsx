'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Search, Save, Gauge, ArrowRight, Loader2, RefreshCw, XCircle, Fuel, Calendar } from 'lucide-react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ───── Toast ───── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
      {ok ? <CheckCircle size={16} /> : <XCircle size={16} />}{msg}
    </div>
  );
}

export default function FuelPriceManage() {
  const [dbPrices, setDbPrices] = useState<any[]>([]);
  const [scrapedData, setScrapedData] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDbPrices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/fuel_types/`);
      if (res.ok) {
        setDbPrices(await res.json());
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load prices.', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbPrices();
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch(`${API}/fuel_types/scrape`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setScrapedData(data.data);
        showToast(data.message || 'Scraped successfully!', true);
      } else {
        showToast(data.detail || data.message || 'Scrape failed', false);
      }
    } catch (e: any) {
      showToast(e.message || 'Scrape failed', false);
    } finally {
      setScraping(false);
    }
  };

  const handleApprove = async () => {
    if (!scrapedData) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API}/fuel_types/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scrapedData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Fuel prices successfully updated!', true);
        setScrapedData(null);
        fetchDbPrices();
      } else {
        showToast(data.detail || 'Update failed', false);
      }
    } catch (e: any) {
      showToast(e.message || 'Update failed', false);
    } finally {
      setUpdating(false);
    }
  };

  const targetIds = [8, 7, 9]; // Petrol 92, Petrol 95, Super Diesel

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-screen bg-slate-50/20 font-sans text-slate-900">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Fuel size={22} className="text-blue-600" />Fuel Price Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review, scrape, and approve Ceypetco fuel prices.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
          >
            {scraping ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Extract Latest Prices
          </button>
          <button onClick={fetchDbPrices}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-500' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Approval Card */}
      {scrapedData && (
        <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} 
          className="bg-white border border-blue-200 rounded-2xl p-6 shadow-md shadow-blue-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 pl-2">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Pending Approval</h3>
              <p className="text-sm text-slate-500">Review the extracted prices before updating the live database.</p>
            </div>
            <button
              onClick={handleApprove}
              disabled={updating}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-100 transition disabled:opacity-50 shrink-0"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Approve & Update DB
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pl-2">
            {targetIds.map(id => {
              const current = dbPrices.find(p => p.fuel_type_id === id);
              const proposed = scrapedData[id.toString()];
              if (!proposed) return null;

              const isChanged = current && Number(current.fuel_price) !== proposed;

              return (
                <div key={id} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-blue-500"/> {current?.fuel_type_name || `Fuel ID ${id}`}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Current</p>
                      <p className="text-sm font-semibold text-slate-600">
                        {current?.fuel_price ? `Rs. ${current.fuel_price}` : 'N/A'}
                      </p>
                    </div>
                    
                    <ArrowRight className={`w-5 h-5 ${isChanged ? 'text-blue-500' : 'text-slate-200'}`}/>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-blue-500 uppercase mb-0.5">Proposed</p>
                      <p className="text-lg font-black text-slate-800">
                        Rs. {proposed}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Current Database Prices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['ID', 'Fuel Name', 'Price (LKR)', 'Last Updated'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center">
                  <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
                  <p className="text-slate-400 text-sm mt-2">Loading prices…</p>
                </td></tr>
              ) : dbPrices.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center">
                  <Gauge size={36} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No prices found.</p>
                </td></tr>
              ) : dbPrices.map(item => (
                <tr key={item.fuel_type_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-mono font-bold">
                      #{item.fuel_type_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Gauge size={14} className="text-blue-400" />
                      <span className="font-semibold text-sm text-slate-800">{item.fuel_type_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-slate-800">
                      {item.fuel_price ? `Rs. ${Number(item.fuel_price).toLocaleString()}` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar size={12} className="text-slate-300" />
                      {item.last_updated ? new Date(item.last_updated).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
