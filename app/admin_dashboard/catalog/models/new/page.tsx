'use client';
import ModelForm from '@/components/forms/modelform';
import { ArrowLeft, Car } from 'lucide-react';
import Link from 'next/link';

export default function NewModelPage() {
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-3 rounded-xl">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Add New Vehicle Model</h1>
                <p className="text-blue-100 mt-1">Create a new vehicle model</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <ModelForm isEdit={false} />
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All fields are required</li>
            <li>• Select the correct brand for the model</li>
            <li>• Start year must be before end year</li>
          </ul>
        </div>
      </div>
    </div>
  );
}