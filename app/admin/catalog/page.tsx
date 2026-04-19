'use client';

import Link from 'next/link';
import { 
  Car, Tag, Layers, Fuel, Settings, Droplet, Gauge, ArrowRight, Sparkles 
} from 'lucide-react';

const catalogItems = [
  // Main Tables
  { title: 'Vehicles', count: '1,240', icon: Car, color: 'from-blue-600 to-blue-700', href: '/admin_dashboard/catalog/vehicles', description: 'Manage vehicle inventory' },
  { title: 'Brands', count: '15', icon: Tag, color: 'from-indigo-600 to-indigo-700', href: '/admin_dashboard/catalog/brands', description: 'Vehicle manufacturers' },
  { title: 'Models', count: '86', icon: Layers, color: 'from-violet-600 to-violet-700', href: '/admin_dashboard/catalog/models', description: 'Vehicle model variants' },
  
  // Specifications
  { title: 'Engine Types', count: '12', icon: Settings, color: 'from-slate-600 to-slate-700', href: '/admin_dashboard/catalog/engine-types', description: 'Engine configurations' },
  { title: 'Fuel Types', count: '5', icon: Fuel, color: 'from-orange-600 to-orange-700', href: '/admin_dashboard/catalog/FuelType', description: 'Available fuel options' },
  { title: 'Transmissions', count: '4', icon: Gauge, color: 'from-emerald-600 to-emerald-700', href: '/admin_dashboard/catalog/transmission', description: 'Transmission systems' },
  { title: 'Vehicle Classes', count: '8', icon: Car, color: 'from-cyan-600 to-cyan-700', href: '/admin_dashboard/catalog/vehicles_class', description: 'Vehicle categories' },
  { title: 'Oil Quality', count: '6', icon: Droplet, color: 'from-yellow-600 to-yellow-700', href: '/admin_dashboard/catalog/oil', description: 'Oil specifications' },
  { title: 'Maintenance Costs', count: '320', icon: Settings, color: 'from-pink-600 to-pink-700', href: '/admin_dashboard/catalog/maintenance', description: 'Vehicle maintenance records' },
];

export default function CatalogHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header Section */}
      <div className="mb-12 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Vehicle Catalog Management
            </h1>
            <p className="text-slate-600 mt-1 text-lg">
              Centralized hub for managing your entire vehicle database ecosystem
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Vehicles', value: '1,240', color: 'text-blue-600' },
          { label: 'Active Brands', value: '15', color: 'text-indigo-600' },
          { label: 'Model Variants', value: '86', color: 'text-violet-600' },
          { label: 'Configurations', value: '35', color: 'text-cyan-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/50 shadow-sm">
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {catalogItems.map((item, index) => (
          <Link 
            key={item.title} 
            href={item.href}
            className="group relative bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/50 hover:border-transparent hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
            
            {/* Glow Effect */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${item.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <item.icon className="text-white" size={32} />
              </div>

              {/* Text */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text transition-all duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {item.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.count}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">records</span>
                </div>
                
                <div className="w-10 h-10 bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-indigo-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <ArrowRight className="text-slate-400 group-hover:text-white transition-colors duration-300" size={20} />
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute top-4 right-4 w-20 h-20 border-2 border-slate-100 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700" />
          </Link>
        ))}
      </div>

      {/* Bottom Info Card */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Need help managing your catalog?</h3>
            <p className="text-blue-100">Access documentation and best practices for vehicle data management</p>
          </div>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg">
            View Guide
          </button>
        </div>
      </div>
    </div>
  );
}