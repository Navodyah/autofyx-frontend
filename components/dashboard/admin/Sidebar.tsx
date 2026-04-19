'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Database, Users, BrainCircuit, Car, ChevronDown 
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx'; // Install this if needed: npm install clsx

const Sidebar = () => {
  const pathname = usePathname();
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);

  // Helper for active styles
  const navItemClass = (path: string) => clsx(
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
    pathname === path 
      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
      : "text-slate-400 hover:bg-slate-800 hover:text-white"
  );

  return (
    <aside className="w-72 bg-slate-950 text-white h-screen flex flex-col border-r border-slate-800 fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-8 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            AutoFyx
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Overview</p>
        
        <Link href="/admin_dashboard" className={navItemClass('/admin')}>
          <LayoutDashboard size={20} /> <span className="font-medium">Dashboard</span>
        </Link>
        
        <Link href="/admin/ml-studio" className={navItemClass('/admin/ml-studio')}>
          <BrainCircuit size={20} /> <span className="font-medium">ML Studio</span>
        </Link>

        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2">Management</p>

        <Link href="/admin/users" className={navItemClass('/admin/users')}>
          <Users size={20} /> <span className="font-medium">Users</span>
        </Link>

        {/* Inventory Dropdown */}
        <div>
          <Link href="/admin_dashboard/catalog">
            <button 
              onClick={() => setIsInventoryOpen(!isInventoryOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              <span className="flex items-center gap-3"><Database size={20} /> <span className="font-medium">Catalog</span></span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isInventoryOpen ? 'rotate-180' : ''}`} />
            </button>
          </Link>

          <div className={`overflow-hidden transition-all duration-300 ${isInventoryOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-4 pl-4 border-l border-slate-800 mt-1 space-y-1">
              {[
                { name: 'Vehicles', href: '/admin_dashboard/catalog/vehicles' },
                { name: 'Brands', href: '/admin_dashboard/catalog/brands' },
                { name: 'Models', href: '/admin_dashboard/catalog/models' },
                { name: 'Engine Types', href: '/admin_dashboard/catalog/engine-types' },
                { name: 'Images', href: '/admin/images_manage' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className={`block px-4 py-2 text-sm rounded-lg transition-colors ${pathname.startsWith(item.href) ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-slate-300'}`}>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      {/* User Profile / Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">A</div>
           <div>
             <p className="text-sm font-medium text-white">Admin User</p>
             <p className="text-xs text-slate-500">admin@autofyx.com</p>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;