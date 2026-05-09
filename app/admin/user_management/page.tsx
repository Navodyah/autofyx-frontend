'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, Search, Shield, Ban, Trash2, Eye, RefreshCw,
  User, Mail, Calendar, CheckCircle, XCircle, Activity,
  X, Save, KeyRound, Image as ImageIcon, ChevronDown,
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

function roleColor(role: string) {
  if (role === 'admin') return 'bg-red-100 text-red-700';
  if (role === 'researcher') return 'bg-indigo-100 text-indigo-700';
  return 'bg-blue-100 text-blue-700';
}

/* ── Activity Modal ── */
function ActivityModal({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  const [data, setData] = useState<{ searches: unknown[]; comparisons: unknown[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/users/activity/${user._id}`)
      .then(r => setData(r.data))
      .catch(() => setData({ searches: [], comparisons: [] }))
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Activity size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">User Activity</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Searches ({data?.searches.length ?? 0})</p>
                {data?.searches.length === 0 ? <p className="text-sm text-slate-400 italic">No searches recorded.</p> : data?.searches.map((s: unknown, i: number) => {
                  const item = s as Record<string, unknown>;
                  return (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 mb-1.5 text-sm text-slate-700">
                      {item.query as string || JSON.stringify(s).slice(0, 60)}
                    </div>
                  );
                })}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comparisons ({data?.comparisons.length ?? 0})</p>
                {data?.comparisons.length === 0 ? <p className="text-sm text-slate-400 italic">No comparisons recorded.</p> : data?.comparisons.map((c: unknown, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-50 mb-1.5 text-sm text-slate-700">{JSON.stringify(c).slice(0, 80)}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Edit Modal ── */
function EditModal({ user, onClose, onSaved }: { user: UserRecord; onClose: () => void; onSaved: () => void }) {
  const [username, setUsername] = useState(user.username);
  const [imageUrl, setImageUrl] = useState(user.profile_image_url || '');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'profile' | 'password'>('profile');

  const saveProfile = async () => {
    setSaving(true); setMsg('');
    try {
      await axios.put(`${API}/users/profile/${user._id}`, { username, profile_image_url: imageUrl });
      setMsg('Profile saved successfully!');
      onSaved();
    } catch { setMsg('Failed to save profile.'); }
    finally { setSaving(false); }
  };

  const resetPassword = async () => {
    if (newPassword.length < 8) { setMsg('Password must be at least 8 characters.'); return; }
    setSaving(true); setMsg('');
    try {
      await axios.post(`${API}/users/admin-reset-password`, { user_id: user._id, new_password: newPassword });
      setMsg('Password reset successfully!');
      setNewPassword('');
    } catch { setMsg('Failed to reset password.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            {user.profile_image_url
              ? <img src={user.profile_image_url} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-200" />
              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">{getInitials(user.username)}</div>
            }
            <div>
              <h3 className="font-bold text-slate-800">{user.username}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5">
          {(['profile', 'password'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t === 'profile' ? <><User size={14} className="inline mr-1.5" />Profile</> : <><KeyRound size={14} className="inline mr-1.5" />Password</>}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {tab === 'profile' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide flex items-center gap-1.5"><ImageIcon size={12} />Profile Image URL</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                {imageUrl && <img src={imageUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover mt-2 border-2 border-slate-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              </div>
              <button onClick={saveProfile} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                <Save size={16} />{saving ? 'Saving...' : 'Save Profile'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <button onClick={resetPassword} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                <KeyRound size={16} />{saving ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}
          {msg && <p className={`text-xs text-center font-medium py-2 px-3 rounded-lg ${msg.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg}</p>}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [activityUser, setActivityUser] = useState<UserRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/users/all`);
      setUsers(r.data.users || []);
    } catch { showToast('Failed to load users.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (user: UserRecord) => {
    setActionLoading(user._id + '-ban');
    try {
      await axios.patch(`${API}/users/ban/${user._id}`, { is_banned: !user.is_banned });
      showToast(`User ${user.is_banned ? 'unbanned' : 'banned'} successfully.`);
      fetchUsers();
    } catch { showToast('Action failed.'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (user: UserRecord) => {
    if (!confirm(`Permanently delete ${user.username}? This cannot be undone.`)) return;
    setActionLoading(user._id + '-del');
    try {
      await axios.delete(`${API}/users/delete`, { data: { appwrite_id: user.appwrite_id, user_id: user._id } });
      showToast('User deleted successfully.');
      fetchUsers();
    } catch { showToast('Delete failed.'); }
    finally { setActionLoading(null); }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.user_type === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    users: users.filter(u => u.user_type === 'user').length,
    researchers: users.filter(u => u.user_type === 'researcher').length,
    banned: users.filter(u => u.is_banned).length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />{toast}
        </div>
      )}

      {/* Modals */}
      {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} onSaved={() => { fetchUsers(); }} />}
      {activityUser && <ActivityModal user={activityUser} onClose={() => setActivityUser(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><Users size={24} className="text-blue-600" />User Management</h1>
          <p className="text-slate-500 mt-1 text-sm">View, manage and moderate all platform users.</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <RefreshCw size={15} />Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'blue' },
          { label: 'Regular Users', value: stats.users, icon: User, color: 'indigo' },
          { label: 'Researchers', value: stats.researchers, icon: Shield, color: 'violet' },
          { label: 'Banned', value: stats.banned, icon: Ban, color: 'red' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center bg-${color}-100`}>
              <Icon size={18} className={`text-${color}-600`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
        </div>
        <div className="relative">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer">
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="researcher">Researchers</option>
            <option value="admin">Admins</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Users size={40} className="text-slate-300" />
            <p className="text-slate-500 text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(user => (
                  <tr key={user._id} className={`hover:bg-slate-50/60 transition-colors ${user.is_banned ? 'opacity-60' : ''}`}>
                    {/* User */}
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
                    {/* Email */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColor(user.user_type)}`}>
                        {user.user_type}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} />
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      {user.is_banned
                        ? <span className="flex items-center gap-1 text-xs font-semibold text-red-600"><XCircle size={14} />Banned</span>
                        : <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle size={14} />Active</span>
                      }
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* Edit */}
                        <button onClick={() => setEditUser(user)} title="Edit profile"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <User size={15} />
                        </button>
                        {/* Activity */}
                        <button onClick={() => setActivityUser(user)} title="View activity"
                          className="p-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors">
                          <Activity size={15} />
                        </button>
                        {/* Ban/Unban */}
                        <button onClick={() => handleBan(user)} title={user.is_banned ? 'Unban' : 'Ban'} disabled={actionLoading === user._id + '-ban'}
                          className={`p-2 rounded-lg transition-colors ${user.is_banned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'} disabled:opacity-50`}>
                          {actionLoading === user._id + '-ban'
                            ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <Ban size={15} />}
                        </button>
                        {/* Delete */}
                        <button onClick={() => handleDelete(user)} title="Delete user" disabled={actionLoading === user._id + '-del'}
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
        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{users.length}</span> users</span>
            <Eye size={14} className="text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}
