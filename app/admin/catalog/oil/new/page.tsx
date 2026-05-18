'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Droplet, FileText } from 'lucide-react';

export default function NewOilQualityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    oil_grade: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // POST request with axios
      const response = await axios.post('http://127.0.0.1:8000/oil_quality/', {
        oil_grade: formData.oil_grade,
        description: formData.description
      });

      if (response.status === 200 || response.status === 201) {
        alert("Oil Quality Added Successfully!");
        router.push('/admin/catalog/oil');
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
        <Link href="/admin/catalog/oil">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Oil Quality
          </button>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Droplet className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New Oil Quality</h1>
                <p className="text-blue-100 mt-1">Create a new oil grade specification</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Oil Grade */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Droplet className="w-4 h-4 text-blue-600" />
                Oil Grade <span className="text-red-500">*</span>
              </label>
              <input
                name="oil_grade"
                type="text"
                value={formData.oil_grade}
                onChange={handleChange}
                required
                placeholder="e.g. 0W-20, 5W-30, 10W-40"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 text-blue-600" />
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Recommended for newer engines, high performance, fuel efficiency..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Preview */}
            {formData.oil_grade && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  🛢️ Oil Grade: <span className="font-semibold">{formData.oil_grade}</span>
                </p>
                {formData.description && (
                  <p className="text-sm text-blue-700 mt-2">
                    📝 {formData.description}
                  </p>
                )}
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
                    Save Oil Quality
                  </>
                )}
              </button>
              <Link href="/admin/catalog/oil" className="flex-1">
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
          <h3 className="font-semibold text-blue-900 mb-2">📝 Common Oil Grades</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>0W-20:</strong> Ultra-low viscosity for modern engines</li>
            <li>• <strong>5W-30:</strong> Most common, good all-season performance</li>
            <li>• <strong>10W-40:</strong> Higher viscosity for older/high-mileage engines</li>
            <li>• <strong>15W-40:</strong> Diesel engines and heavy-duty applications</li>
            <li>• <strong>20W-50:</strong> High-performance or racing engines</li>
          </ul>
        </div>
      </div>
    </div>
  );
}