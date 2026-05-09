'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Search, Save, Gauge, ArrowRight } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export default function FuelPriceManage() {
  const [dbPrices, setDbPrices] = useState<any[]>([]);
  const [scrapedData, setScrapedData] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const fetchDbPrices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/fuel_types/`);
      if (res.ok) {
        setDbPrices(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbPrices();
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/fuel_types/scrape`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setScrapedData(data.data);
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.detail || data.message || 'Scrape failed' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setScraping(false);
    }
  };

  const handleApprove = async () => {
    if (!scrapedData) return;
    setUpdating(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/fuel_types/bulk-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scrapedData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Fuel prices successfully updated!' });
        setScrapedData(null);
        fetchDbPrices(); // refresh
      } else {
        setMessage({ type: 'error', text: data.detail || 'Update failed' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setUpdating(false);
    }
  };

  const targetIds = [8, 7, 9]; // Petrol 92, Petrol 95, Super Diesel

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Fuel Price Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and approve Ceypetco fuel prices.</p>
        </div>
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition disabled:opacity-50"
        >
          {scraping ? <span className="animate-spin text-xl">↻</span> : <Search className="w-4 h-4"/>}
          Extract Latest Prices
        </button>
      </div>

      {message && (
        <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} 
          className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
          <p className="text-sm font-medium">{message.text}</p>
        </motion.div>
      )}

      {scrapedData && (
        <motion.div initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="bg-white dark:bg-[#0F111A] border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 shadow-xl shadow-blue-900/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pending Approval</h3>
            <button
              onClick={handleApprove}
              disabled={updating}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl font-medium shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4"/>
              {updating ? 'Updating...' : 'Approve & Update DB'}
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {targetIds.map(id => {
              const current = dbPrices.find(p => p.fuel_type_id === id);
              const proposed = scrapedData[id.toString()];
              if (!proposed) return null;

              const isChanged = current && Number(current.fuel_price) !== proposed;

              return (
                <div key={id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5"/> {current?.fuel_type_name || `Fuel ID ${id}`}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-0.5">Current</p>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {current?.fuel_price ? `Rs. ${current.fuel_price}` : 'N/A'}
                      </p>
                    </div>
                    
                    <ArrowRight className={`w-4 h-4 ${isChanged ? 'text-blue-500' : 'text-slate-300'}`}/>
                    
                    <div>
                      <p className="text-[10px] text-blue-500 font-bold mb-0.5">Proposed</p>
                      <p className="text-lg font-black text-slate-800 dark:text-white">
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

      <div className="bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Current Database Prices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Fuel Name</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Price (LKR)</th>
                <th className="px-6 py-3 font-semibold text-xs uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading prices...</td></tr>
              ) : (
                dbPrices.map(item => (
                  <tr key={item.fuel_type_id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{item.fuel_type_id}</td>
                    <td className="px-6 py-4 font-medium">{item.fuel_type_name}</td>
                    <td className="px-6 py-4 font-bold">{item.fuel_price ? `Rs. ${Number(item.fuel_price).toLocaleString()}` : '-'}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {item.last_updated ? new Date(item.last_updated).toLocaleString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
