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
  CalendarDays, 
  CarFront, 
  Gauge, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  TrendingDown, 
  Trophy,
  Activity,
  History,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

function DashboardOverview() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">System Active</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Dashboard Overview</h1>
          <p className="text-slate-500">Your personalized vehicle intelligence and market analytics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="px-5 py-2.5 rounded-xl font-medium shadow-sm gap-2 text-sm">
            <History className="w-4 h-4" />
            History
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            Update Preferences
          </Button>
        </div>
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[
          { title: "Recommendation", href: "/dashboard/recomendation", desc: "AI-ranked vehicle suggestions" },
          { title: "Vehicle Search", href: "/dashboard/search", desc: "Manual vehicle filtering" },
          { title: "Compare", href: "/dashboard/compare", desc: "Side-by-side specs" },
          { title: "Cost Calculation", href: "/dashboard/cost-calculation", desc: "EMI and ownership cost" },
          { title: "Profile", href: "/dashboard/profile", desc: "Personal and preference settings" },
          { title: "My Garage (Wishlist)", href: "/dashboard/garage", desc: "Saved vehicles" },
        ].map((module) => (
          <Card key={module.href} className="border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="pt-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{module.title}</p>
                <p className="text-xs text-slate-500 mt-1">{module.desc}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-lg">
                <Link href={module.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          { label: "Analyzed Models", value: "854", sub: "+12 this week", icon: CarFront, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Saved Matches", value: "3", sub: "1 high confidence", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Market Trend", value: "-2.4%", sub: "Prices dropping", icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Alerts", value: "2", sub: "Price drop detected", icon: BellIcon, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden gap-0">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">{stat.sub}</span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 blur-2xl pointer-events-none`} />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Huge Match & Chart */}
        <div className="xl:col-span-2 space-y-8">
          {/* Main Recommended Hero Match */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row relative gap-0 p-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none -mt-20 -mr-20" />
            
            {/* Visual Side */}
            <div className="lg:w-2/5 bg-slate-50 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10 w-full mb-8">
                <div className="px-3 py-1 rounded-full bg-white shadow-sm border border-slate-200 text-xs font-bold text-blue-600 flex items-center gap-1.5 uppercase tracking-wider">
                  Top Match
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 fill-emerald-600" />
                  98%
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1503376713356-2dbfdfaa52a1?q=80&w=1500&auto=format&fit=crop" 
                alt="Recommended Car" 
                className="w-[120%] max-w-none transform -translate-x-6 relative z-10 filter drop-shadow-2xl object-cover rounded-xl"
              />
            </div>

            {/* Content Side */}
            <div className="p-8 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Electric SUV</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">2024</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Porsche Macan EV</h2>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-bold text-emerald-600">$78,800</span>
                <span className="text-sm font-medium text-slate-400 line-through">MSRP $80,450</span>
              </div>
              
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Perfectly aligns with your 40-mile daily commute and preference for premium German engineering. Highest total cost of ownership efficiency in its class.
              </p>

              <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <BatteryCharging className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Range</p>
                    <p className="text-sm font-bold text-slate-900">315 mi</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <Gauge className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Acceleration</p>
                    <p className="text-sm font-bold text-slate-900">4.9s <span className="text-xs font-normal text-slate-500">0-60</span></p>
                  </div>
                </div>
              </div>
            </div>
            </Card>
          </motion.div>

          {/* Market Analytics Mini-Chart Widget */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border border-slate-200 shadow-sm p-0 gap-0">
              <CardHeader className="flex items-center justify-between px-8 pt-8 pb-0">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Market Price Analytics</CardTitle>
                  <CardDescription className="text-sm text-slate-500">Historical depreciation vs current asking prices</CardDescription>
                </div>
                <Button variant="outline" className="text-sm font-semibold text-blue-600 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                Detailed Report
                </Button>
              </CardHeader>
              <CardContent className="p-8">
            
            {/* CSS UI Chart representation */}
            <div className="h-64 flex flex-col justify-end gap-2 relative">
              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-xs text-slate-400 font-medium z-10">
                <span>$90k</span><span>$85k</span><span>$80k</span><span>$75k</span>
              </div>
              {/* Grid Lines */}
              <div className="absolute left-14 right-0 top-0 bottom-6 flex flex-col justify-between z-0">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-b border-dashed border-slate-200" />)}
              </div>
              
              {/* Bars */}
              <div className="absolute left-14 right-0 top-0 bottom-6 flex items-end justify-between px-4 z-10">
                {[
                  { height: '90%', label: 'Oct' },
                  { height: '85%', label: 'Nov' },
                  { height: '82%', label: 'Dec' },
                  { height: '75%', label: 'Jan' },
                  { height: '60%', label: 'Feb', current: true },
                  { height: '58%', label: 'Mar', pred: true },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group w-1/6">
                    <div className="w-full px-2">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: bar.height }}
                         transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                         className={`w-full rounded-t-lg relative transition-colors ${bar.current ? 'bg-blue-600 shadow-lg shadow-blue-200' : bar.pred ? 'bg-blue-200 border-2 border-dashed border-blue-400' : 'bg-slate-200 group-hover:bg-slate-300'}`}
                       >
                         {bar.current && (
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded shadow pointer-events-none">
                             Current
                           </div>
                         )}
                       </motion.div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute left-14 right-0 bottom-0 h-6 flex justify-between px-4 text-xs font-semibold text-slate-500 z-10">
                <span className="w-1/6 text-center">Oct</span>
                <span className="w-1/6 text-center">Nov</span>
                <span className="w-1/6 text-center">Dec</span>
                <span className="w-1/6 text-center">Jan</span>
                <span className="w-1/6 text-center text-blue-600">Feb</span>
                <span className="w-1/6 text-center text-slate-400">Mar (Est)</span>
              </div>
            </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Alternatives & Activity */}
        <div className="space-y-8">
          {/* Alternative Matches */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border border-slate-200 shadow-sm p-6 lg:p-8 gap-0">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Alternative Options</h3>
            <p className="text-sm text-slate-500 mb-6">Other models that fit your profile</p>
            
            <div className="space-y-4">
              {[
                { name: "Audi Q8 e-tron", match: "94%", price: "$74,400", trend: "up", img: "https://images.unsplash.com/photo-1606664515524-ed2f786a0b16?q=80&w=800&auto=format&fit=crop" },
                { name: "BMW iX xDrive50", match: "91%", price: "$87,250", trend: "down", img: "https://images.unsplash.com/photo-1698246535496-c1edb0805c6d?q=80&w=800&auto=format&fit=crop" },
                { name: "Tesla Model X", match: "88%", price: "$79,990", trend: "down", img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop" },
              ].map((car, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    <img src={car.img} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{car.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-slate-500">{car.price}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${car.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {car.trend === 'up' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {car.trend === 'up' ? 'Good Buy' : 'Wait'}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-transparent border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              View All 15 Alternatives
            </Button>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-[2rem] border border-slate-200 shadow-sm p-6 lg:p-8 gap-0">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {[
                { title: "Price Drop Alert", desc: "Porsche Macan EV price fell by $1,200", time: "2 hours ago", icon: AlertCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
                { title: "Match Updated", desc: "Added 'Electric' to primary preferences", time: "Yesterday", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50" },
                { title: "Analysis Completed", desc: "Finished scanning 854 new models", time: "2 days ago", icon: Activity, color: "text-purple-500", bg: "bg-purple-50" },
              ].map((activity, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white ${activity.bg} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2`}>
                    <activity.icon className={`w-3.5 h-3.5 ${activity.color}`} />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 text-sm">{activity.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-400">{activity.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default dynamic(() => Promise.resolve(DashboardOverview), {
  ssr: false,
});

// Helper icon component for Bell
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