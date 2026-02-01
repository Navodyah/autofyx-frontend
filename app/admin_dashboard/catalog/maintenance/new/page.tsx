'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Wrench, Car, DollarSign, Calendar, FileText } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function NewMaintenancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    yearly_cost: '',
    recorded_date: '',
    source: '',
  });

  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      
      const [vehiclesRes, modelsRes] = await Promise.all([
        axios.get(`${API_BASE}/vehicles/`),
        axios.get(`${API_BASE}/models/`)
      ]);

      setVehicles(vehiclesRes.data);
      setModels(modelsRes.data);
      
      console.log('✓ Vehicles loaded:', vehiclesRes.data.length);
      console.log('✓ Models loaded:', modelsRes.data.length);

    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load required data. Please check backend.');
    } finally {
      setDataLoading(false);
    }
  };

  
  const getModelName = (modelId: number) => {
    const model = models.find(m => m.model_id === modelId);
    return model ? model.model_name : 'Unknown Model';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      vehicle_id: parseInt(formData.vehicle_id),
      yearly_cost: parseFloat(formData.yearly_cost),
      recorded_date: formData.recorded_date,
      source: formData.source,
    };

    console.log('Submitting maintenance record:', payload);

    try {
      
      const response = await axios.post(`${API_BASE}/maintenance-costs`, payload);
      
      if (response.status === 200 || response.status === 201) {
        alert('Maintenance record added successfully!');
        router.push('/admin_dashboard/catalog/maintenance');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.detail || 
                           JSON.stringify(error.response?.data) || 
                           'Error adding maintenance record';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin_dashboard/catalog/maintenance">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Maintenance Records
          </button>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Wrench className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add Maintenance Record</h1>
                <p className="text-green-100 mt-1">Register yearly maintenance cost data</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Vehicle Dropdown */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Car className="w-4 h-4 text-green-600" />
                Vehicle <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle: any) => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {/* 🛠️ FIX 2 */}
                    Vehicle #{vehicle.vehicle_id} - {getModelName(vehicle.model_id)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">{vehicles.length} vehicles available</p>
            </div>

            {/* Yearly Cost Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign className="w-4 h-4 text-green-600" />
                Yearly Maintenance Cost (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="yearly_cost"
                value={formData.yearly_cost}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 50000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Recorded Date Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-green-600" />
                Recorded Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="recorded_date"
                value={formData.recorded_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Source Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 text-green-600" />
                Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                placeholder="e.g. Service Center Report, Owner Manual"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Preview Section */}
            {formData.vehicle_id && formData.yearly_cost && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-2">📋 Record Preview</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-green-800">
                    <span className="font-medium">Vehicle:</span> #{formData.vehicle_id}
                  </div>
                  <div className="text-green-800">
                    <span className="font-medium">Cost:</span> Rs. {parseFloat(formData.yearly_cost).toLocaleString()}
                  </div>
                  <div className="text-green-800">
                    <span className="font-medium">Date:</span> {formData.recorded_date || 'Not set'}
                  </div>
                  <div className="text-green-800">
                    <span className="font-medium">Source:</span> {formData.source || 'Not set'}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Adding Record...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Add Record
                  </>
                )}
              </button>
              <Link href="/admin_dashboard/catalog/maintenance" className="flex-1">
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}