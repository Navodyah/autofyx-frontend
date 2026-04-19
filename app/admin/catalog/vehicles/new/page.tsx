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
  
  // Form state with NEW fields
  const [formData, setFormData] = useState({
    brand_id: '',
    model_name: '',
    engine_size: '',
    minimum_price: '',
    max_price: '',
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

  // Dropdown options state with NEW brands
  const [brands, setBrands] = useState<any[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<any[]>([]);
  const [engineTypes, setEngineTypes] = useState<any[]>([]);
  const [fuelTypes, setFuelTypes] = useState<any[]>([]);
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [oilQualities, setOilQualities] = useState<any[]>([]);

  // Error tracking
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchAllDropdownData();
  }, []);

  // NEW: Fetch Brands
  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/brands/');
      setBrands(response.data);
      console.log('✓ Brands loaded:', response.data.length, response.data);
    } catch (error: any) {
      console.error('✗ Failed to fetch brands:', error.response?.status, error.message);
      setBrands([]);
      setFetchErrors(prev => [...prev, 'Brands']);
    }
  };

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
        return;
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status, error.message);
      }
    }

    console.error('✗ All engine type endpoints failed');
    setEngineTypes([]);
    setFetchErrors(prev => [...prev, 'Engine Types']);
  };

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
        return;
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status, error.message);
      }
    }

    console.error('✗ All transmission endpoints failed');
    setTransmissions([]);
    setFetchErrors(prev => [...prev, 'Transmissions']);
  };

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
        return;
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status, error.message);
      }
    }

    console.error('✗ All oil quality endpoints failed');
    setOilQualities([]);
    setFetchErrors(prev => [...prev, 'Oil Qualities']);
  };

  const fetchAllDropdownData = async () => {
    setDataLoading(true);
    setFetchErrors([]);
    
    await Promise.all([
      fetchBrands(),
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

    const payload = {
      brand_id: parseInt(formData.brand_id),
      vehicle_model: formData.model_name,
      engine_size: parseFloat(formData.engine_size),
      minimum_price: parseFloat(formData.minimum_price),
      max_price: parseFloat(formData.max_price),
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

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading form data...</p>
          <p className="mt-2 text-gray-500 text-sm">Fetching brands,  classes, engines, and more...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin_dashboard/catalog/vehicles">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Vehicle Registry
          </button>
        </Link>

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
                  Please check your backend API endpoints or refresh the page.
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

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Register New Vehicle</h1>
                <p className="text-blue-100 mt-1">Add a new vehicle with complete specifications</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NEW: Brand Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Vehicle Brand <span className="text-red-500">*</span>
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  required
                  disabled={brands.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {brands.length === 0 ? 'No brands available - Check API' : 'Select Brand'}
                  </option>
                  {brands.map((brand: any) => (
                    <option key={brand.brand_id} value={brand.brand_id}>
                      {brand.brand_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {brands.length > 0 ? `${brands.length} brands available` : '❌ No data loaded'}
                </p>
              </div>

          

              {/* NEW: Vehicle Model */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Car className="w-4 h-4 text-blue-600" />
                  Vehicle Model Variant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. EX, LX, Sport"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Model variant or trim</p>
              </div>

              {/* NEW: Engine Size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Engine Size (Liters) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="engine_size"
                  value={formData.engine_size}
                  onChange={handleChange}
                  required
                  min="0.5"
                  max="10"
                  placeholder="e.g. 1.8, 2.0, 3.5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Engine displacement in liters</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  Minimum Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="minimum_price"
                  value={formData.minimum_price}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 4500000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Lowest market price for this vehicle</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  Maximum Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="max_price"
                  value={formData.max_price}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 5200000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Highest market price for this vehicle</p>
              </div>

            

              {/* Vehicle Class */}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    {vehicleClasses.length === 0 ? 'No classes available' : 'Select Class'}
                  </option>
                  {vehicleClasses.map((cls: any) => (
                    <option key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {vehicleClasses.length > 0 ? `${vehicleClasses.length} classes available` : '❌ No data'}
                </p>
              </div>

              {/* Engine Type */}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    {engineTypes.length === 0 ? 'No engine types available' : 'Select Engine Type'}
                  </option>
                  {engineTypes.map((engine: any) => (
                    <option key={engine.engine_type_id} value={engine.engine_type_id}>
                      {engine.engine_type_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {engineTypes.length > 0 ? `${engineTypes.length} types available` : '❌ No data'}
                </p>
              </div>

              {/* Fuel Type */}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    {fuelTypes.length === 0 ? 'No fuel types available' : 'Select Fuel Type'}
                  </option>
                  {fuelTypes.map((fuel: any) => (
                    <option key={fuel.fuel_type_id} value={fuel.fuel_type_id}>
                      {fuel.fuel_type_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {fuelTypes.length > 0 ? `${fuelTypes.length} fuels available` : '❌ No data'}
                </p>
              </div>

              {/* Transmission */}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    {transmissions.length === 0 ? 'No transmissions available' : 'Select Transmission'}
                  </option>
                  {transmissions.map((trans: any) => (
                    <option key={trans.transmission_id} value={trans.transmission_id}>
                      {trans.transmission_name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {transmissions.length > 0 ? `${transmissions.length} available` : '❌ No data'}
                </p>
              </div>

              {/* Oil Quality */}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
                >
                  <option value="" disabled>
                    {oilQualities.length === 0 ? 'No oil qualities available' : 'Select Oil Quality'}
                  </option>
                  {oilQualities.map((oil: any) => (
                    <option key={oil.oil_id} value={oil.oil_id}>
                      {oil.oil_grade}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  {oilQualities.length > 0 ? `${oilQualities.length} grades available` : '❌ No data'}
                </p>
              </div>

              {/* Tyre Size */}
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
                  placeholder="e.g. 205/55R16"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Format: Width/Aspect R Diameter</p>
              </div>

              {/* Manufacturing Year */}
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
              </div>

              {/* Fuel Efficiency Highway */}
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
              </div>

              {/* Fuel Efficiency Combined */}
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
              </div>
            </div>

            {/* Description */}
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
                placeholder="Enter detailed vehicle description..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
              />
            </div>

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
                    Registering...
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

        {/* Debug Info */}
        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">🔍 Data Loading Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className={brands.length > 0 ? 'text-green-700' : 'text-red-700 font-semibold'}>
              {brands.length > 0 ? '✓' : '✗'} Brands: {brands.length}
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
              {transmissions.length > 0 ? '✓' : '✗'} Trans: {transmissions.length}
            </div>
            <div className={oilQualities.length > 0 ? 'text-green-700' : 'text-red-700 font-semibold'}>
              {oilQualities.length > 0 ? '✓' : '✗'} Oils: {oilQualities.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
