'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Plus, Pencil, Trash2, Search, Wrench, Calendar, DollarSign, FileText } from 'lucide-react';

interface MaintenanceRecord {
  record_id: number;
  vehicle_id: number;
  yearly_cost: number;
  recorded_date: string;
  source?: string;
}

const API_BASE = 'http://127.0.0.1:8000';

export default function MaintenanceListPage() {
  const [data, setData] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/maintenance-costs/`);
      setData(response.data);
      console.log('✓ Maintenance records loaded:', response.data.length);
    } catch (error) {
      console.error('Failed to fetch maintenance records:', error);
      alert('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/maintenance-costs/${id}`);
      setData(data.filter((item) => item.record_id !== id));
      alert('Maintenance record deleted successfully!');
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete maintenance record');
    }
  };

  // Filter by Vehicle ID or Source
  const filteredData = data.filter((item) =>
    item.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle_id.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <Wrench className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Maintenance Records</h1>
                <p className="text-gray-600 mt-1">Manage vehicle maintenance cost data</p>
              </div>
            </div>
            <Link 
              href="/admin_dashboard/catalog/maintenance/new" 
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} /> Add Record
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Source or Vehicle ID..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {filteredData.length} record(s) found {searchTerm && `matching "${searchTerm}"`}
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                <tr>
                  <th className="p-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Record ID
                    </div>
                  </th>
                  <th className="p-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Wrench size={16} />
                      Vehicle ID
                    </div>
                  </th>
                  <th className="p-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      Yearly Cost
                    </div>
                  </th>
                  <th className="p-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Date
                    </div>
                  </th>
                  <th className="p-4 font-semibold">Source</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
                        <p className="mt-4 text-gray-600 font-semibold">Loading maintenance records...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="text-gray-500">
                        <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">No maintenance records found</p>
                        <p className="text-sm mt-2">
                          {searchTerm ? 'Try adjusting your search' : 'Add your first maintenance record to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.record_id} className="hover:bg-green-50 border-b transition-colors">
                      <td className="p-4 font-semibold text-green-700">#{item.record_id}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold">
                          <Wrench size={14} />
                          Vehicle #{item.vehicle_id}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-green-700 text-lg">
                          Rs. {item.yearly_cost?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{item.recorded_date || 'N/A'}</td>
                      <td className="p-4">
                        <span className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-lg">
                          {item.source || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/admin_dashboard/catalog/maintenance/${item.record_id}`} 
                            className="text-blue-600 bg-blue-100 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(item.record_id)} 
                            className="text-red-600 bg-red-100 p-2 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete"
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
        </div>

        {/* Summary Card */}
        {!loading && filteredData.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl shadow-xl p-6">
            <h3 className="font-semibold text-green-900 mb-3">📊 Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-green-700">{filteredData.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-sm text-gray-600">Total Yearly Cost</p>
                <p className="text-2xl font-bold text-green-700">
                  Rs. {filteredData.reduce((sum, item) => sum + (item.yearly_cost || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <p className="text-sm text-gray-600">Average Cost</p>
                <p className="text-2xl font-bold text-green-700">
                  Rs. {Math.round(filteredData.reduce((sum, item) => sum + (item.yearly_cost || 0), 0) / filteredData.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}