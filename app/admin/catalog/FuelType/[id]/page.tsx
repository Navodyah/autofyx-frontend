'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Edit, Fuel } from 'lucide-react';

export default function EditFuelTypePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fuelTypeOptions = [
    "Z- Premium Gasonline",
    "X - Regular Gasoline",
    "D - Diesel",
  ];

  useEffect(() => {
    if (!id || id === 'undefined') {
      alert('Invalid fuel type ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // GET request with axios
        const response = await axios.get(`http://127.0.0.1:8000/fuel_types/${id}`);
        setName(response.data.fuel_type_name);
        setLoading(false);
      } catch (error) {
        console.error(error);
        alert('Fuel Type not found');
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
      const response = await axios.put(`http://127.0.0.1:8000/fuel_types/${id}`, {
        fuel_type_name: name
      });

      if (response.status === 200) {
        alert("Fuel Type Updated Successfully!");
        router.push('/admin/catalog/FuelType');
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.detail || "Error updating data";
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading fuel type data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/admin/catalog/FuelType">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Fuel Types
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
                <h1 className="text-3xl font-bold">Edit Fuel Type</h1>
                <p className="text-orange-100 mt-1">Update fuel type information (ID: {id})</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="p-8 space-y-6">
            {/* Fuel Type Name - Dropdown */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Fuel className="w-4 h-4 text-orange-600" />
                Fuel Type Name <span className="text-red-500">*</span>
              </label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
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
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <p className="text-sm text-orange-800">
                  ⛽ Selected Fuel Type: <span className="font-semibold">{name}</span>
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isUpdating || !name}
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
                    Update Fuel Type
                  </>
                )}
              </button>
              <Link href="/admin/catalog/FuelType" className="flex-1">
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
            <li>• Ensure the fuel type selection is accurate</li>
            <li>• This field is required for update</li>
          </ul>
        </div>
      </div>
    </div>
  );
}