'use client';

import {
  LayoutDashboard,
  Car,
  LineChart,
  SearchCheck,
  Scale,
  Calculator,
  User,
  Heart,
  Settings,
  Bell,
  Search,
  Menu,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import UserPreferenceOnboardingModal from "@/components/user-preference-onboarding-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Recommendation", href: "/dashboard/recomendation", icon: LineChart },
  { label: "Vehicle Search", href: "/dashboard/search", icon: SearchCheck },
  { label: "Compare", href: "/dashboard/compare", icon: Scale },
  { label: "Cost Calculation", href: "/dashboard/cost-calculation", icon: Calculator },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "My Garage (Wishlist)", href: "/dashboard/garage", icon: Heart },
  { label: "Preferences", href: "/dashboard/profile", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div suppressHydrationWarning className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      <UserPreferenceOnboardingModal />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600">
            <Car className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight text-slate-900">AutoFyx</span>
          </div>
        </div>
        
        <div className="px-6 py-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <Button suppressHydrationWarning onClick={() => router.push("/")} variant="ghost" className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  suppressHydrationWarning
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-3/4 max-w-sm bg-white p-0">
                <SheetHeader className="px-6 py-6 border-b border-slate-100">
                  <SheetTitle className="flex items-center gap-2 text-blue-600">
                    <Car className="w-6 h-6" />
                    <span className="text-xl font-bold tracking-tight text-slate-900">AutoFyx</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="px-4 py-4 space-y-2">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold ${
                          pathname === item.href ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center bg-slate-100 px-4 py-2.5 rounded-full w-96 border border-slate-200 focus-within:bg-white focus-within:border-blue-300 transition-all shadow-inner relative">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <Input
                suppressHydrationWarning
                type="text" 
                placeholder="Search models, brands, or features..." 
                className="bg-transparent border-none shadow-none outline-none text-sm h-7 w-full text-slate-800 placeholder:text-slate-400 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button suppressHydrationWarning variant="ghost" size="icon" className="relative rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Alex Driver</span>
                <span className="text-xs text-slate-500">Premium Member</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Children Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
