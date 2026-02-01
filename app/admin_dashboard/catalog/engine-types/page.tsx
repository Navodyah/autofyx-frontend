"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Cog, Gauge, Cylinder } from 'lucide-react';

interface EngineType {
  engine_type_id: number;
  engine_type_name: string;
  cylinders: number;
  engine_size: number;
}

export default function EngineTypesList() {
  const [engineTypes, setEngineTypes] = useState<EngineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEngineTypes();
  }, []);

  const fetchEngineTypes = async () => {
    try {
      // GET request with axios
      const response = await axios.get('http://127.0.0.1:8000/engine-types/');
      setEngineTypes(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching engine types:", error);
      setEngineTypes([]);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this Engine Type?')) {
      try {
        // DELETE request with axios
        await axios.delete(`http://127.0.0.1:8000/engine-types/${id}`);
        setEngineTypes(engineTypes.filter((item) => item.engine_type_id !== id));
        alert('Engine Type deleted successfully!');
      } catch (error) {
        console.error("Failed to delete:", error);
        alert("Failed to delete engine type");
      }
    }
  };

  const filteredData = engineTypes.filter((item) =>
    item.engine_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Cog className="w-10 h-10 text-blue-600" />
                Engine Types Management
              </h1>
              <p className="text-gray-500 mt-2">Manage vehicle engine specifications</p>
            </div>
            <Link href="/admin_dashboard/catalog/engine-types/new">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="w-5 h-5" />
                Add New Engine Type
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
              placeholder="Search engine types by name..."
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
                <p className="text-blue-100 text-sm">Total Engine Types</p>
                <p className="text-3xl font-bold mt-1">{engineTypes.length}</p>
              </div>
              <Cog className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Search Results</p>
                <p className="text-3xl font-bold mt-1">{filteredData.length}</p>
              </div>
              <Search className="w-12 h-12 opacity-80" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Cylinders</p>
                <p className="text-3xl font-bold mt-1">
                  {engineTypes.length > 0 
                    ? (engineTypes.reduce((sum, e) => sum + e.cylinders, 0) / engineTypes.length).toFixed(1)
                    : 0}
                </p>
              </div>
              <Cylinder className="w-12 h-12 opacity-80" />
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Engine Type Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cylinders
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Engine Size (L)
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <Cog className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">No engine types found</p>
                        <p className="text-sm mt-2">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((type) => (
                      <tr 
                        key={type.engine_type_id}
                        className="hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            #{type.engine_type_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                              <Cog className="text-white w-6 h-6" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {type.engine_type_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-700">
                            <Cylinder className="w-4 h-4 mr-2 text-gray-400" />
                            {type.cylinders} Cylinders
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-700">
                            <Gauge className="w-4 h-4 mr-2 text-gray-400" />
                            {type.engine_size} L
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin_dashboard/catalog/engine-types/${type.engine_type_id}`}>
                              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(type.engine_type_id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
                            >
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