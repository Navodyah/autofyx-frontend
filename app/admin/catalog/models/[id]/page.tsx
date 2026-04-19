'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ModelForm from '@/components/forms/modelform';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditModelPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if id exists before making request
    if (!id || id === 'undefined') {
      console.error('Invalid ID:', id);
      alert('Invalid model ID');
      setLoading(false);
      return;
    }

    // GET request with axios
    axios.get(`http://127.0.0.1:8000/models/${id}`)
      .then((response) => {
        console.log('Model data fetched:', response.data);
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching model:', error);
        if (error.response?.status === 404) {
          alert('Model not found');
        } else if (error.response?.status === 422) {
          alert('Invalid model ID format');
        } else {
          alert('Error loading model');
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading model details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Model Not Found</h2>
          <p className="text-gray-600 mb-6">The model you're looking for doesn't exist.</p>
          <Link href="/admin_dashboard/catalog/models">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
              Back to Models
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin_dashboard/catalog/models">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Models
          </button>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Edit className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Edit Model</h1>
                <p className="text-orange-100 mt-1">Update model information (ID: {id})</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <ModelForm initialData={data} isEdit={true} />
          </div>
        </div>

        <div className="mt-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <h3 className="font-semibold text-orange-900 mb-2">⚠️ Note</h3>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Changes will affect all related records</li>
            <li>• Ensure start year is before or equal to end year</li>
            <li>• Brand selection is required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}