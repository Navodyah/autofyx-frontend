'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Car } from 'lucide-react';

export default function NewVehicleClassPage() {
  const router = useRouter();
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // POST request with axios
      const response = await axios.post('http://127.0.0.1:8000/vehicle_classes/', {
        class_name: className
      });

      if (response.status === 200 || response.status === 201) {
        alert("Vehicle Class Added Successfully!");
        router.push('/admin/catalog/vehicles_class');
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
        <Link href="/admin_dashboard/catalog/vehicles_class">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Vehicle Classes
          </button>
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New Vehicle Class</h1>
                <p className="text-blue-100 mt-1">Create a new vehicle classification category</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Class Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Car className="w-4 h-4 text-blue-600" />
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. SUV, Sedan, Hatchback, Coupe"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Preview */}
            {className && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  🚗 Vehicle Class: <span className="font-semibold">{className}</span>
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
                    Save Vehicle Class
                  </>
                )}
              </button>
              <Link href="/admin/catalog/vehicles_class" className="flex-1">
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
          <h3 className="font-semibold text-blue-900 mb-2">📝 Common Vehicle Classes</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>SUV:</strong> Sport Utility Vehicle</li>
            <li>• <strong>Sedan:</strong> Standard passenger car</li>
            <li>• <strong>Hatchback:</strong> Compact car with rear door</li>
            <li>• <strong>Coupe:</strong> Two-door sports car</li>
            <li>• <strong>Wagon:</strong> Estate car with extended cargo area</li>
            <li>• <strong>Van:</strong> Multi-purpose vehicle</li>
            <li>• <strong>Truck:</strong> Pickup or commercial vehicle</li>
          </ul>
        </div>
      </div>
    </div>
  );
}