"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditEngineType() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({ engine_type_name: '', cylinders: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCurrentData();
  }, [id]);

  const fetchCurrentData = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/engine-types/${id}`);
      setFormData({
        engine_type_name: res.data.engine_type_name,
        cylinders: res.data.cylinders.toString()
      });
    } catch (err) {
      alert("Could not load data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`http://127.0.0.1:8000/engine-types/${id}`, {
        engine_type_name: formData.engine_type_name,
        cylinders: parseInt(formData.cylinders)
      });
      router.push('/admin/catalog/engine-types');
    } catch (error) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this engine type? This action cannot be undone.')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/engine-types/${id}`);
        router.push('/admin/catalog/engine-types');
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Link href="/admin/catalog/engine-types" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Engine Types</span>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Edit3 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Engine Type</h2>
                <p className="text-amber-100 text-sm mt-1">Modify engine configuration (ID: #{id})</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Engine Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-slate-900"
                value={formData.engine_type_name}
                onChange={(e) => setFormData({ ...formData, engine_type_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Number of Cylinders <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="16"
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-slate-900"
                value={formData.cylinders}
                onChange={(e) => setFormData({ ...formData, cylinders: e.target.value })}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-amber-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} /> Update Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-4 border-2 border-red-200 bg-red-50 hover:bg-red-100 rounded-xl font-semibold text-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}