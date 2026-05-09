'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Save, Car, Calendar, Building2 } from 'lucide-react';

interface Brand {
  brand_id: number;
  brand_name: string;
}

interface ModelFormProps {
  initialData?: {
    model_id: number;
    model_name: string;
    start_year: number;
    end_year: number;
    brand_id: number;
  };
  isEdit: boolean;
}

export default function ModelForm({ initialData, isEdit }: ModelFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const [formData, setFormData] = useState({
    model_name: initialData?.model_name || '',
    start_year: initialData?.start_year || '',
    end_year: initialData?.end_year || '',
    brand_id: initialData?.brand_id || '',
  });

  useEffect(() => {
    // GET available brands with axios
    axios.get('http://127.0.0.1:8000/models/available-brands')
      .then((response) => {
        setBrands(response.data);
        setLoadingBrands(false);
      })
      .catch((error) => {
        console.error('Error fetching brands:', error);
        alert('Failed to load brands');
        setLoadingBrands(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (parseInt(formData.start_year as string) > parseInt(formData.end_year as string)) {
      alert('Start year must be before or equal to end year');
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit && initialData) {
        // PUT request with axios - Update model
        const response = await axios.put(
          `http://127.0.0.1:8000/models/${initialData.model_id}`,
          {
            brand_id: parseInt(formData.brand_id as string),
            model_name: formData.model_name,
            start_year: parseInt(formData.start_year as string),
            end_year: parseInt(formData.end_year as string),
          }
        );

        if (response.status === 200) {
          alert('Model updated successfully!');
          router.push('/admin/catalog/models');
        }
      } else {
        // POST request with axios - Create new model
        const response = await axios.post(
          'http://127.0.0.1:8000/models/',
          {
            brand_id: parseInt(formData.brand_id as string),
            model_name: formData.model_name,
            start_year: parseInt(formData.start_year as string),
            end_year: parseInt(formData.end_year as string),
          }
        );

        if (response.status === 201) {
          alert('Model added successfully!');
          router.push('/admin/catalog/models');
        }
      }
    } catch (error: any) {
      console.error('Error saving model:', error);

      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data.detail || 'Error saving model';
        alert(errorMessage);
      } else if (error.request) {
        // Request made but no response
        alert('No response from server. Please check your connection.');
      } else {
        // Something else happened
        alert('Error saving model');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Model Name */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Car className="w-4 h-4 text-blue-600" />
          Model Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.model_name}
          onChange={(e) => handleChange('model_name', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="Ex: Civic, Camry, Model S"
        />
      </div>

      {/* Brand Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Building2 className="w-4 h-4 text-blue-600" />
          Brand <span className="text-red-500">*</span>
        </label>
        {loadingBrands ? (
          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Loading brands...
            </div>
          </div>
        ) : (
          <select
            required
            value={formData.brand_id}
            onChange={(e) => handleChange('brand_id', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          >
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand.brand_id} value={brand.brand_id}>
                {brand.brand_name}
              </option>
            ))}
          </select>
        )}
        {brands.length === 0 && !loadingBrands && (
          <p className="text-sm text-amber-600">⚠️ No brands available. Please add brands first.</p>
        )}
      </div>

      {/* Start Year */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Calendar className="w-4 h-4 text-blue-600" />
          Start Year <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          required
          min="1900"
          max="2100"
          value={formData.start_year}
          onChange={(e) => handleChange('start_year', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="Ex: 2020"
        />
      </div>

      {/* End Year */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Calendar className="w-4 h-4 text-blue-600" />
          End Year <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          required
          min="1900"
          max="2100"
          value={formData.end_year}
          onChange={(e) => handleChange('end_year', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
          placeholder="Ex: 2024"
        />
      </div>

      {/* Year Range Indicator */}
      {formData.start_year && formData.end_year && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            📅 Production Period: {' '}
            <span className="font-semibold">
              {formData.start_year} - {formData.end_year}
            </span>
            {' '}({parseInt(formData.end_year as string) - parseInt(formData.start_year as string) + 1} years)
          </p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading || loadingBrands || brands.length === 0}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {isEdit ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEdit ? 'Update Model' : 'Save Model'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/catalog/models')}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}