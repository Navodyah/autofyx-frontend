'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Edit, Settings, Tag } from 'lucide-react';

export default function EditTransmissionPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    transmission_name: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const categoryOptions = [
    'Automatic',
    'Manual',
    'CVT',
    'DCT',
    'Semi-Automatic',
    'AMT'
  ];

  useEffect(() => {
    if (!id || id === 'undefined') {
      alert('Invalid transmission ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // GET request with axios
        const response = await axios.get(`http://127.0.0.1:8000/transmissions/${id}`);
        setFormData({
          transmission_name: response.data.transmission_name,
          category: response.data.category || ''
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transmission:", error);
        alert("Transmission not found");
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
      const response = await axios.put(`http://127.0.0.1:8000/transmissions/${id}`, {
        transmission_name: formData.transmission_name,
        category: formData.category
      });

      if (response.status === 200) {
        alert("Transmission Updated Successfully!");
        router.push('/admin_dashboard/catalog/transmission');
      }
    } catch (error: any) {
      console.error("Error updating:", error);
      const errorMessage = error.response?.data?.detail || "Error updating data";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading transmission data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/admin_dashboard/catalog/transmission">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Transmissions
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
                <h1 className="text-3xl font-bold">Edit Transmission</h1>
                <p className="text-orange-100 mt-1">Update transmission information (ID: {id})</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            {/* Transmission Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Settings className="w-4 h-4 text-orange-600" />
                Transmission Name <span className="text-red-500">*</span>
              </label>
              <input
                name="transmission_name"
                type="text"
                value={formData.transmission_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Category - Dropdown */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag className="w-4 h-4 text-orange-600" />
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
              >
                <option value="" disabled>Select a Category</option>
                {categoryOptions.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            {formData.transmission_name && formData.category && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800">
                  ⚙️ Transmission: <span className="font-semibold">{formData.transmission_name}</span>
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  📋 Category: <span className="font-semibold">{formData.category}</span>
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
                    Update Transmission
                  </>
                )}
              </button>
              <Link href="/admin_dashboard/catalog/transmission" className="flex-1">
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
            <li>• Ensure transmission name and category are accurate</li>
            <li>• All fields are required for update</li>
          </ul>
        </div>
      </div>
    </div>
  );
}