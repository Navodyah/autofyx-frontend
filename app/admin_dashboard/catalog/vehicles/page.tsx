'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Car, Calendar, Fuel, Zap, Package } from 'lucide-react';

interface Vehicle {
  vehicle_id: number;
  model_id?: number;
  class_id?: number;
  engine_type_id?: number;
  fuel_type_id?: number;
  transmission_id?: number;
  manufacturing_year?: number;

  // Enriched display fields
  model_name?: string | null;
  class_name?: string | null;
  engine_type_name?: string | null;
  fuel_type_name?: string | null;
  transmission_name?: string | null;
}

const API_BASE = 'http://127.0.0.1:8000';

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const buildMap = (arr: any[], idKey: string, nameKey: string) => {
    const map: Record<number, string> = {};
    arr.forEach((it) => {
      if (it && it[idKey] != null) {
        map[it[idKey]] = it[nameKey];
      }
    });
    return map;
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('Fetching all vehicle data...');
      
      const [
        vehiclesRes,
        modelsRes,
        classesRes,
        enginesRes,
        fuelsRes,
        transmissionsRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/vehicles/`),
        axios.get(`${API_BASE}/models/`),
        axios.get(`${API_BASE}/vehicle_classes/`),
        // CORRECTED: Changed 'engine_types' to 'engine-types' to match your backend
        axios.get(`${API_BASE}/engine-types/`), 
        axios.get(`${API_BASE}/fuel_types/`),
        axios.get(`${API_BASE}/transmissions/`),
      ]);

      console.log('Data fetched successfully');

      const vehiclesData = vehiclesRes.data as any[];
      const models = modelsRes.data as any[];
      const classes = classesRes.data as any[];
      const engines = enginesRes.data as any[];
      const fuels = fuelsRes.data as any[];
      const transmissions = transmissionsRes.data as any[];

      const modelsMap = buildMap(models, 'model_id', 'model_name');
      const classesMap = buildMap(classes, 'class_id', 'class_name');
      const enginesMap = buildMap(engines, 'engine_type_id', 'engine_type_name');
      const fuelsMap = buildMap(fuels, 'fuel_type_id', 'fuel_type_name');
      const transmissionsMap = buildMap(transmissions, 'transmission_id', 'transmission_name');

      const enriched = vehiclesData.map((v) => ({
        ...v,
        model_name: v.model?.model_name ?? modelsMap[v.model_id] ?? 'Unknown',
        class_name: v.vehicle_class?.class_name ?? classesMap[v.class_id] ?? 'Unknown',
        engine_type_name: v.engine_type?.engine_type_name ?? enginesMap[v.engine_type_id] ?? 'Unknown',
        fuel_type_name: v.fuel_type?.fuel_type_name ?? fuelsMap[v.fuel_type_id] ?? 'Unknown',
        transmission_name:
          v.transmission?.transmission_name ?? transmissionsMap[v.transmission_id] ?? 'Unknown',
      })) as Vehicle[];

      setVehicles(enriched);
    } catch (error) {
      console.error('Failed to fetch vehicles or reference data:', error);
      // Data load wune nathi unath, thiyena vehicles tika hari pennanna try karamu (optional)
      setVehicles([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await axios.delete(`${API_BASE}/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.vehicle_id !== id));
      alert('Vehicle deleted successfully!');
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      alert('Failed to delete vehicle');
    }
  };

  const term = searchTerm.trim().toLowerCase();
  const filteredVehicles = vehicles.filter((v) => {
    if (!term) return true;
    const matchesId = v.vehicle_id?.toString().includes(term);
    const matchesModel = v.model_name?.toLowerCase().includes(term);
    const matchesClass = v.class_name?.toLowerCase().includes(term);
    const matchesEngine = v.engine_type_name?.toLowerCase().includes(term);
    const matchesFuel = v.fuel_type_name?.toLowerCase().includes(term);
    return !!(matchesId || matchesModel || matchesClass || matchesEngine || matchesFuel);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Car className="w-10 h-10 text-blue-600" />
                Vehicle Registry Management
              </h1>
              <p className="text-gray-500 mt-2">Comprehensive vehicle catalog and specifications</p>
            </div>
            <Link href="/admin_dashboard/catalog/vehicles/new">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="w-5 h-5" />
                Register New Vehicle
              </button>
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Model, Class, Engine, Fuel or Vehicle ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Vehicles</p>
                <p className="text-3xl font-bold mt-1">{vehicles.length}</p>
              </div>
              <Car className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Search Results</p>
                <p className="text-3xl font-bold mt-1">{filteredVehicles.length}</p>
              </div>
              <Search className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Vehicle Models</p>
                <p className="text-3xl font-bold mt-1">
                  {new Set(vehicles.map((v) => v.model_name).filter(Boolean)).size}
                </p>
              </div>
              <Package className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Engine & Fuel</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">No vehicles found</p>
                        <p className="text-sm mt-2">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.vehicle_id} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            #{vehicle.vehicle_id}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                              <Car className="text-white w-6 h-6" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-blue-600">
                                {vehicle.model_name || 'Unknown Model'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {vehicle.class_name || 'N/A'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <div className="text-xs text-gray-900 font-medium">
                              {vehicle.engine_type_name || 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Fuel className="w-4 h-4 text-green-500" />
                            <div className="text-xs text-gray-500">
                              {vehicle.fuel_type_name || 'N/A'}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-700">{vehicle.manufacturing_year}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin_dashboard/catalog/vehicles/${vehicle.vehicle_id}`}>
                              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                            </Link>
                            <button onClick={() => handleDelete(vehicle.vehicle_id)} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}