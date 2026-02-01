'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Settings, Tag } from 'lucide-react';

export default function NewTransmissionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    transmission_name: '',
    category: ''
  });

  const categoryOptions = [
    'Automatic',
    'Manual',
    'CVT',
    'DCT',
    'Semi-Automatic',
    'AMT'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // POST request with axios
      const response = await axios.post('http://127.0.0.1:8000/transmissions/', {
        transmission_name: formData.transmission_name,
        category: formData.category
      });

      if (response.status === 200 || response.status === 201) {
        alert("Transmission Added Successfully!");
        router.push('/admin_dashboard/catalog/transmission');
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
        <Link href="/admin_dashboard/catalog/transmission">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Transmissions
          </button>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New Transmission</h1>
                <p className="text-blue-100 mt-1">Create a new transmission specification</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Transmission Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Settings className="w-4 h-4 text-blue-600" />
                Transmission Name <span className="text-red-500">*</span>
              </label>
              <input
                name="transmission_name"
                type="text"
                value={formData.transmission_name}
                onChange={handleChange}
                required
                placeholder="e.g. 6-Speed Tiptronic, 8-Speed Automatic"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Category - Dropdown */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Tag className="w-4 h-4 text-blue-600" />
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
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
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  ⚙️ Transmission: <span className="font-semibold">{formData.transmission_name}</span>
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  📋 Category: <span className="font-semibold">{formData.category}</span>
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
                    Save Transmission
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

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Transmission Categories</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Automatic:</strong> Traditional torque converter automatic</li>
            <li>• <strong>Manual:</strong> Manual gear shifting with clutch</li>
            <li>• <strong>CVT:</strong> Continuously Variable Transmission</li>
            <li>• <strong>DCT:</strong> Dual-Clutch Transmission</li>
            <li>• <strong>Semi-Automatic:</strong> Manual without clutch pedal</li>
            <li>• <strong>AMT:</strong> Automated Manual Transmission</li>
          </ul>
        </div>
      </div>
    </div>
  );
}