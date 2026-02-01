
import Sidebar from '@/components/dashboard/admin/Sidebar'; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-72 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}