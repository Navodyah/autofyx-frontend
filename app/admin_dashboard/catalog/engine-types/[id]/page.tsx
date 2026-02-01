"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Edit, Cog, Cylinder, Gauge } from 'lucide-react';

export default function EditEngineType() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    engine_type_name: '',
    cylinders: '',
    engine_size: ''
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined') {
      alert('Invalid engine type ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // GET request with axios
        const response = await axios.get(`http://127.0.0.1:8000/engine-types/${id}`);
        setFormData({
          engine_type_name: response.data.engine_type_name,
          cylinders: response.data.cylinders.toString(),
          engine_size: response.data.engine_size.toString()
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching engine type:", error);
        alert("Engine Type not found");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // PUT request with axios
      const response = await axios.put(`http://127.0.0.1:8000/engine-types/${id}`, {
        engine_type_name: formData.engine_type_name,
        cylinders: parseInt(formData.cylinders),
        engine_size: parseFloat(formData.engine_size)
      });

      if (response.status === 200) {
        alert("Engine Type Updated Successfully!");
        router.push('/admin_dashboard/catalog/engine-types');
      }
    } catch (error: any) {
      console.error("Error updating:", error);
      const errorMessage = error.response?.data?.detail || "Error updating data";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading engine type data...</p>
        </div>
      </div>
    );
  }

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
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Edit className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Engine Type</h1>
                <p className="text-orange-100 mt-1">Update engine specification (ID: {id})</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            {/* Engine Type Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Cog className="w-4 h-4 text-orange-600" />
                Engine Type Name <span className="text-red-500">*</span>
              </label>
              <input
                name="engine_type_name"
                type="text"
                value={formData.engine_type_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Cylinders */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Cylinder className="w-4 h-4 text-orange-600" />
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Engine Size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-orange-600" />
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Info Display */}
            {formData.cylinders && formData.engine_size && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800">
                  🔧 Configuration: <span className="font-semibold">{formData.cylinders} Cylinder</span> engine with{' '}
                  <span className="font-semibold">{formData.engine_size}L</span> displacement
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Engine Type
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

        {/* Warning Card */}
        <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-orange-900 mb-2">⚠️ Note</h3>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Changes will affect all related vehicle records</li>
            <li>• Ensure cylinder count and engine size are accurate</li>
            <li>• All fields are required for update</li>
          </ul>
        </div>
      </div>
    </div>
  );
}