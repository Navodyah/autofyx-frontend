"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Filter, Download, Loader2 } from 'lucide-react';

interface EngineType {
  engine_type_id: number;
  engine_type_name: string;
  cylinders: number;
}

export default function EngineTypesList() {
  const [engineTypes, setEngineTypes] = useState<EngineType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<EngineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEngineTypes();
  }, []);

  useEffect(() => {
    const filtered = engineTypes.filter(type =>
      type.engine_type_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTypes(filtered);
  }, [searchTerm, engineTypes]);

  const fetchEngineTypes = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/engine-types/');
      setEngineTypes(response.data);
      setFilteredTypes(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this engine type?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/engine-types/${id}`);
        setEngineTypes(engineTypes.filter(e => e.engine_type_id !== id));
      } catch (error) {
        alert('Failed to delete engine type');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Engine Types</h1>
              <p className="text-slate-600">Manage vehicle engine configurations</p>
            </div>
            <Link href="/admin/catalog/engine-types/new">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
                <Plus size={20} /> Add Engine Type
              </button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search engine types..."
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-colors">
              <Filter size={18} /> Filter
            </button>
            <button className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-colors">
              <Download size={18} /> Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm font-medium mb-1">Total Engine Types</p>
            <p className="text-4xl font-bold">{engineTypes.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-emerald-100 text-sm font-medium mb-1">Most Common</p>
            <p className="text-2xl font-bold">Inline 4</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-purple-100 text-sm font-medium mb-1">Average Cylinders</p>
            <p className="text-4xl font-bold">
              {engineTypes.length > 0 ? (engineTypes.reduce((sum, e) => sum + e.cylinders, 0) / engineTypes.length).toFixed(1) : 0}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Engine Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cylinders</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTypes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No engine types found
                      </td>
                    </tr>
                  ) : (
                    filteredTypes.map((type) => (
                      <tr key={type.engine_type_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            #{type.engine_type_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">{type.engine_type_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            {type.cylinders} Cylinders
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin/catalog/engine-types/${type.engine_type_id}`}>
                              <button className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors shadow-sm hover:shadow">
                                <Edit size={18} />
                              </button>
                            </Link>
                            <button
                              onClick={() => handleDelete(type.engine_type_id)}
                              className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors shadow-sm hover:shadow"
                            >
                              <Trash2 size={18} />
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