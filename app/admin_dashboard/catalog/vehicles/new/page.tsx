'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { 
  ArrowLeft, Car, Save, Calendar, Zap, Fuel, Settings, 
  Tag, Droplet, Gauge, CircleDot, FileText, AlertCircle 
} from 'lucide-react';

export default function NewVehiclePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Form state with all required fields
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

  // Error tracking
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchAllDropdownData();
  }, []);

  // Separate async function for Models
  const fetchModels = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/models/');
      setModels(response.data);
      console.log('✓ Models loaded:', response.data.length, response.data);
    } catch (error: any) {
      console.error('✗ Failed to fetch models:', error.response?.status, error.message);
      setModels([]);
      setFetchErrors(prev => [...prev, 'Models']);
    }
  };

  // Separate async function for Vehicle Classes
  const fetchVehicleClasses = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/vehicle_classes/');
      setVehicleClasses(response.data);
      console.log('✓ Vehicle Classes loaded:', response.data.length, response.data);
    } catch (error: any) {
      console.error('✗ Failed to fetch vehicle classes:', error.response?.status, error.message);
      setVehicleClasses([]);
      setFetchErrors(prev => [...prev, 'Vehicle Classes']);
    }
  };

  // Separate async function for Engine Types with multiple endpoint attempts
  const fetchEngineTypes = async () => {
    const endpoints = [
      'http://127.0.0.1:8000/engine_types/',
      'http://127.0.0.1:8000/engine-types/',
      'http://127.0.0.1:8000/enginetypes/',
      'http://127.0.0.1:8000/engines/',
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying engine types endpoint: ${endpoint}`);
        const response = await axios.get(endpoint);
        setEngineTypes(response.data);
        console.log('✓ Engine Types loaded from:', endpoint, response.data.length, response.data);
        return; // Success, exit function
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status, error.message);
      }
    }

    // If all endpoints failed
    console.error('✗ All engine type endpoints failed');
    setEngineTypes([]);
    setFetchErrors(prev => [...prev, 'Engine Types']);
  };

  // Separate async function for Fuel Types
  const fetchFuelTypes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/fuel_types/');
      setFuelTypes(response.data);
      console.log('✓ Fuel Types loaded:', response.data.length, response.data);
    } catch (error: any) {
      console.error('✗ Failed to fetch fuel types:', error.response?.status, error.message);
      setFuelTypes([]);
      setFetchErrors(prev => [...prev, 'Fuel Types']);
    }
  };

  // Separate async function for Transmissions with multiple endpoint attempts
  const fetchTransmissions = async () => {
    const endpoints = [
      'http://127.0.0.1:8000/transmissions/',
      'http://127.0.0.1:8000/transmission/',
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying transmissions endpoint: ${endpoint}`);
        const response = await axios.get(endpoint);
        setTransmissions(response.data);
        console.log('✓ Transmissions loaded from:', endpoint, response.data.length, response.data);
        return; // Success, exit function
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status, error.message);
      }
    }

    // If all endpoints failed
    console.error('✗ All transmission endpoints failed');
    setTransmissions([]);
    setFetchErrors(prev => [...prev, 'Transmissions']);
  };

  // Separate async function for Oil Qualities with multiple endpoint attempts
  const fetchOilQualities = async () => {
    const endpoints = [
      'http://127.0.0.1:8000/oil_quality/',
      'http://127.0.0.1:8000/oil_qualities/',
      'http://127.0.0.1:8000/oils/',
      'http://127.0.0.1:8000/oil-quality/',
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying oil quality endpoint: ${endpoint}`);
        const response = await axios.get(endpoint);
        setOilQualities(response.data);
        console.log('✓ Oil Qualities loaded from:', endpoint, response.data.length, response.data);
        return; // Success, exit function
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status, error.message);
      }
    }

    // If all endpoints failed
    console.error('✗ All oil quality endpoints failed');
    setOilQualities([]);
    setFetchErrors(prev => [...prev, 'Oil Qualities']);
  };

  // Call all fetch functions
  const fetchAllDropdownData = async () => {
    setDataLoading(true);
    setFetchErrors([]); // Reset errors
    
    // Call all fetch functions in parallel
    await Promise.all([
      fetchModels(),
      fetchVehicleClasses(),
      fetchEngineTypes(),
      fetchFuelTypes(),
      fetchTransmissions(),
      fetchOilQualities(),
    ]);

    setDataLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Convert string inputs to appropriate types
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

    console.log('Submitting payload:', payload);

    try {
      // POST request with axios
      const response = await axios.post('http://127.0.0.1:8000/vehicles/', payload);

      if (response.status === 200 || response.status === 201) {
        alert("Vehicle Registered Successfully!");
        router.push('/admin_dashboard/catalog/vehicles');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.detail || 
                          JSON.stringify(error.response?.data) || 
                          "Error registering vehicle";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while fetching dropdown data
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading form data...</p>
          <p className="mt-2 text-gray-500 text-sm">Fetching models, classes, engines, and more...</p>
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

        {/* Error Alert */}
        {fetchErrors.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">⚠️ Data Loading Issues</h3>
                <p className="text-sm text-red-800 mb-2">
                  Failed to load: {fetchErrors.join(', ')}
                </p>
                <p className="text-xs text-red-700">
                  Please check your backend API endpoints or refresh the page. Check browser console (F12) for details.
                </p>
                <button
                  onClick={fetchAllDropdownData}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Retry Loading Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Register New Vehicle</h1>
                <p className="text-blue-100 mt-1">Add a new vehicle to the registry with complete specifications</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Car className="w-4 h-4 text-blue-600" />
                  Vehicle Model <span className="text-red-500">*</span>
                </label>
                <select
                  name="model_id"
                  value={formData.model_id}
                  onChange={handleChange}
                  required
                  disabled={models.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {models.length === 0 ? 'No models available - Check API' : 'Select Model'}
                  </option>
                  {models.map((model: any) => (
                    <option key={model.model_id} value={model.model_id}>
                      {model.model_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {models.length > 0 ? `${models.length} models available` : '❌ No data loaded'}
                </p>
              </div>

              {/* Vehicle Class Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Vehicle Class <span className="text-red-500">*</span>
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  required
                  disabled={vehicleClasses.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {vehicleClasses.length === 0 ? 'No classes available - Check API' : 'Select Class'}
                  </option>
                  {vehicleClasses.map((cls: any) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {vehicleClasses.length > 0 ? `${vehicleClasses.length} classes available` : '❌ No data loaded'}
                </p>
              </div>

              {/* Engine Type Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Engine Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="engine_type_id"
                  value={formData.engine_type_id}
                  onChange={handleChange}
                  required
                  disabled={engineTypes.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {engineTypes.length === 0 ? 'No engine types available - Check API' : 'Select Engine Type'}
                  </option>
                  {engineTypes.map((engine: any) => (
                    <option key={engine.engine_type_id} value={engine.engine_type_id}>
                      {engine.engine_type_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {engineTypes.length > 0 ? `${engineTypes.length} engine types available` : '❌ No data loaded - Check console'}
                </p>
              </div>

              {/* Fuel Type Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Fuel className="w-4 h-4 text-blue-600" />
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="fuel_type_id"
                  value={formData.fuel_type_id}
                  onChange={handleChange}
                  required
                  disabled={fuelTypes.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {fuelTypes.length === 0 ? 'No fuel types available - Check API' : 'Select Fuel Type'}
                  </option>
                  {fuelTypes.map((fuel: any) => (
                    <option key={fuel.fuel_type_id} value={fuel.fuel_type_id}>
                      {fuel.fuel_type_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {fuelTypes.length > 0 ? `${fuelTypes.length} fuel types available` : '❌ No data loaded'}
                </p>
              </div>

              {/* Transmission Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Settings className="w-4 h-4 text-blue-600" />
                  Transmission <span className="text-red-500">*</span>
                </label>
                <select
                  name="transmission_id"
                  value={formData.transmission_id}
                  onChange={handleChange}
                  required
                  disabled={transmissions.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {transmissions.length === 0 ? 'No transmissions available - Check API' : 'Select Transmission'}
                  </option>
                  {transmissions.map((trans: any) => (
                    <option key={trans.transmission_id} value={trans.transmission_id}>
                      {trans.transmission_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {transmissions.length > 0 ? `${transmissions.length} transmissions available` : '❌ No data loaded'}
                </p>
              </div>

              {/* Oil Quality Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  Recommended Oil Quality <span className="text-red-500">*</span>
                </label>
                <select
                  name="oil_id"
                  value={formData.oil_id}
                  onChange={handleChange}
                  required
                  disabled={oilQualities.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {oilQualities.length === 0 ? 'No oil qualities available - Check API' : 'Select Oil Quality'}
                  </option>
                  {oilQualities.map((oil: any) => (
                    <option key={oil.oil_id} value={oil.oil_id}>
                      {oil.oil_grade}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {oilQualities.length > 0 ? `${oilQualities.length} oil grades available` : '❌ No data loaded'}
                </p>
              </div>

              {/* Tyre Size Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CircleDot className="w-4 h-4 text-blue-600" />
                  Tyre Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tyre_size"
                  value={formData.tyre_size}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 205/55R16, 225/45R17"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Format: Width/Aspect Ratio R Diameter</p>
              </div>

              {/* Manufacturing Year Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-600" />
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
                  placeholder="e.g. 2024"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Year: 1900 - {new Date().getFullYear() + 1}</p>
              </div>

              {/* Fuel Efficiency Highway Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-blue-600" />
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
                  placeholder="e.g. 18.5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Highway fuel consumption rate</p>
              </div>

              {/* Fuel Efficiency Combined Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-blue-600" />
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
                  placeholder="e.g. 15.2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Combined city/highway consumption</p>
              </div>
            </div>

            {/* Description Textarea - Full Width */}
            <div className="space-y-2 mt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 text-blue-600" />
                Vehicle Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Enter detailed vehicle description, features, and specifications..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
              />
              <p className="text-xs text-gray-500">Provide comprehensive vehicle information</p>
            </div>

            {/* Preview Section */}
            {formData.model_id && formData.manufacturing_year && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Summary Preview
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="text-blue-800">
                    <span className="font-medium">Model:</span> {models.find(m => m.model_id === parseInt(formData.model_id))?.model_name || 'N/A'}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Class:</span> {vehicleClasses.find(c => c.class_id === parseInt(formData.class_id))?.class_name || 'N/A'}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Year:</span> {formData.manufacturing_year}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Engine:</span> {engineTypes.find(e => e.engine_type_id === parseInt(formData.engine_type_id))?.engine_type_name || 'N/A'}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Fuel:</span> {fuelTypes.find(f => f.fuel_type_id === parseInt(formData.fuel_type_id))?.fuel_type_name || 'N/A'}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Transmission:</span> {transmissions.find(t => t.transmission_id === parseInt(formData.transmission_id))?.transmission_name || 'N/A'}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Tyre Size:</span> {formData.tyre_size || 'N/A'}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Highway:</span> {formData.fuel_efficiency_highway ? `${formData.fuel_efficiency_highway} km/L` : 'N/A'}
                  </div>
                  <div className="text-blue-800">
                    <span className="font-medium">Combined:</span> {formData.fuel_efficiency_combined ? `${formData.fuel_efficiency_combined} km/L` : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Registering Vehicle...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Register Vehicle
                  </>
                )}
              </button>
              <Link href="/admin_dashboard/catalog/vehicles" className="flex-1">
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

        {/* Debug Info Card */}
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">🔍 Data Loading Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div className={models.length > 0 ? 'text-green-700' : 'text-red-700 font-semibold'}>
              {models.length > 0 ? '✓' : '✗'} Models: {models.length}
            </div>
            <div className={vehicleClasses.length > 0 ? 'text-green-700' : 'text-red-700 font-semibold'}>
              {vehicleClasses.length > 0 ? '✓' : '✗'} Classes: {vehicleClasses.length}
            </div>
            <div className={engineTypes.length > 0 ? 'text-green-700' : 'text-red-700 font-semibold'}>
              {engineTypes.length > 0 ? '✓' : '✗'} Engines: {engineTypes.length}
            </div>
            <div className={fuelTypes.length > 0 ? 'text-green-700' : 'text-red-700 font-semibold'}>
              {fuelTypes.length > 0 ? '✓' : '✗'} Fuels: {fuelTypes.length}
            </div>
            <div className={transmissions.length > 0 ? 'text-green-700' : 'text-red-700 font-semibold'}>
              {transmissions.length > 0 ? '✓' : '✗'} Transmissions: {transmissions.length}
            </div>
            <div className={oilQualities.length > 0 ? 'text-green-700' : 'text-red-700 font-semibold'}>
              {oilQualities.length > 0 ? '✓' : '✗'} Oils: {oilQualities.length}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-yellow-300">
            <p className="text-xs text-yellow-800">
              Open browser console (F12) to see detailed API request logs
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Registration Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All fields marked with <span className="text-red-500">*</span> are required</li>
            <li>• Ensure fuel efficiency values are realistic (typically 5-30 km/L)</li>
            <li>• Tyre size format: Width/Aspect Ratio R Diameter (e.g., 205/55R16)</li>
            <li>• Manufacturing year must be between 1900 and {new Date().getFullYear() + 1}</li>
            <li>• Provide detailed description including features and specifications</li>
            <li>• Double-check all selections before submitting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}