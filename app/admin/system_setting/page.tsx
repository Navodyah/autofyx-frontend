'use client';

import { useState } from 'react';
import {
  Settings, Globe, Shield, Bell, Database, Save, RefreshCw,
  Lock, Key, ChevronRight, Info, AlertTriangle, Check, Server, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Types ──────────────────────────────────────── */
type ToggleProps = { checked: boolean; onChange: (v: boolean) => void };
type SectionProps = { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode };
type FieldProps = { label: string; description?: string; children: React.ReactNode };

/* ── Sub-components ──────────────────────────────── */
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function Section({ title, subtitle, icon, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
    >
      {/* Section header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </motion.div>
  );
}

function Field({ label, description, children }: FieldProps) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────── */
export default function SystemSettingPage() {
  // General
  const [siteName, setSiteName] = useState('AutoFyx Admin');
  const [siteUrl, setSiteUrl] = useState('https://autofyx.com');
  const [timezone, setTimezone] = useState('Asia/Colombo');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [forceHttps, setForceHttps] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState('5');

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [adminEmail, setAdminEmail] = useState('admin@autofyx.com');
  const [newUserAlert, setNewUserAlert] = useState(true);
  const [researcherAlert, setResearcherAlert] = useState(true);
  const [systemAlert, setSystemAlert] = useState(false);

  // Status
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass =
    'w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all';
  const selectClass =
    'w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest">
              <Settings size={12} /> System Configuration
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">System Settings</h1>
            <p className="text-sm text-slate-500">Manage global configuration, security policies, and notification preferences.</p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="saved" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                  <Check size={15} /> Saved!
                </motion.span>
              ) : saving ? (
                <motion.span key="saving" className="flex items-center gap-2">
                  <RefreshCw size={15} className="animate-spin" /> Saving…
                </motion.span>
              ) : (
                <motion.span key="idle" className="flex items-center gap-2">
                  <Save size={15} /> Save Changes
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>

        {/* ── Maintenance Mode Banner ── */}
        <AnimatePresence>
          {maintenanceMode && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-orange-200 bg-orange-50"
            >
              <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-orange-800">Maintenance Mode Active</p>
                <p className="text-xs text-orange-700 mt-0.5">The site is currently inaccessible to regular users. Only admins can access the portal.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── General Settings ── */}
        <Section
          title="General"
          subtitle="Basic platform identity and regional configuration"
          icon={<Globe size={17} />}
        >
          <Field label="Site Name" description="Display name shown in the browser tab and emails">
            <input className={inputClass} style={{ width: '220px' }} value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </Field>
          <Field label="Site URL" description="Canonical public-facing URL of the platform">
            <input className={inputClass} style={{ width: '220px' }} value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
          </Field>
          <Field label="Timezone" description="Server and display timezone for all date/time fields">
            <div className="relative" style={{ width: '220px' }}>
              <select className={selectClass} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                <option value="UTC">UTC (GMT+0)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              </select>
              <ChevronRight size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </Field>
          <Field label="Maintenance Mode" description="Prevent public access while performing updates">
            <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
          </Field>
        </Section>

        {/* ── Security Settings ── */}
        <Section
          title="Security"
          subtitle="Authentication policies and session management"
          icon={<Shield size={17} />}
        >
          <Field label="Two-Factor Authentication" description="Require 2FA for all admin accounts">
            <Toggle checked={twoFactor} onChange={setTwoFactor} />
          </Field>
          <Field label="Force HTTPS" description="Redirect all HTTP traffic to HTTPS">
            <Toggle checked={forceHttps} onChange={setForceHttps} />
          </Field>
          <Field label="Session Timeout (minutes)" description="Automatically sign out inactive admin sessions">
            <input
              className={inputClass}
              style={{ width: '120px' }}
              type="number"
              min={5}
              max={1440}
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            />
          </Field>
          <Field label="Max Login Attempts" description="Lock account after this many consecutive failed attempts">
            <input
              className={inputClass}
              style={{ width: '120px' }}
              type="number"
              min={1}
              max={20}
              value={loginAttempts}
              onChange={(e) => setLoginAttempts(e.target.value)}
            />
          </Field>
          <Field label="API Secret Key" description="Used to sign all JWT tokens — rotate regularly">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-500"
                style={{ width: '186px' }}
              >
                <Lock size={12} className="text-slate-400 flex-shrink-0" />
                ••••••••••••••••••••••••
              </div>
              <button className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all shadow-sm" title="Rotate key">
                <Key size={14} />
              </button>
            </div>
          </Field>
        </Section>

        {/* ── Notification Settings ── */}
        <Section
          title="Notifications"
          subtitle="Configure email alerts and event triggers"
          icon={<Bell size={17} />}
        >
          <Field label="Email Alerts Enabled" description="Master toggle for all admin notification emails">
            <Toggle checked={emailAlerts} onChange={setEmailAlerts} />
          </Field>
          <Field label="Admin Alert Email" description="Destination address for all system notifications">
            <input
              className={`${inputClass} ${!emailAlerts ? 'opacity-40 pointer-events-none' : ''}`}
              style={{ width: '220px' }}
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              disabled={!emailAlerts}
            />
          </Field>
          <Field label="New User Registrations" description="Alert when a new user creates an account">
            <Toggle checked={newUserAlert} onChange={setNewUserAlert} />
          </Field>
          <Field label="Researcher Requests" description="Alert when a researcher application is submitted">
            <Toggle checked={researcherAlert} onChange={setResearcherAlert} />
          </Field>
          <Field label="System Health Alerts" description="Alert when backend services report errors">
            <Toggle checked={systemAlert} onChange={setSystemAlert} />
          </Field>
        </Section>

        {/* ── System Maintenance ── */}
        <Section
          title="Maintenance"
          subtitle="Database utilities and data management actions"
          icon={<Database size={17} />}
        >
          <Field label="Clear Application Cache" description="Purge all cached responses and temporary files">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCw size={13} /> Clear Cache
            </button>
          </Field>
          <Field label="Export System Logs" description="Download the last 30 days of admin activity logs">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all">
              <Server size={13} /> Export Logs
            </button>
          </Field>
          <Field label="Database Backup" description="Create a full encrypted backup of the database">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <Database size={13} /> Run Backup
            </button>
          </Field>
          <Field
            label="Purge All User Data"
            description="Permanently delete all user accounts and associated records"
          >
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all">
              <Trash2 size={13} /> Purge Data
            </button>
          </Field>
        </Section>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <Info size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500">
            Changes are applied immediately upon saving. Critical actions (purge, key rotation) require a
            secondary confirmation step before execution in a production environment.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
