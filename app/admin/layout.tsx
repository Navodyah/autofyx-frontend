
'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-72 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}