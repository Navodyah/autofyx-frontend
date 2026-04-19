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
  { label: "My Garage", href: "/dashboard/garage", icon: Heart },
  { label: "Preferences", href: "/dashboard/profile", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div suppressHydrationWarning className="flex h-screen bg-[#f4f6f9] text-slate-900 font-sans overflow-hidden">
      <UserPreferenceOnboardingModal />

      {/* ── Desktop Sidebar (black) ──────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 xl:w-72 flex-col bg-[#0a0a0c] z-20 flex-shrink-0">

        {/* Logo */}
        <div className="h-[72px] flex items-center px-7 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">AutoFyx</span>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-md"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-slate-700" : "text-white/50"}`} />
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-4 py-5 border-t border-white/5 flex-shrink-0">
          <button
            suppressHydrationWarning
            onClick={() => router.push("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Top Header */}
        <header className="h-[72px] bg-white border-b border-slate-200/80 flex items-center justify-between px-6 lg:px-8 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">

            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button suppressHydrationWarning variant="ghost" size="icon" className="lg:hidden text-slate-600">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-[#0a0a0c] border-r-0">
                <SheetHeader className="px-6 py-5 border-b border-white/5">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">AutoFyx</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="px-4 py-4 space-y-1">
                  {navItems.map((item) => (
                    <SheetClose asChild key={`mobile-${item.href}-${item.label}`}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          pathname === item.href
                            ? "bg-white text-slate-900"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Search bar */}
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 w-80 xl:w-96 focus-within:border-slate-400 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <Input
                suppressHydrationWarning
                type="text"
                placeholder="Search models, brands, features..."
                className="bg-transparent border-none shadow-none outline-none text-sm h-5 w-full text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 p-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell */}
            <Button suppressHydrationWarning variant="ghost" size="icon" className="relative w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-900 rounded-full border-2 border-white" />
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer group">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-900 group-hover:text-slate-600 transition-colors leading-tight">Alex Driver</span>
                <span className="text-xs text-slate-400">Premium Member</span>
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#f4f6f9]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
