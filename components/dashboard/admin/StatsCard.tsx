import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string; // e.g., "+12% from last month"
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const gradients = {
  blue: 'from-blue-500 to-blue-700',
  purple: 'from-purple-500 to-purple-700',
  green: 'from-emerald-500 to-emerald-700',
  orange: 'from-orange-500 to-orange-700',
};

const StatsCard = ({ title, value, icon: Icon, trend, color }: StatsCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          {trend && <p className="text-xs text-green-600 mt-2 font-semibold flex items-center gap-1">
             ▲ {trend}
          </p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
      </div>
      
      {/* Background Decoration */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${gradients[color]} blur-2xl`} />
    </div>
  );
};

export default StatsCard;