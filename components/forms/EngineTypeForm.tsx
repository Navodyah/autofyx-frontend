'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EngineFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function EngineTypeForm({ initialData, isEdit = false }: EngineFormProps) {
  const router = useRouter();

  // Form States
  const [name, setName] = useState(initialData?.engine_type_name || '');
  const [cylinders, setCylinders] = useState(initialData?.cylinders || '');
  const [size, setSize] = useState(initialData?.engine_size || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      engine_type_name: name,
      cylinders: parseInt(cylinders),
      engine_size: parseFloat(size), 
    };

    try {
      
      const url = isEdit
        ? `http://127.0.0.1:8000/engine_types/${initialData.engine_type_id}`
        : 'http://127.0.0.1:8000/engine_types/';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isEdit ? "Updated Successfully!" : "Created Successfully!");
        router.push('/admin/engine-types');
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
      
      {/* Engine Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Engine Type Name</label>
        <input
          type="text"
          placeholder="e.g. V6 Turbo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Cylinders */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cylinders</label>
          <input
            type="number"
            value={cylinders}
            onChange={(e) => setCylinders(e.target.value)}
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Engine Size (cc or Liters) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Engine Size (L)</label>
          <input
            type="number"
            step="0.1" 
            value={size}
            onChange={(e) => setSize(e.target.value)}
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {isEdit ? 'Update Engine Type' : 'Create Engine Type'}
      </button>
    </form>
  );
}