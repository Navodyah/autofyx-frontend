'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users, Search, Shield, Ban, Trash2, RefreshCw, User, Mail,
  Calendar, CheckCircle, XCircle, Activity, Save, KeyRound,
  Image as ImageIcon, Loader2, ChevronDown, Plus, X,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UserRecord {
  _id: string; username: string; email: string; user_type: string;
  created_at?: string; is_banned?: boolean; profile_image_url?: string; appwrite_id?: string;
}

function getInitials(n: string) {
  return n?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
}
function roleCls(r: string) {
  if (r === 'admin') return 'bg-red-50 text-red-600';
  if (r === 'researcher') return 'bg-indigo-50 text-indigo-600';
  return 'bg-blue-50 text-blue-600';
}
function fmtDate(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ───── Toast ───── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
      {ok ? <CheckCircle size={16} /> : <XCircle size={16} />}{msg}
    </div>
  );
}

/* ───── Modal Shell ───── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-bold text-slate-800 text-base">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} className="text-slate-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ───── Activity Modal ───── */
function ActivityModal({ user, onClose }: { user: UserRecord; onClose: () => void }) {
  const [data, setData] = useState<{ searches: any[]; comparisons: any[]; logins: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/users/activity/${user._id}`)
      .then(r => setData(r.data))
      .catch(() => setData({ searches: [], comparisons: [], logins: [] }))
      .finally(() => setLoading(false));
  }, [user._id]);

  return (
    <Modal title={`Activity — ${user.username}`} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : (
        <div className="space-y-6">
          {[
            { label: 'Searches', items: data?.searches || [], key: 'query' },
            { label: 'Logins', items: data?.logins || [], key: 'timestamp' },
            { label: 'Comparisons', items: data?.comparisons || [], key: 'created_at' },
          ].map(sec => (
            <div key={sec.label}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{sec.label} ({sec.items.length})</p>
              {sec.items.length === 0
                ? <p className="text-xs text-slate-300 italic">No records.</p>
                : sec.items.slice(0, 5).map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 mb-1.5 text-xs font-medium text-slate-600 flex justify-between">
                    <span>{item[sec.key] ? String(item[sec.key]).slice(0, 50) : 'Event'}</span>
                    {item.timestamp && <span className="text-slate-400 ml-2 shrink-0">{fmtDate(item.timestamp)}</span>}
                  </div>
                ))
              }
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ───── Edit Modal ───── */
function EditModal({ user, onClose, onSaved, showToast }: { user: UserRecord; onClose: () => void; onSaved: () => void; showToast: (m: string, ok: boolean) => void }) {
  const [username, setUsername] = useState(user.username);
  const [imageUrl, setImageUrl] = useState(user.profile_image_url || '');
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/users/profile/${user._id}`, { username, profile_image_url: imageUrl });
      if (newPw) await axios.post(`${API}/users/admin-reset-password`, { user_id: user._id, new_password: newPw });
      showToast('Profile updated!', true); onSaved(); onClose();
    } catch { showToast('Update failed.', false); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Edit — ${user.username}`} onClose={onClose}>
      <div className="space-y-4">
        {/* Profile Image Preview */}
        <div className="flex items-center gap-4">
          {imageUrl
            ? <img src={imageUrl} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow">{getInitials(user.username)}</div>
          }
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1">Profile Image URL</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Email (read-only)</label>
          <input disabled value={user.email} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-400 cursor-not-allowed" />
        </div>

        <div className="pt-3 border-t">
          <label className="block text-xs font-bold text-orange-500 mb-1">Reset Password</label>
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 transition-all" />
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

/* ───── Create Account Modal ───── */
function CreateModal({ onClose, onCreated, showToast }: { onClose: () => void; onCreated: () => void; showToast: (m: string, ok: boolean) => void }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', user_type: 'user' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const create = async () => {
    if (!form.username || !form.email || !form.password) { showToast('All fields required.', false); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/users/register`, form);
      showToast('Account created!', true); onCreated(); onClose();
    } catch (e: any) {
      showToast(e?.response?.data?.detail || 'Creation failed.', false);
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Create New Account" onClose={onClose}>
      <div className="space-y-4">
        {[
          { label: 'Username', key: 'username', type: 'text', placeholder: 'johndoe' },
          { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
          { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 8 characters' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-slate-500 mb-1">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 transition-all" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Role</label>
          <select value={form.user_type} onChange={e => set('user_type', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 transition-all bg-white">
            <option value="user">User</option>
            <option value="researcher">Researcher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button onClick={create} disabled={saving}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Create Account
        </button>
      </div>
    </Modal>
  );
}

/* ───── Ban Modal ───── */
function BanModal({ user, onClose, onDone, showToast }: { user: UserRecord; onClose: () => void; onDone: () => void; showToast: (m: string, ok: boolean) => void }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    try {
      await axios.patch(`${API}/users/ban/${user._id}`, { is_banned: !user.is_banned, reason });
      showToast(user.is_banned ? 'User unbanned.' : 'User banned.', true);
      onDone(); onClose();
    } catch { showToast('Action failed.', false); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={user.is_banned ? `Unban ${user.username}` : `Ban ${user.username}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-orange-50 border border-orange-100">
          <Ban size={20} className="text-orange-500 shrink-0" />
          <p className="text-sm font-medium text-orange-700">
            {user.is_banned ? 'This will restore access for this user.' : 'This will revoke access for this user.'}
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Reason <span className="text-slate-300 font-normal">(optional)</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder="Add an optional reason..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 transition-all resize-none" />
        </div>
        <button onClick={execute} disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${user.is_banned ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
          {user.is_banned ? 'Unban User' : 'Ban User'}
        </button>
      </div>
    </Modal>
  );
}

/* ───── Main Page ───── */
export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [banUser, setBanUser] = useState<UserRecord | null>(null);
  const [activityUser, setActivityUser] = useState<UserRecord | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [delLoading, setDelLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/users/all`);
      setUsers(r.data.users || []);
    } catch { showToast('Failed to load users.', false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (user: UserRecord) => {
    if (!confirm(`Permanently delete "${user.username}"? This cannot be undone.`)) return;
    setDelLoading(user._id);
    try {
      await axios.delete(`${API}/users/delete`, { data: { appwrite_id: user.appwrite_id, user_id: user._id } });
      showToast('User deleted.', true); fetchUsers();
    } catch { showToast('Delete failed.', false); }
    finally { setDelLoading(null); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const m = u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const r = roleFilter === 'all' || u.user_type === roleFilter;
    return m && r;
  });

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Regular Users', value: users.filter(u => u.user_type === 'user').length, icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Researchers', value: users.filter(u => u.user_type === 'researcher').length, icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Banned', value: users.filter(u => u.is_banned).length, icon: Ban, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-screen bg-slate-50/20">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} onSaved={fetchUsers} showToast={showToast} />}
      {banUser && <BanModal user={banUser} onClose={() => setBanUser(null)} onDone={fetchUsers} showToast={showToast} />}
      {activityUser && <ActivityModal user={activityUser} onClose={() => setActivityUser(null)} />}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchUsers} showToast={showToast} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users size={22} className="text-blue-600" />User Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">View, manage and moderate all platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
            <Plus size={16} /> Create Account
          </button>
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-500' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-400 shadow-sm transition-all" />
        </div>
        <div className="relative">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm cursor-pointer">
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center">
                  <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} />
                  <p className="text-slate-400 text-sm mt-2">Loading users…</p>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center">
                  <Users size={36} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No users found.</p>
                </td></tr>
              ) : filtered.map(user => (
                <tr key={user._id} className={`hover:bg-slate-50/60 transition-colors ${user.is_banned ? 'opacity-60' : ''}`}>
                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {user.profile_image_url
                        ? <img src={user.profile_image_url} className="w-10 h-10 rounded-full object-cover border-2 border-slate-100" />
                        : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{getInitials(user.username)}</div>
                      }
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{user.username}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{user._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail size={12} className="text-slate-300 shrink-0" />
                      <span className="truncate max-w-[180px]">{user.email}</span>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${roleCls(user.user_type)}`}>{user.user_type}</span>
                  </td>
                  {/* Joined */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar size={12} className="text-slate-300" />{fmtDate(user.created_at)}
                    </div>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    {user.is_banned
                      ? <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><XCircle size={14} />Banned</span>
                      : <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500"><CheckCircle size={14} />Active</span>
                    }
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {/* Edit */}
                      <button onClick={() => setEditUser(user)} title="Edit profile"
                        className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                        <User size={15} />
                      </button>
                      {/* Activity */}
                      <button onClick={() => setActivityUser(user)} title="View activity"
                        className="p-2 rounded-lg bg-violet-50 text-violet-500 hover:bg-violet-100 transition-colors">
                        <Activity size={15} />
                      </button>
                      {/* Ban */}
                      <button onClick={() => setBanUser(user)} title={user.is_banned ? 'Unban' : 'Ban'}
                        className={`p-2 rounded-lg transition-colors ${user.is_banned ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100' : 'bg-orange-50 text-orange-500 hover:bg-orange-100'}`}>
                        <Ban size={15} />
                      </button>
                      {/* Delete */}
                      <button onClick={() => handleDelete(user)} title="Delete user" disabled={delLoading === user._id}
                        className="p-2 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors disabled:opacity-50">
                        {delLoading === user._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{users.length}</span> users</span>
          </div>
        )}
      </div>
    </div>
  );
}
