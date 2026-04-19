'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

import {
  getRegistrationPreferences,
  saveRegistrationPreferences,
  type UserPreferencesInput,
} from '@/lib/appwrite';
import { parseBrowserAuthToken } from '@/lib/auth-token';

const defaultPreferences: UserPreferencesInput = {
  monthly_salary_range: '100,001 - 200,000',
  daily_distance_km: 20,
  usage_purpose: 'Office',
  fuel_preference: 'Hybrid',
  priority: 'Fuel Efficiency',
};

export default function UserPreferenceOnboardingModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UserPreferencesInput>(defaultPreferences);

  const identity = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const token = window.localStorage.getItem('access_token') || window.localStorage.getItem('token');
    const parsed = parseBrowserAuthToken(token);
    return {
      user_id: parsed?.user_id,
      appwrite_id: parsed?.appwrite_id,
      email: parsed?.email,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!identity.user_id && !identity.appwrite_id && !identity.email) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const existing = await getRegistrationPreferences(identity);
        if (!cancelled) {
          setOpen(!existing);
        }
      } catch {
        if (!cancelled) setOpen(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [identity]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await saveRegistrationPreferences({
        ...identity,
        ...form,
      });
      setOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (!open || loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20">
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Set Your Preferences</h2>
            <p className="text-sm text-slate-300">Complete this once before using your dashboard.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">Monthly salary range</label>
            <select
              value={form.monthly_salary_range}
              onChange={(e) => setForm((prev) => ({ ...prev, monthly_salary_range: e.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            >
              <option value="0 - 100,000">0 - 100,000</option>
              <option value="100,001 - 200,000">100,001 - 200,000</option>
              <option value="200,001 - 350,000">200,001 - 350,000</option>
              <option value="350,001 - 500,000">350,001 - 500,000</option>
              <option value="500,001+">500,001+</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Daily distance (km)</label>
            <input
              type="number"
              min={0}
              value={form.daily_distance_km}
              onChange={(e) => setForm((prev) => ({ ...prev, daily_distance_km: Number(e.target.value) || 0 }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Usage purpose</label>
            <select
              value={form.usage_purpose}
              onChange={(e) => setForm((prev) => ({ ...prev, usage_purpose: e.target.value as UserPreferencesInput['usage_purpose'] }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            >
              <option value="Office">Office</option>
              <option value="Family">Family</option>
              <option value="Travel">Travel</option>
              <option value="Rent">Rent</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Fuel preference</label>
            <select
              value={form.fuel_preference}
              onChange={(e) => setForm((prev) => ({ ...prev, fuel_preference: e.target.value as UserPreferencesInput['fuel_preference'] }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            >
              <option value="Petrol">Petrol</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
              <option value="Diesel">Diesel</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as UserPreferencesInput['priority'] }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            >
              <option value="Fuel Efficiency">Fuel Efficiency</option>
              <option value="Resale Value">Resale Value</option>
              <option value="Comfort">Comfort</option>
              <option value="Performance">Performance</option>
            </select>
          </div>

          {error && (
            <div className="sm:col-span-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white hover:from-cyan-600 hover:to-blue-600 disabled:opacity-70"
            >
              {saving ? 'Saving preferences...' : 'Continue to dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
