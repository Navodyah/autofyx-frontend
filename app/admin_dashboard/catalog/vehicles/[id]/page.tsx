'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Save, Calendar, Zap, Fuel, Settings, 
  Tag, Droplet, Gauge, CircleDot, FileText, Car 
} from 'lucide-react';

export default function EditVehiclePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    model_id: '',
    class_id: '',
    engine_type_id: '',
    fuel_type_id: '',
    transmission_id: '',
    oil_id: '',
    tyre_size: '',
    manufacturing_year: '',
    fuel_efficiency_highway: '',
    fuel_efficiency_combined: '',
    description: '',
  });

  // Dropdown options state
  const [models, setModels] = useState<any[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<any[]>([]);
  const [engineTypes, setEngineTypes] = useState<any[]>([]);
  const [fuelTypes, setFuelTypes] = useState<any[]>([]);
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [oilQualities, setOilQualities] = useState<any[]>([]);

  useEffect(() => {
    if (!id || id === 'undefined') {
      alert('Invalid vehicle ID');
      setLoading(false);
      return;
    }

    // Fetch all data
    Promise.all([
      fetchVehicleData(),
      fetchDropdownData()
    ]).then(() => {
      setLoading(false);
    });
  }, [id]);

  const fetchVehicleData = async () => {
    try {
      console.log('Fetching vehicle with ID:', id);
      const response = await axios.get(`http://127.0.0.1:8000/vehicles/${id}`);
      console.log('Vehicle data:', response.data);
      
      // Populate form with existing data
      setFormData({
        model_id: response.data.model_id?.toString() || '',
        class_id: response.data.class_id?.toString() || '',
        engine_type_id: response.data.engine_type_id?.toString() || '',
        fuel_type_id: response.data.fuel_type_id?.toString() || '',
        transmission_id: response.data.transmission_id?.toString() || '',
        oil_id: response.data.oil_id?.toString() || '',
        tyre_size: response.data.tyre_size || '',
        manufacturing_year: response.data.manufacturing_year?.toString() || '',
        fuel_efficiency_highway: response.data.fuel_efficiency_highway?.toString() || '',
        fuel_efficiency_combined: response.data.fuel_efficiency_combined?.toString() || '',
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      alert('Failed to load vehicle data');
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [modelsRes, classesRes, enginesRes, fuelsRes, transRes, oilsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/models/'),
        axios.get('http://127.0.0.1:8000/vehicle_classes/'),
        axios.get('http://127.0.0.1:8000/engine-types/'),
        axios.get('http://127.0.0.1:8000/fuel_types/'),
        axios.get('http://127.0.0.1:8000/transmissions/'),
        axios.get('http://127.0.0.1:8000/oil_quality/')
      ]);

      setModels(modelsRes.data);
      setVehicleClasses(classesRes.data);
      setEngineTypes(enginesRes.data);
      setFuelTypes(fuelsRes.data);
      setTransmissions(transRes.data);
      setOilQualities(oilsRes.data);
      
      console.log('✓ All dropdown data loaded');
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const payload = {
      model_id: parseInt(formData.model_id),
      class_id: parseInt(formData.class_id),
      engine_type_id: parseInt(formData.engine_type_id),
      fuel_type_id: parseInt(formData.fuel_type_id),
      transmission_id: parseInt(formData.transmission_id),
      oil_id: parseInt(formData.oil_id),
      tyre_size: formData.tyre_size,
      manufacturing_year: parseInt(formData.manufacturing_year),
      fuel_efficiency_highway: parseFloat(formData.fuel_efficiency_highway),
      fuel_efficiency_combined: parseFloat(formData.fuel_efficiency_combined),
      description: formData.description,
    };

    console.log('Updating vehicle with payload:', payload);

    try {
      const response = await axios.put(`http://127.0.0.1:8000/vehicles/${id}`, payload);
      
      if (response.status === 200) {
        alert('Vehicle Updated Successfully!');
        router.push('/admin_dashboard/catalog/vehicles');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.detail || 
                          JSON.stringify(error.response?.data) || 
                          'Error updating vehicle';
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
          <p className="mt-4 text-gray-600 font-semibold">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/admin_dashboard/catalog/vehicles">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Vehicle Registry
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
                <h1 className="text-3xl font-bold">Edit Vehicle</h1>
                <p className="text-orange-100 mt-1">Update vehicle information (ID: {id})</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Car className="w-4 h-4 text-orange-600" />
                  Vehicle Model <span className="text-red-500">*</span>
                </label>
                <select
                  name="model_id"
                  value={formData.model_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select Model</option>
                  {models.map((model: any) => (
                    <option key={model.model_id} value={model.model_id}>
                      {model.model_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Class Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tag className="w-4 h-4 text-orange-600" />
                  Vehicle Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select Class</option>
                  {vehicleClasses.map((cls: any) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Engine Type Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Zap className="w-4 h-4 text-orange-600" />
                  Engine Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="engine_type_id"
                  value={formData.engine_type_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select Engine Type</option>
                  {engineTypes.map((engine: any) => (
                    <option key={engine.engine_type_id} value={engine.engine_type_id}>
                      {engine.engine_type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel Type Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Fuel className="w-4 h-4 text-orange-600" />
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="fuel_type_id"
                  value={formData.fuel_type_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select Fuel Type</option>
                  {fuelTypes.map((fuel: any) => (
                    <option key={fuel.fuel_type_id} value={fuel.fuel_type_id}>
                      {fuel.fuel_type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transmission Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Settings className="w-4 h-4 text-orange-600" />
                  Transmission <span className="text-red-500">*</span>
                </label>
                <select
                  name="transmission_id"
                  value={formData.transmission_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select Transmission</option>
                  {transmissions.map((trans: any) => (
                    <option key={trans.transmission_id} value={trans.transmission_id}>
                      {trans.transmission_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Oil Quality Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Droplet className="w-4 h-4 text-orange-600" />
                  Recommended Oil Quality <span className="text-red-500">*</span>
                </label>
                <select
                  name="oil_id"
                  value={formData.oil_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="">Select Oil Quality</option>
                  {oilQualities.map((oil: any) => (
                    <option key={oil.oil_id} value={oil.oil_id}>
                      {oil.oil_grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tyre Size Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CircleDot className="w-4 h-4 text-orange-600" />
                  Tyre Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tyre_size"
                  value={formData.tyre_size}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 205/55R16"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Manufacturing Year Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  Manufacturing Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="manufacturing_year"
                  value={formData.manufacturing_year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Fuel Efficiency Highway */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-orange-600" />
                  Fuel Efficiency - Highway (km/L) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="fuel_efficiency_highway"
                  value={formData.fuel_efficiency_highway}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Fuel Efficiency Combined */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-orange-600" />
                  Fuel Efficiency - Combined (km/L) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="fuel_efficiency_combined"
                  value={formData.fuel_efficiency_combined}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="space-y-2 mt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 text-orange-600" />
                Vehicle Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
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
                    Update Vehicle
                  </>
                )}
              </button>
              <Link href="/admin_dashboard/catalog/vehicles" className="flex-1">
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
            <li>• Changes will affect vehicle specifications in the registry</li>
            <li>• Ensure all information is accurate before updating</li>
            <li>• All required fields must be filled</li>
          </ul>
        </div>
      </div>
    </div>
  );
}