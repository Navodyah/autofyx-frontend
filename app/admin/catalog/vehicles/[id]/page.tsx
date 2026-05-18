'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Save, Calendar, Zap, Fuel, Settings,
  Tag, Droplet, Gauge, CircleDot, FileText, Car, AlertCircle
} from 'lucide-react';

export default function EditVehiclePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state - matches new page structure
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

  // Dropdown options state
  const [brands, setBrands] = useState<any[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<any[]>([]);
  const [engineTypes, setEngineTypes] = useState<any[]>([]);
  const [fuelTypes, setFuelTypes] = useState<any[]>([]);
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [oilQualities, setOilQualities] = useState<any[]>([]);

  // Error tracking
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!id || id === 'undefined') {
      alert('Invalid vehicle ID');
      setLoading(false);
      return;
    }

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
      console.log('Vehicle data received:', response.data);

      // FIXED: Properly map model_name from response
      setFormData({
        brand_id: response.data.brand_id?.toString() || '',
        model_name: response.data.model_name || response.data.vehicle_model || '',
        engine_size: response.data.engine_size?.toString() || '',
        minimum_price: response.data.minimum_price?.toString() || '',
        max_price: response.data.max_price?.toString() || '',
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

      // Debug log to verify model_name was loaded
      console.log('✓ Form data populated:', {
        brand_id: response.data.brand_id,
        model_name: response.data.model_name || response.data.vehicle_model,
        engine_size: response.data.engine_size
      });
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      alert('Failed to load vehicle data');
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/brands/');
      setBrands(response.data);
      console.log('✓ Brands loaded:', response.data.length);
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
      console.log('✓ Vehicle Classes loaded:', response.data.length);
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
        console.log('✓ Engine Types loaded from:', endpoint);
        return;
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status);
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
      console.log('✓ Fuel Types loaded:', response.data.length);
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
        console.log('✓ Transmissions loaded from:', endpoint);
        return;
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status);
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
        console.log('✓ Oil Qualities loaded from:', endpoint);
        return;
      } catch (error: any) {
        console.error(`✗ Failed to fetch from ${endpoint}:`, error.response?.status);
      }
    }

    console.error('✗ All oil quality endpoints failed');
    setOilQualities([]);
    setFetchErrors(prev => [...prev, 'Oil Qualities']);
  };

  const fetchDropdownData = async () => {
    setFetchErrors([]);

    await Promise.all([
      fetchBrands(),
      fetchVehicleClasses(),
      fetchEngineTypes(),
      fetchFuelTypes(),
      fetchTransmissions(),
      fetchOilQualities(),
    ]);

    console.log('✓ All dropdown data loaded');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    // FIXED: Send model_name directly to backend
    const payload = {
      brand_id: parseInt(formData.brand_id),
      model_name: formData.model_name, // CHANGED: Send as model_name (not vehicle_model)
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

    console.log('Updating vehicle with payload:', payload);

    try {
      const response = await axios.put(`http://127.0.0.1:8000/vehicles/${id}`, payload);

      if (response.status === 200) {
        alert('Vehicle Updated Successfully!');
        router.push('/admin/catalog/vehicles');
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/admin/catalog/vehicles">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
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
                  Please check your backend API endpoints or refresh the page.
                </p>
                <button
                  onClick={fetchDropdownData}
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
              {/* Brand Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tag className="w-4 h-4 text-orange-600" />
                  Vehicle Brand <span className="text-red-500">*</span>
                </label>
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  required
                  disabled={brands.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
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

              {/* Vehicle Model Name - FIXED */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Car className="w-4 h-4 text-orange-600" />
                  Vehicle Model Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Civic, Corolla, Accord"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">
                  Current: {formData.model_name || 'Not loaded yet'}
                </p>
              </div>

              {/* Engine Size */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Zap className="w-4 h-4 text-orange-600" />
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Engine displacement in liters</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-orange-600" />
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Lowest market price for this vehicle</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Gauge className="w-4 h-4 text-orange-600" />
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">Highest market price for this vehicle</p>
              </div>

              {/* Vehicle Class */}
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
                  disabled={vehicleClasses.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
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
                  <Zap className="w-4 h-4 text-orange-600" />
                  Engine Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="engine_type_id"
                  value={formData.engine_type_id}
                  onChange={handleChange}
                  required
                  disabled={engineTypes.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
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
                  <Fuel className="w-4 h-4 text-orange-600" />
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="fuel_type_id"
                  value={formData.fuel_type_id}
                  onChange={handleChange}
                  required
                  disabled={fuelTypes.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
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
                  <Settings className="w-4 h-4 text-orange-600" />
                  Transmission <span className="text-red-500">*</span>
                </label>
                <select
                  name="transmission_id"
                  value={formData.transmission_id}
                  onChange={handleChange}
                  required
                  disabled={transmissions.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
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
                  <Droplet className="w-4 h-4 text-orange-600" />
                  Recommended Oil Quality <span className="text-red-500">*</span>
                </label>
                <select
                  name="oil_id"
                  value={formData.oil_id}
                  onChange={handleChange}
                  required
                  disabled={oilQualities.length === 0}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer disabled:bg-gray-100"
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
                <p className="text-xs text-gray-500">Format: Width/Aspect R Diameter</p>
              </div>

              {/* Manufacturing Year */}
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
                  placeholder="e.g. 2024"
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
                  placeholder="e.g. 18.5"
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
                  placeholder="e.g. 15.2"
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
                placeholder="Enter detailed vehicle description..."
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
              <Link href="/admin/catalog/vehicles" className="flex-1">
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

        {/* Debug Info Card - ENHANCED */}
        <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-orange-900 mb-3">🔍 Data Loading Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-3">
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
          <div className="pt-3 border-t border-orange-300">
            <p className="text-sm font-semibold text-orange-900 mb-2">📋 Current Vehicle Data:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-orange-800">
              <div>Brand ID: {formData.brand_id || 'Not loaded'}</div>
              <div className="font-bold">Model Name: {formData.model_name || 'Not loaded'}</div>
              <div>Engine: {formData.engine_size || 'Not loaded'}L</div>
              <div>Year: {formData.manufacturing_year || 'Not loaded'}</div>
            </div>
            <p className="text-xs text-orange-700 mt-3">
              Open browser console (F12) to see detailed API logs
            </p>
          </div>
        </div>

        {/* Warning Card */}
        <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-orange-900 mb-2">⚠️ Update Notice</h3>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Changes will be applied immediately to the vehicle registry</li>
            <li>• Ensure all information is accurate before updating</li>
            <li>• All required fields must be filled</li>
            <li>• Vehicle ID #{id} will be updated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
