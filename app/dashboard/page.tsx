'use client';

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowUpRight,
  BatteryCharging,
  CarFront,
  Gauge,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Trophy,
  Activity,
  History,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  LineChart,
  SearchCheck,
  Scale,
  Calculator,
  User,
  Heart,
  ArrowRight
} from "lucide-react";

function DashboardOverview() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 16 } }
  };

  const modules = [
    { title: "Recommendation", href: "/dashboard/recomendation", desc: "AI-ranked vehicle suggestions", icon: LineChart, accent: "bg-violet-500" },
    { title: "Vehicle Search", href: "/dashboard/search", desc: "Manual vehicle filtering", icon: SearchCheck, accent: "bg-blue-500" },
    { title: "Compare", href: "/dashboard/compare", desc: "Side-by-side specs", icon: Scale, accent: "bg-cyan-500" },
    { title: "Cost Calculation", href: "/dashboard/cost-calculation", desc: "EMI and ownership cost", icon: Calculator, accent: "bg-amber-500" },
    { title: "Profile", href: "/dashboard/profile", desc: "Personal and preference settings", icon: User, accent: "bg-emerald-500" },
    { title: "My Garage", href: "/dashboard/garage", desc: "Saved vehicles & wishlist", icon: Heart, accent: "bg-rose-500" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 tracking-widest uppercase">System Active</span>
          </div>
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Your personalized vehicle intelligence and market analytics.</p>
        </div>
        <div className="flex gap-2.5 flex-shrink-0">
          <Button variant="outline" className="rounded-xl text-sm font-semibold gap-2 border-slate-200 shadow-sm text-slate-600">
            <History className="w-4 h-4" />
            History
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold gap-2 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Update Preferences
          </Button>
        </div>
      </motion.div>

      {/* Quick Access Module Grid */}
      <motion.div variants={itemVariants}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Access</p>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col gap-3"
            >
              <div className={`w-9 h-9 rounded-xl ${mod.accent} flex items-center justify-center flex-shrink-0`}>
                <mod.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">{mod.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{mod.desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all mt-auto" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Analyzed Models", value: "854", sub: "+12 this week", icon: CarFront, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Saved Matches", value: "3", sub: "1 high confidence", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Market Trend", value: "-2.4%", sub: "Prices dropping", icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Active Alerts", value: "2", sub: "Price drop detected", icon: BellIcon, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                  {stat.sub}
                </span>
              </div>
              <h3 className="text-2xl xl:text-3xl font-bold text-slate-900">{stat.value}</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wide">{stat.label}</p>
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} opacity-60 blur-2xl pointer-events-none`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: Hero Match + Chart */}
        <div className="xl:col-span-2 space-y-6">

          {/* Hero Vehicle Match */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
              {/* Image side */}
              <div className="lg:w-[42%] bg-slate-50 p-6 relative flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50" />
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm uppercase tracking-wide">
                    Top Match
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />98%
                  </span>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1503376713356-2dbfdfaa52a1?q=80&w=1500&auto=format&fit=crop"
                  alt="Recommended Car"
                  className="relative z-10 w-[115%] max-w-none transform -translate-x-4 drop-shadow-2xl object-cover mt-4"
                />
              </div>

              {/* Info side */}
              <div className="p-7 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Electric SUV</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">2024</span>
                </div>
                <h2 className="text-2xl xl:text-3xl font-bold text-slate-900 mb-1">Porsche Macan EV</h2>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-xl font-bold text-emerald-600">$78,800</span>
                  <span className="text-sm text-slate-400 line-through">MSRP $80,450</span>
                </div>

                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Perfectly aligns with your 40-mile daily commute and preference for premium German engineering. Highest total cost of ownership efficiency in its class.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: BatteryCharging, label: "Range", value: "315 mi", color: "text-blue-600" },
                    { icon: Gauge, label: "0–60 mph", value: "4.9s", color: "text-amber-600" },
                    { icon: ShieldCheck, label: "Safety", value: "5-Star", color: "text-emerald-600" },
                    { icon: Activity, label: "Depreciation", value: "Low", color: "text-violet-600" },
                  ].map((spec, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                        <spec.icon className={`w-3.5 h-3.5 ${spec.color}`} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">{spec.label}</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold">
                  View Full Report <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Market Chart */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
              <div className="flex items-start justify-between mb-7">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Market Price Analytics</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Historical depreciation vs current asking prices</p>
                </div>
                <Button variant="outline" className="text-sm font-semibold rounded-xl border-slate-200">
                  Detailed Report
                </Button>
              </div>

              <div className="h-56 flex flex-col justify-end relative">
                <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-slate-300 font-semibold z-10">
                  <span>$90k</span><span>$85k</span><span>$80k</span><span>$75k</span>
                </div>
                <div className="absolute left-14 right-0 top-0 bottom-6 flex flex-col justify-between z-0">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-b border-slate-100" />)}
                </div>
                <div className="absolute left-14 right-0 top-0 bottom-6 flex items-end justify-between px-3 z-10 gap-2">
                  {[
                    { height: '90%', label: 'Oct' },
                    { height: '85%', label: 'Nov' },
                    { height: '82%', label: 'Dec' },
                    { height: '75%', label: 'Jan' },
                    { height: '60%', label: 'Feb', current: true },
                    { height: '58%', label: 'Mar', pred: true },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group flex-1">
                      <div className="w-full">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: bar.height }}
                          transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
                          className={`w-full rounded-t-xl relative ${
                            bar.current
                              ? 'bg-slate-900 shadow-lg'
                              : bar.pred
                              ? 'bg-slate-200 border-2 border-dashed border-slate-300'
                              : 'bg-slate-100 group-hover:bg-slate-200'
                          } transition-colors`}
                        >
                          {bar.current && (
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow whitespace-nowrap">
                              Now
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute left-14 right-0 bottom-0 h-6 flex justify-between px-3 text-xs font-semibold text-slate-400 z-10 gap-2">
                  {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m, i) => (
                    <span key={i} className="flex-1 text-center">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Alternatives + Activity */}
        <div className="space-y-6">

          {/* Alternatives */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-slate-900">Alternative Options</h3>
                <Link href="/dashboard/recomendation" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors">
                  All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-xs text-slate-400 mb-5">Other models that fit your profile</p>

              <div className="space-y-2">
                {[
                  { name: "Audi Q8 e-tron", match: "94%", price: "$74,400", trend: "up", img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0b16?q=80&w=800&auto=format&fit=crop" },
                  { name: "BMW iX xDrive50", match: "91%", price: "$87,250", trend: "down", img: "https://images.unsplash.com/photo-1698246535496-c1edb0805c6d?q=80&w=800&auto=format&fit=crop" },
                  { name: "Tesla Model X", match: "88%", price: "$79,990", trend: "down", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop" },
                ].map((car, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group cursor-pointer">
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={car.img} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{car.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 font-semibold">{car.price}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                          car.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {car.trend === 'up' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {car.trend === 'up' ? 'Buy' : 'Wait'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg flex-shrink-0">{car.match}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4 rounded-xl text-sm font-semibold border-slate-200 text-slate-600 hover:bg-slate-50">
                View All 15 Alternatives
              </Button>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-5">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { title: "Price Drop Alert", desc: "Porsche Macan EV fell by $1,200", time: "2h ago", icon: AlertCircle, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                  { title: "Match Updated", desc: "Added 'Electric' to preferences", time: "Yesterday", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                  { title: "Analysis Done", desc: "Scanned 854 new models", time: "2 days ago", icon: Activity, color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${activity.bg}`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">{activity.title}</p>
                        <span className="text-[10px] font-semibold text-slate-400 flex-shrink-0">{activity.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{activity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default dynamic(() => Promise.resolve(DashboardOverview), {
  ssr: false,
});

function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}