'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VehicleItem {
  vehicle_id: number;
  model: { model_name: string }; // Backend eken model name ekka enawa nam
}

interface MaintenanceFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function MaintenanceForm({ initialData, isEdit = false }: MaintenanceFormProps) {
  const router = useRouter();

  // Dropdown Data
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);

  // Form States
  const [vehicleId, setVehicleId] = useState(initialData?.vehicle_id || '');
  const [cost, setCost] = useState(initialData?.yearly_cost || '');
  const [date, setDate] = useState(initialData?.recorded_date || '');
  const [source, setSource] = useState(initialData?.source || '');

  // Fetch Vehicles for Dropdown
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch('http://127.0.0.1:8000/vehicles/');
        const data = await res.json();
        setVehicles(data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    }
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      vehicle_id: parseInt(vehicleId),
      yearly_cost: parseFloat(cost),
      recorded_date: date, // YYYY-MM-DD format
      source: source,
    };

    try {
      // API Endpoint (Backend eke 'maintenance_costs' nam)
      const url = isEdit
        ? `http://127.0.0.1:8000/maintenance_costs/${initialData.record_id}`
        : 'http://127.0.0.1:8000/maintenance_costs/';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isEdit ? "Record Updated!" : "Record Added!");
        router.push('/admin/maintenance');
        router.refresh();
      } else {
        alert("Operation failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow border border-gray-200 max-w-lg">

      {/* Vehicle Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          required
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Vehicle by ID --</option>
          {vehicles.map((v) => (
            <option key={v.vehicle_id} value={v.vehicle_id}>
              Vehicle #{v.vehicle_id} {v.model ? `- ${v.model.model_name}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Yearly Cost */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Cost (LKR)</label>
        <input
          type="number"
          step="0.01"
          placeholder="e.g. 45000.00"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Recorded Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recorded Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source / Reference</label>
        <input
          type="text"
          placeholder="e.g. Service Station Bill, Owner Manual"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {isEdit ? 'Update Record' : 'Add Record'}
      </button>
    </form>
  );
}