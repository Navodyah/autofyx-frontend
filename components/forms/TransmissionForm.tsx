'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Save, Settings, Tag } from 'lucide-react';

interface TransmissionFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function TransmissionForm({ initialData, isEdit = false }: TransmissionFormProps) {
  const router = useRouter();

  // States
  const [name, setName] = useState(initialData?.transmission_name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = [
    'Automatic',
    'Manual',
    'CVT',
    'DCT',
    'Semi-Automatic',
    'AMT'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      transmission_name: name,
      category: category,
    };

    try {
      if (isEdit) {
        // PUT request with axios
        const response = await axios.put(
          `http://127.0.0.1:8000/transmissions/${initialData.transmission_id}`,
          payload
        );

        if (response.status === 200) {
          alert("Updated Successfully!");
          router.push('/admin/catalog/transmission');
        }
      } else {
        // POST request with axios
        const response = await axios.post('http://127.0.0.1:8000/transmissions/', payload);

        if (response.status === 200 || response.status === 201) {
          alert("Created Successfully!");
          router.push('/admin/catalog/transmission');
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
      {/* Transmission Name */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Settings className="w-4 h-4 text-blue-600" />
          Transmission Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. 6-Speed Tiptronic"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Tag className="w-4 h-4 text-blue-600" />
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
            {isEdit ? 'Update Transmission' : 'Add Transmission'}
          </>
        )}
      </button>
    </form>
  );
}