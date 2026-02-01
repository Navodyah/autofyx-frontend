'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Save, Fuel } from 'lucide-react';

interface FuelTypeFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function FuelTypeForm({ initialData, isEdit = false }: FuelTypeFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.fuel_type_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const fuelTypeOptions = [
    "Petrol 92 Octane",
    "Petrol 95 Octane",
    "Auto Diesel",
    "Super Diesel",
    "Electric",
    "Hybrid (Petrol)",
    "Hybrid (Diesel)"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { fuel_type_name: name };

    try {
      if (isEdit) {
        // PUT request with axios
        const response = await axios.put(
          `http://127.0.0.1:8000/fuel_types/${initialData.fuel_type_id}`,
          payload
        );

        if (response.status === 200) {
          alert("Updated Successfully!");
          router.push('/admin_dashboard/catalog/FuelType');
        }
      } else {
        // POST request with axios
        const response = await axios.post('http://127.0.0.1:8000/fuel_types/', payload);

        if (response.status === 200 || response.status === 201) {
          alert("Created Successfully!");
          router.push('/admin_dashboard/catalog/FuelType');
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
          <Fuel className="w-4 h-4 text-blue-600" />
          Fuel Type Name <span className="text-red-500">*</span>
        </label>
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
        >
          <option value="" disabled>Select a Fuel Type</option>
          {fuelTypeOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Fuel Type Preview */}
      {name && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            ⛽ Selected: <span className="font-semibold">{name}</span>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !name}
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
            {isEdit ? 'Update Fuel Type' : 'Add Fuel Type'}
          </>
        )}
      </button>
    </form>
  );
}