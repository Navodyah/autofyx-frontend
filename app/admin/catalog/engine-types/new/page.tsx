"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Save, ArrowLeft, Loader2, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AddEngineType() {
  const router = useRouter();
  const [formData, setFormData] = useState({ engine_type_name: '', cylinders: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/engine-types/', {
        engine_type_name: formData.engine_type_name,
        cylinders: parseInt(formData.cylinders)
      });
      router.push('/admin/catalog/engine-types');
    } catch (error) {
      alert("Error adding engine type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Link href="/admin/catalog/engine-types" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Engine Types</span>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Settings size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create New Engine Type</h2>
                <p className="text-blue-100 text-sm mt-1">Add a new engine configuration to the catalog</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Engine Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., V8, Inline-4, V6 Turbo"
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                value={formData.engine_type_name}
                onChange={(e) => setFormData({ ...formData, engine_type_name: e.target.value })}
                required
              />
              <p className="text-xs text-slate-500 mt-2">Enter a descriptive name for the engine type</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Number of Cylinders <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 4, 6, 8"
                min="1"
                max="16"
                className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                value={formData.cylinders}
                onChange={(e) => setFormData({ ...formData, cylinders: e.target.value })}
                required
              />
              <p className="text-xs text-slate-500 mt-2">Typical range: 3-12 cylinders</p>
            </div>

            {/* Preview Card */}
            {(formData.engine_type_name || formData.cylinders) && (
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border-2 border-blue-100">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Settings className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{formData.engine_type_name || 'Engine Name'}</p>
                    <p className="text-sm text-slate-600">{formData.cylinders || '0'} Cylinders</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Save size={20} /> Create Engine Type
                  </>
                )}
              </button>
              <Link href="/admin/catalog/engine-types" className="flex-shrink-0">
                <button
                  type="button"
                  className="px-6 py-4 border-2 border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}