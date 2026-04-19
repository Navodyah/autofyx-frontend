'use client';

import StatsCard from '@/components/dashboard/admin/StatsCard';
import { Car, Users, Activity, DollarSign, ArrowUpRight } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Mock Data for the Chart
const data = [
  { name: 'Jan', vehicles: 40 },
  { name: 'Feb', vehicles: 30 },
  { name: 'Mar', vehicles: 60 },
  { name: 'Apr', vehicles: 90 },
  { name: 'May', vehicles: 75 },
  { name: 'Jun', vehicles: 110 },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-2">Welcome back! Here is your system performance.</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-full border shadow-sm">
          Last updated: Today, 12:45 PM
        </div>
      </div>

      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Vehicles" value="1,245" icon={Car} color="blue" trend="12% vs last month" />
        <StatsCard title="Active Users" value="8,540" icon={Users} color="purple" trend="5% vs last week" />
        <StatsCard title="System Health" value="98.5%" icon={Activity} color="green" />
        <StatsCard title="Est. Value" value="$4.2M" icon={DollarSign} color="orange" trend="18% yearly" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Chart Section (Takes up 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Vehicle Registration Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="vehicles" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVehicles)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Recent Activity (Takes up 1 column) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
             <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Car size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">New Vehicle Added</p>
                  <p className="text-xs text-slate-500">Toyota Axio 2018 was added to the catalog.</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">2m ago</span>
              </div>
            ))}
             <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">New User Registered</p>
                  <p className="text-xs text-slate-500">Kasun Perera requested access.</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">1h ago</span>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}