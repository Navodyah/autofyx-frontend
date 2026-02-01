'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Save, Droplet, FileText } from 'lucide-react';

interface OilQualityFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function OilQualityForm({ initialData, isEdit = false }: OilQualityFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [grade, setGrade] = useState(initialData?.oil_grade || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      oil_grade: grade,
      description: description,
    };

    try {
      if (isEdit) {
        // PUT request with axios
        const response = await axios.put(
          `http://127.0.0.1:8000/oil_quality/${initialData.oil_id}`,
          payload
        );

        if (response.status === 200) {
          alert("Updated Successfully!");
          router.push('/admin_dashboard/catalog/oil');
        }
      } else {
        // POST request with axios
        const response = await axios.post('http://127.0.0.1:8000/oil_quality/', payload);

        if (response.status === 200 || response.status === 201) {
          alert("Created Successfully!");
          router.push('/admin_dashboard/catalog/oil');
        }
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.detail || "Error occurred";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Oil Grade Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Droplet className="w-4 h-4 text-blue-600" />
          Oil Grade <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. 0W-20, 5W-30, 10W-40"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FileText className="w-4 h-4 text-blue-600" />
          Description
        </label>
        <textarea
          rows={4}
          placeholder="Recommended for newer engines..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            {isEdit ? 'Updating...' : 'Saving...'}
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {isEdit ? 'Update Oil Quality' : 'Add Oil Quality'}
          </>
        )}
      </button>
    </form>
  );
}