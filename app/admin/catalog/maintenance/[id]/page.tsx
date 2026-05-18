'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Save, Edit, Car, DollarSign, Calendar, FileText, Wrench } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function EditMaintenancePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    vehicle_id: '',
    yearly_cost: '',
    recorded_date: '',
    source: '',
  });

  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    if (!id || id === 'undefined') {
      alert('Invalid maintenance record ID');
      setLoading(false);
      return;
    }

    Promise.all([
      fetchMaintenanceData(),
      fetchVehicles()
    ]).then(() => {
      setLoading(false);
    });
  }, [id]);

  const fetchMaintenanceData = async () => {
    try {
      console.log('Fetching maintenance record with ID:', id);
      const response = await axios.get(`${API_BASE}/maintenance-costs/${id}`);
      console.log('Maintenance data:', response.data);

      setFormData({
        vehicle_id: response.data.vehicle_id?.toString() || '',
        yearly_cost: response.data.yearly_cost?.toString() || '',
        recorded_date: response.data.recorded_date || '',
        source: response.data.source || '',
      });
    } catch (error) {
      console.error('Error fetching maintenance record:', error);
      alert('Failed to load maintenance record');
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_BASE}/vehicles/`);
      setVehicles(response.data);
      console.log('✓ Vehicles loaded:', response.data.length);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const payload = {
      vehicle_id: parseInt(formData.vehicle_id),
      yearly_cost: parseFloat(formData.yearly_cost),
      recorded_date: formData.recorded_date,
      source: formData.source,
    };

    console.log('Updating maintenance record with payload:', payload);

    try {
      const response = await axios.put(`${API_BASE}/maintenance-costs/${id}`, payload);

      if (response.status === 200) {
        alert('Maintenance record updated successfully!');
        router.push('/admin/catalog/maintenance');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        'Error updating maintenance record';
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading maintenance record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link href="/admin/catalog/maintenance">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Maintenance Records
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
                <h1 className="text-3xl font-bold">Edit Maintenance Record</h1>
                <p className="text-orange-100 mt-1">Update maintenance cost data (ID: {id})</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Vehicle Dropdown */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Car className="w-4 h-4 text-orange-600" />
                Vehicle <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle: any) => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    Vehicle #{vehicle.vehicle_id} - {vehicle.model_name || 'Unknown Model'}
                  </option>
                ))}
              </select>
            </div>

            {/* Yearly Cost Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <DollarSign className="w-4 h-4 text-orange-600" />
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Recorded Date Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-orange-600" />
                Recorded Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="recorded_date"
                value={formData.recorded_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Source Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 text-orange-600" />
                Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Preview Section */}
            {formData.vehicle_id && formData.yearly_cost && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <h4 className="font-semibold text-orange-900 mb-2">📋 Updated Record Preview</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-orange-800">
                    <span className="font-medium">Vehicle:</span> #{formData.vehicle_id}
                  </div>
                  <div className="text-orange-800">
                    <span className="font-medium">Cost:</span> Rs. {parseFloat(formData.yearly_cost).toLocaleString()}
                  </div>
                  <div className="text-orange-800">
                    <span className="font-medium">Date:</span> {formData.recorded_date}
                  </div>
                  <div className="text-orange-800">
                    <span className="font-medium">Source:</span> {formData.source}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Update Record
                  </>
                )}
              </button>
              <Link href="/admin/catalog/maintenance" className="flex-1">
                <button
                  type="button"
                  disabled={isUpdating}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-semibold disabled:opacity-50"
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
            <li>• Changes will update the maintenance cost record</li>
            <li>• Ensure all information is accurate</li>
            <li>• All fields are required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}