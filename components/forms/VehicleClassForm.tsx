'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Save, Car } from 'lucide-react';

interface VehicleClassFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function VehicleClassForm({ initialData, isEdit = false }: VehicleClassFormProps) {
  const router = useRouter();
  const [className, setClassName] = useState(initialData?.class_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { class_name: className };

    try {
      if (isEdit) {
        // PUT request with axios
        const response = await axios.put(
          `http://127.0.0.1:8000/vehicle_classes/${initialData.class_id}`,
          payload
        );

        if (response.status === 200) {
          alert("Updated Successfully!");
          router.push('/admin/catalog/vehicles_class');
        }
      } else {
        // POST request with axios
        const response = await axios.post('http://127.0.0.1:8000/vehicle_classes/', payload);

        if (response.status === 200 || response.status === 201) {
          alert("Created Successfully!");
          router.push('/admin/catalog/vehicles_class');
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
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Car className="w-4 h-4 text-blue-600" />
          Class Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. SUV, Sedan, Hatchback"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {className && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            🚗 Class: <span className="font-semibold">{className}</span>
          </p>
        </div>
      )}

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
            {isEdit ? 'Update Class' : 'Add Class'}
          </>
        )}
      </button>
    </form>
  );
}