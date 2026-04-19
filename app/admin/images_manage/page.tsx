'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/lib/api';
import { Image as ImageIcon, RefreshCcw, Search, Trash2, Upload } from 'lucide-react';

type VehicleRow = {
  vehicle_id: number;
  model_name?: string | null;
  vehicle_model?: string | null;
  manufacturing_year?: number | null;
  image_url?: string | null;
  brand_id?: number | null;
  brand?: {
    brand_name?: string | null;
  } | null;
};

export default function AdminImageManagementPage() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [brands, setBrands] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehiclesResponse, brandsResponse] = await Promise.all([
        axios.get<VehicleRow[]>(`${API_BASE}/vehicles/`),
        axios.get<Array<{ brand_id: number; brand_name: string }>>(`${API_BASE}/brands/`),
      ]);

      const brandLookup = Object.fromEntries(
        (brandsResponse.data || []).map((brand) => [brand.brand_id, brand.brand_name])
      );

      setBrands(brandLookup);
      const response = vehiclesResponse;
      setVehicles(Array.isArray(response.data) ? response.data : []);
    } catch {
      setVehicles([]);
      setBrands({});
      setError('Failed to load vehicles. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vehicles;

    return vehicles.filter((vehicle) => {
      const vehicleName = (vehicle.brand?.brand_name ?? '').toLowerCase();
      const modelName = (vehicle.model_name ?? vehicle.vehicle_model ?? '').toLowerCase();
      const year = String(vehicle.manufacturing_year ?? '');
      const id = String(vehicle.vehicle_id);
      return (
        vehicleName.includes(term) ||
        modelName.includes(term) ||
        year.includes(term) ||
        id.includes(term)
      );
    });
  }, [vehicles, search]);

  const uploadImage = async (vehicleId: number, method: 'post' | 'put') => {
    const file = selectedFiles[vehicleId];
    if (!file) {
      alert('Choose an image file first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setSavingId(vehicleId);
    try {
      await axios.request({
        url: `${API_BASE}/admin/vehicle-images/${vehicleId}/upload`,
        method,
        data: formData,
      });
      setSelectedFiles((current) => ({ ...current, [vehicleId]: null }));
      await fetchVehicles();
      alert('Image stored in Cloudflare R2 and linked to the vehicle.');
    } catch (uploadError: any) {
      const message = uploadError?.response?.data?.detail || 'Failed to upload image.';
      alert(message);
    } finally {
      setSavingId(null);
    }
  };

  const deleteImage = async (vehicleId: number) => {
    const confirmed = window.confirm('Delete the stored image for this vehicle?');
    if (!confirmed) return;

    setSavingId(vehicleId);
    try {
      await axios.delete(`${API_BASE}/admin/vehicle-images/${vehicleId}`);
      setSelectedFiles((current) => ({ ...current, [vehicleId]: null }));
      await fetchVehicles();
      alert('Image deleted successfully.');
    } catch (deleteError: any) {
      const message = deleteError?.response?.data?.detail || 'Failed to delete image.';
      alert(message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Admin Images</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Vehicle image manager</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Upload images to Cloudflare R2, store the public URL on the matching vehicle row, and replace or delete
                them later from the same screen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void fetchVehicles()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              disabled={loading || savingId !== null}
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Vehicle image records</h2>
              <p className="text-sm text-slate-500">Display vehicle name, model, year, preview, and upload controls.</p>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by vehicle name, model, year, or ID"
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500"
              />
            </div>
          </div>

          {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
              Loading vehicles...
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Vehicle</th>
                      <th className="px-4 py-3 font-medium">Model</th>
                      <th className="px-4 py-3 font-medium">Year</th>
                      <th className="px-4 py-3 font-medium">Image preview</th>
                      <th className="px-4 py-3 font-medium">Upload</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVehicles.map((vehicle) => {
                      const modelName = vehicle.model_name ?? vehicle.vehicle_model ?? 'Unknown model';
                      const vehicleName = vehicle.brand?.brand_name ?? (vehicle.brand_id ? brands[vehicle.brand_id] : null) ?? 'Unknown vehicle';
                      const imageUrl = vehicle.image_url ?? '';
                      const selectedFile = selectedFiles[vehicle.vehicle_id];
                      const isSaving = savingId === vehicle.vehicle_id;

                      return (
                        <tr key={vehicle.vehicle_id} className="align-top">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-900">{vehicleName}</div>
                            <div className="text-xs text-slate-500">Vehicle ID: {vehicle.vehicle_id}</div>
                          </td>
                          <td className="px-4 py-4 text-slate-700">{modelName}</td>
                          <td className="px-4 py-4 text-slate-700">{vehicle.manufacturing_year ?? 'N/A'}</td>
                          <td className="px-4 py-4">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={`${vehicleName} ${modelName}`}
                                className="h-20 w-28 rounded-xl border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-20 w-28 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files?.[0] ?? null;
                                  setSelectedFiles((current) => ({ ...current, [vehicle.vehicle_id]: file }));
                                }}
                                className="block w-full max-w-xs text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
                              />
                              {selectedFile && (
                                <p className="text-xs text-slate-500">Selected: {selectedFile.name}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => void uploadImage(vehicle.vehicle_id, imageUrl ? 'put' : 'post')}
                                disabled={isSaving}
                                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Upload className="h-3.5 w-3.5" /> {imageUrl ? 'Replace' : 'Add'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteImage(vehicle.vehicle_id)}
                                disabled={isSaving || !imageUrl}
                                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredVehicles.length === 0 && (
                <div className="border-t border-slate-200 p-6 text-sm text-slate-500">No vehicles match your search.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
