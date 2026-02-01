"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Cog, Cylinder, Gauge } from 'lucide-react';

export default function AddEngineType() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    engine_type_name: '',
    cylinders: '',
    engine_size: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // POST request with axios
      const response = await axios.post('http://127.0.0.1:8000/engine-types/', {
        engine_type_name: formData.engine_type_name,
        cylinders: parseInt(formData.cylinders),
        engine_size: parseFloat(formData.engine_size)
      });

      if (response.status === 200 || response.status === 201) {
        alert("Engine Type Added Successfully!");
        router.push('/admin_dashboard/catalog/engine-types');
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.detail || "Error saving data";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/admin_dashboard/catalog/engine-types">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Engine Types
          </button>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Cog className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New Engine Type</h1>
                <p className="text-blue-100 mt-1">Create a new engine specification</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Engine Type Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Cog className="w-4 h-4 text-blue-600" />
                Engine Type Name <span className="text-red-500">*</span>
              </label>
              <input
                name="engine_type_name"
                type="text"
                value={formData.engine_type_name}
                onChange={handleChange}
                required
                placeholder="Ex: V6 Turbo, Inline-4, V8 HEMI"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Cylinders */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Cylinder className="w-4 h-4 text-blue-600" />
                  Cylinders <span className="text-red-500">*</span>
                </label>
                <input
                  name="cylinders"
                  type="number"
                  min="1"
                  max="16"
                  value={formData.cylinders}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 4, 6, 8"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Engine Size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  Engine Size (L) <span className="text-red-500">*</span>
                </label>
                <input
                  name="engine_size"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="20"
                  value={formData.engine_size}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 2.0, 3.5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Info Display */}
            {formData.cylinders && formData.engine_size && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  🔧 Configuration: <span className="font-semibold">{formData.cylinders} Cylinder</span> engine with{' '}
                  <span className="font-semibold">{formData.engine_size}L</span> displacement
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Engine Type
                  </>
                )}
              </button>
              <Link href="/admin_dashboard/catalog/engine-types" className="flex-1">
                <button
                  type="button"
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All fields are required</li>
            <li>• Cylinder count typically ranges from 1 to 16</li>
            <li>• Engine size is measured in liters (L)</li>
            <li>• Common sizes: 1.5L, 2.0L, 3.5L, 5.0L</li>
          </ul>
        </div>
      </div>
    </div>
  );
}