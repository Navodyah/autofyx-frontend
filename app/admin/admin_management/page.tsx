'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Search, Trash2, RefreshCw, UserPlus,
  Mail, Calendar, CheckCircle, XCircle, X, Save, KeyRound, Image as ImageIcon
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UserRecord {
  _id: string;
  username: string;
  email: string;
  user_type: string;
  created_at?: string;
  appwrite_id?: string;
  is_banned?: boolean;
  profile_image_url?: string;
}

function getInitials(name: string) {
  return name?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
}

/* ── Add Admin Modal ── */
function AddAdminModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const saveAdmin = async () => {
    if (!username || !email || password.length < 8) {
      setMsg('Please fill all fields. Password must be 8+ chars.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await axios.post(`${API}/users/register`, {
        username,
        email,
        password,
        user_type: 'admin'
      });
      setMsg('Admin created successfully!');
      setTimeout(() => {
        onSaved();
      }, 1000);
    } catch (err: any) {
      setMsg(err.response?.data?.detail || 'Failed to create admin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <UserPlus size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Add New Admin</h3>
              <p className="text-xs text-slate-500">Create a new administrator account</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
          </div>
          
          <button onClick={saveAdmin} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
            <Save size={16} />{saving ? 'Creating...' : 'Create Admin'}
          </button>

          {msg && <p className={`text-xs text-center font-medium py-2 px-3 rounded-lg ${msg.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</p>}
        </div>
      </div>
    </div>
  );
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/users/all`);
      const allUsers: UserRecord[] = r.data.users || [];
      setAdmins(allUsers.filter(u => u.user_type === 'admin'));
    } catch { showToast('Failed to load admins.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleDelete = async (user: UserRecord) => {
    if (!confirm(`Permanently delete admin ${user.username}? This cannot be undone.`)) return;
    setActionLoading(user._id + '-del');
    try {
      await axios.delete(`${API}/users/delete`, { data: { appwrite_id: user.appwrite_id, user_id: user._id } });
      showToast('Admin deleted successfully.');
      fetchAdmins();
    } catch { showToast('Delete failed.'); }
    finally { setActionLoading(null); }
  };

  const filtered = admins.filter(u => 
    u.username?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />{toast}
        </div>
      )}

      {showAddModal && <AddAdminModal onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); fetchAdmins(); }} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck size={24} className="text-blue-600" />
            Admin Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage system administrators and their access.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAdmins} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <RefreshCw size={15} />Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
            <UserPlus size={15} />Add Admin
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search admins by name or email…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Loading admins…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShieldCheck size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">No administrators found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Admin', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.profile_image_url
                          ? <img src={user.profile_image_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{getInitials(user.username)}</div>
                        }
                        <div>
                          <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">{user.username}</p>
                          <p className="text-xs text-slate-400 font-mono truncate max-w-[140px]">{user._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} />
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleDelete(user)} title="Delete admin" disabled={actionLoading === user._id + '-del'}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                          {actionLoading === user._id + '-del'
                            ? <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
