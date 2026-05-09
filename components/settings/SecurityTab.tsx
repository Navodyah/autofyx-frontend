'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, Eye, EyeOff, AlertTriangle, Bell, BellOff } from 'lucide-react';
import { performFullLogout } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function getPasswordStrength(pw: string): { label: string; score: number; color: string } {
  if (!pw) return { label: 'None', score: 0, color: '#e5e7eb' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', score, color: '#ef4444' };
  if (score <= 3) return { label: 'Fair', score, color: '#f59e0b' };
  if (score === 4) return { label: 'Good', score, color: '#3b82f6' };
  return { label: 'Strong', score, color: '#10b981' };
}

function timeSince(dateStr?: string): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}

interface Props {
  P: Record<string, string>;
  isDarkMode: boolean;
  identity: { user_id?: string; appwrite_id?: string; email?: string };
  inputBaseClasses: string;
  labelClasses: string;
  inputStyle: Record<string, string>;
  onToast?: (type: 'success' | 'error', title: string, msg?: string) => void;
}

export function SecurityTab({ P, isDarkMode, identity, inputBaseClasses, labelClasses, inputStyle, onToast }: Props) {
  const router = useRouter();

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Alerts toggle
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('login_alerts_enabled');
    return saved === null ? true : saved === 'true';
  });

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  // Security metadata from profile
  const [lastLogin, setLastLogin] = useState<string | undefined>();
  const [lastPwChange, setLastPwChange] = useState<string | undefined>();

  useEffect(() => {
    const ud = localStorage.getItem('user_data');
    if (ud) {
      try {
        const u = JSON.parse(ud);
        setLastLogin(u.last_login);
        setLastPwChange(u.last_password_change);
      } catch {}
    }
  }, []);

  const strength = getPasswordStrength(newPw);

  const handleToggleAlerts = () => {
    const next = !alertsEnabled;
    setAlertsEnabled(next);
    localStorage.setItem('login_alerts_enabled', String(next));
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: 'error', text: 'All three password fields are required.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (!identity.appwrite_id || !identity.email) {
      setPwMsg({ type: 'error', text: 'Session error – please log out and back in.' });
      return;
    }
    try {
      setPwLoading(true);
      const res = await fetch(`${API_BASE}/users/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appwrite_id: identity.appwrite_id,
          email: identity.email,
          current_password: currentPw,
          new_password: newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Password change failed.');
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      onToast?.('success', 'Password updated', 'Your password has been changed successfully.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      // Update last_password_change in localStorage
      const ud = localStorage.getItem('user_data');
      if (ud) {
        const u = JSON.parse(ud);
        u.last_password_change = new Date().toISOString();
        localStorage.setItem('user_data', JSON.stringify(u));
        setLastPwChange(u.last_password_change);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed.';
      setPwMsg({ type: 'error', text: msg });
      onToast?.('error', 'Password change failed', msg);
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteMsg('Type DELETE to confirm.');
      return;
    }
    if (!identity.appwrite_id) {
      setDeleteMsg('Session error – please log out and back in.');
      return;
    }
    try {
      setDeleteLoading(true);
      const res = await fetch(`${API_BASE}/users/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appwrite_id: identity.appwrite_id, user_id: identity.user_id || '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Delete failed.');
      await performFullLogout(undefined);
      router.push('/');
    } catch (e: unknown) {
      setDeleteMsg(e instanceof Error ? e.message : 'Delete failed.');
      setDeleteLoading(false);
    }
  };

  const securityScore = [
    !!lastPwChange,
    alertsEnabled,
    !!(identity.appwrite_id),
  ].filter(Boolean).length;
  const securityLabel = securityScore >= 3 ? 'Strong' : securityScore === 2 ? 'Good' : 'Fair';
  const securityColor = securityScore >= 3 ? '#10b981' : securityScore === 2 ? '#3b82f6' : '#f59e0b';
  const securityBgDark = securityScore >= 3 ? 'rgba(16,185,129,0.1)' : securityScore === 2 ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)';
  const securityBorderDark = securityScore >= 3 ? 'rgba(16,185,129,0.2)' : securityScore === 2 ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)';

  const iStyle = { ...inputStyle, borderColor: 'transparent', outline: `1px solid ${P.border}` };

  return (
    <motion.div
      key="security"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-[32px] p-8 xl:p-10 transition-colors duration-500 space-y-10"
      style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
    >
      {/* ── Header & Status Widgets ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b pb-8" style={{ borderColor: P.border }}>
        <div>
          <h2 className="text-xl font-extrabold tracking-tight" style={{ color: P.text }}>Security & Access</h2>
          <p className="text-sm font-medium mt-1.5" style={{ color: P.muted }}>
            Manage your password, monitor logins, and safeguard your account.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Last Login */}
          <div className="px-4 py-2.5 rounded-xl flex flex-col border shadow-sm" style={{ borderColor: P.border, background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#FAFAFA' }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>Last Login</span>
            <span className="text-[13px] font-extrabold mt-0.5" style={{ color: P.text }}>{timeSince(lastLogin)}</span>
          </div>
          {/* Last Password Change */}
          <div className="px-4 py-2.5 rounded-xl flex flex-col border shadow-sm" style={{ borderColor: P.border, background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#FAFAFA' }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>Last Password Change</span>
            <span className="text-[13px] font-extrabold mt-0.5" style={{ color: P.text }}>{timeSince(lastPwChange)}</span>
          </div>
          {/* Security Strength */}
          <div className="px-4 py-2.5 rounded-xl flex flex-col border shadow-sm" style={{ background: isDarkMode ? securityBgDark : `${securityColor}10`, borderColor: isDarkMode ? securityBorderDark : `${securityColor}40` }}>
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: securityColor }}>
              Security Strength <Shield className="w-3 h-3" />
            </span>
            <span className="text-[13px] font-extrabold mt-0.5" style={{ color: securityColor }}>{securityLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Change Password ── */}
      <div>
        <h3 className="text-[16px] font-bold mb-5" style={{ color: P.text }}>Update Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Current Password */}
          <div className="md:col-span-2 md:w-1/2">
            <label className={labelClasses} style={{ color: P.muted }}>Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className={inputBaseClasses}
                style={iStyle}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                style={{ color: P.muted }}>
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* New Password */}
          <div>
            <label className={labelClasses} style={{ color: P.muted }}>New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="••••••••"
                className={inputBaseClasses}
                style={iStyle}
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                style={{ color: P.muted }}>
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength Bar */}
            {newPw && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= strength.score ? strength.color : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb') }} />
                  ))}
                </div>
                <p className="text-[11px] font-bold" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
          </div>
          {/* Confirm Password */}
          <div>
            <label className={labelClasses} style={{ color: P.muted }}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                className={inputBaseClasses}
                style={{ ...iStyle, outlineColor: confirmPw && confirmPw !== newPw ? '#ef4444' : P.border }}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                style={{ color: P.muted }}>
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPw && confirmPw !== newPw && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">Passwords do not match</p>
            )}
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {pwMsg && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mt-4 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${pwMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {pwMsg.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
              {pwMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleChangePassword}
          disabled={pwLoading}
          className="mt-5 flex items-center gap-2 px-8 py-3 rounded-2xl text-[13px] font-bold shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: P.primary, color: P.primaryText }}
        >
          {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {pwLoading ? 'Updating...' : 'Change Password'}
        </button>
      </div>

      {/* ── Login Alerts ── */}
      <div className="pt-8 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: P.border }}>
        <div>
          <h3 className="text-[16px] font-bold flex items-center gap-2" style={{ color: P.text }}>
            {alertsEnabled ? <Bell className="w-4 h-4" style={{ color: P.primary }} /> : <BellOff className="w-4 h-4" style={{ color: P.muted }} />}
            Login Alerts
          </h3>
          <p className="text-[13px] font-medium mt-1" style={{ color: P.muted }}>
            {alertsEnabled ? 'You will be notified when your account is accessed from a new device.' : 'Login alerts are currently disabled.'}
          </p>
        </div>
        <motion.div
          onClick={handleToggleAlerts}
          className="w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors shadow-inner shrink-0"
          style={{ background: alertsEnabled ? P.primary : (isDarkMode ? 'rgba(255,255,255,0.15)' : '#d1d5db') }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            layout
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ background: '#fff', marginLeft: alertsEnabled ? 'auto' : 0 }}
          />
        </motion.div>
      </div>

      {/* ── Delete Account ── */}
      <div className="pt-8 border-t" style={{ borderColor: P.border }}>
        <h3 className="text-[16px] font-bold text-red-500 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Delete Account
        </h3>
        <p className="text-[13px] font-medium mb-5" style={{ color: isDarkMode ? 'rgba(239,68,68,0.7)' : '#b91c1c' }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => { setShowDeleteDialog(true); setDeleteMsg(null); setDeleteConfirmText(''); }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white"
          style={{ background: isDarkMode ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)', border: `1px solid ${isDarkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.3)'}` }}
        >
          Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="rounded-3xl p-8 max-w-md w-full shadow-2xl"
              style={{ background: isDarkMode ? '#0F111A' : '#fff', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-extrabold" style={{ color: isDarkMode ? '#fff' : '#111' }}>Confirm Deletion</h3>
              </div>
              <p className="text-sm mb-5" style={{ color: isDarkMode ? '#8B949E' : '#6B7280' }}>
                This will permanently delete your account, preferences, and all associated data. Type <strong>DELETE</strong> below to confirm.
              </p>
              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmText}
                onChange={e => { setDeleteConfirmText(e.target.value); setDeleteMsg(null); }}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold mb-3 focus:outline-none border"
                style={{ background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f9fafb', borderColor: deleteConfirmText === 'DELETE' ? '#ef4444' : (isDarkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'), color: isDarkMode ? '#fff' : '#111' }}
              />
              {deleteMsg && <p className="text-red-500 text-xs font-semibold mb-3">{deleteMsg}</p>}
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteDialog(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold" style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: isDarkMode ? '#8B949E' : '#374151' }}>
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {deleteLoading ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
