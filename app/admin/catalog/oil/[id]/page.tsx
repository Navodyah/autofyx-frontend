'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Edit, Droplet, FileText } from 'lucide-react';

export default function EditOilQualityPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [formData, setFormData] = useState({
    oil_grade: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined') {
      alert('Invalid oil quality ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // GET request with axios
        const response = await axios.get(`http://127.0.0.1:8000/oil_quality/${id}`);
        setFormData({
          oil_grade: response.data.oil_grade,
          description: response.data.description || ''
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching oil quality:", error);
        alert("Oil Quality not found");
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
      const response = await axios.put(`http://127.0.0.1:8000/oil_quality/${id}`, {
        oil_grade: formData.oil_grade,
        description: formData.description
      });

      if (response.status === 200) {
        alert("Oil Quality Updated Successfully!");
        router.push('/admin/catalog/oil');
      }
    } catch (error: any) {
      console.error("Error updating:", error);
      const errorMessage = error.response?.data?.detail || "Error updating data";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading oil quality data...</p>
        </div>
      </div>
    );
  }

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
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Edit className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Oil Quality</h1>
                <p className="text-orange-100 mt-1">Update oil grade information (ID: {id})</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            {/* Oil Grade */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Droplet className="w-4 h-4 text-orange-600" />
                Oil Grade <span className="text-red-500">*</span>
              </label>
              <input
                name="oil_grade"
                type="text"
                value={formData.oil_grade}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 text-orange-600" />
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Preview */}
            {formData.oil_grade && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800">
                  🛢️ Oil Grade: <span className="font-semibold">{formData.oil_grade}</span>
                </p>
                {formData.description && (
                  <p className="text-sm text-orange-700 mt-2">
                    📝 {formData.description}
                  </p>
                )}
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
                    Update Oil Quality
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

        {/* Warning Card */}
        <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-orange-900 mb-2">⚠️ Note</h3>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Changes will affect all related vehicle maintenance records</li>
            <li>• Ensure the oil grade format is correct (e.g., 5W-30)</li>
            <li>• Oil grade field is required for update</li>
          </ul>
        </div>
      </div>
    </div>
  );
}