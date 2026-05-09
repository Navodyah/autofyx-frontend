'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Save, Car, Calendar, Zap, Fuel, Settings, Tag } from 'lucide-react';

interface VehicleFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function VehicleForm({ initialData, isEdit = false }: VehicleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    model_id: initialData?.model_id || '',
    class_id: initialData?.class_id || '',
    engine_type_id: initialData?.engine_type_id || '',
    fuel_type_id: initialData?.fuel_type_id || '',
    transmission_id: initialData?.transmission_id || '',
    oil_id: initialData?.oil_id || '',
    manufacturing_year: initialData?.manufacturing_year || '',
  });

  // Dropdown options
  const [models, setModels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [engineTypes, setEngineTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [oilQualities, setOilQualities] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [modelsRes, classesRes, engineRes, fuelRes, transRes, oilRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/models/'),
        axios.get('http://127.0.0.1:8000/vehicle_classes/'),
        axios.get('http://127.0.0.1:8000/engine_types/'),
        axios.get('http://127.0.0.1:8000/fuel_types/'),
        axios.get('http://127.0.0.1:8000/transmissions/'),
        axios.get('http://127.0.0.1:8000/oil_quality/')
      ]);

      setModels(modelsRes.data);
      setClasses(classesRes.data);
      setEngineTypes(engineRes.data);
      setFuelTypes(fuelRes.data);
      setTransmissions(transRes.data);
      setOilQualities(oilRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      model_id: parseInt(formData.model_id),
      class_id: parseInt(formData.class_id),
      engine_type_id: parseInt(formData.engine_type_id),
      fuel_type_id: parseInt(formData.fuel_type_id),
      transmission_id: parseInt(formData.transmission_id),
      oil_id: parseInt(formData.oil_id),
      manufacturing_year: parseInt(formData.manufacturing_year),
    };

    try {
      if (isEdit) {
        // PUT request with axios
        const response = await axios.put(
          `http://127.0.0.1:8000/vehicles/${initialData.vehicle_id}`,
          payload
        );

        if (response.status === 200) {
          alert("Vehicle Updated Successfully!");
          router.push('/admin/catalog/vehicles');
        }
      } else {
        // POST request with axios
        const response = await axios.post('http://127.0.0.1:8000/vehicles/', payload);

        if (response.status === 200 || response.status === 201) {
          alert("Vehicle Registered Successfully!");
          router.push('/admin/catalog/vehicles');
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
      {/* Model */}
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
        >
          <option value="" disabled>Select Model</option>
          {models.map((model: any) => (
            <option key={model.model_id} value={model.model_id}>
              {model.model_name}
            </option>
          ))}
        </select>
      </div>

      {/* Class */}
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
        >
          <option value="" disabled>Select Class</option>
          {classes.map((cls: any) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </option>
          ))}
        </select>
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
        >
          <option value="" disabled>Select Engine Type</option>
          {engineTypes.map((engine: any) => (
            <option key={engine.engine_type_id} value={engine.engine_type_id}>
              {engine.engine_type_name}
            </option>
          ))}
        </select>
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
        >
          <option value="" disabled>Select Fuel Type</option>
          {fuelTypes.map((fuel: any) => (
            <option key={fuel.fuel_type_id} value={fuel.fuel_type_id}>
              {fuel.fuel_type_name}
            </option>
          ))}
        </select>
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
        >
          <option value="" disabled>Select Transmission</option>
          {transmissions.map((trans: any) => (
            <option key={trans.transmission_id} value={trans.transmission_id}>
              {trans.transmission_name}
            </option>
          ))}
        </select>
      </div>

      {/* Oil Quality */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Fuel className="w-4 h-4 text-blue-600" />
          Oil Quality <span className="text-red-500">*</span>
        </label>
        <select
          name="oil_id"
          value={formData.oil_id}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
        >
          <option value="" disabled>Select Oil Quality</option>
          {oilQualities.map((oil: any) => (
            <option key={oil.oil_id} value={oil.oil_id}>
              {oil.oil_grade}
            </option>
          ))}
        </select>
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

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {isEdit ? 'Updating...' : 'Registering...'}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEdit ? 'Update Vehicle' : 'Register Vehicle'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}