"use client";

import { motion, useScroll, useTransform, easeOut } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Wallet,
  ArrowRight,
  Car,
  ShieldCheck,
  Star,
  Cpu,
  TrendingUp,
  SlidersHorizontal,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  // Parallax effects for Hero
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Navbar Car Scroll Progress
  const carXPos = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-50 font-sans selection:bg-zinc-800 selection:text-white overflow-hidden">

      {/* Absolute Ambient Lighting with Slow Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-30%] w-[1000px] h-[800px] bg-[#2a2a30]/15 blur-[150px] rounded-[100%] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${scrolled ? "bg-black/70 backdrop-blur-xl border-zinc-800/50 py-4" : "bg-transparent border-transparent py-8"
          }`}
      >
        <div className="max-w-[88rem] mx-auto px-6 md:px-12 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 border border-zinc-700 bg-gradient-to-br from-zinc-800 to-black text-white flex items-center justify-center rounded-sm">
              <Car className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-xl md:text-2xl font-semibold tracking-wide text-zinc-100">AutoFyx</span>
          </motion.div>
          <div className="hidden lg:flex items-center gap-10 text-sm font-medium text-zinc-400 tracking-wide">
            <Link href="#how-it-works" className="hover:text-white transition-colors relative group">
              Methodology
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="#features" className="hover:text-white transition-colors relative group">
              Intelligence
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="#catalog" className="hover:text-white transition-colors relative group">
              Inventory
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 transition-colors rounded-sm tracking-wide">
                Start Match
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Progress Car Animation */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent">
          <motion.div
            style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
            className="absolute inset-0 bg-white/20"
          />
          <motion.div
            style={{ left: carXPos }}
            className="absolute bottom-[-7px] ml-[-16px] flex items-center z-50 pointer-events-none"
          >
            <Car className="w-4 h-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <motion.div
              animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1.5, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-[1px] bg-gradient-to-l from-white/80 to-transparent ml-1 origin-left"
            />
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section with Parallax */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 pt-48 pb-20 md:pt-56 md:pb-24 px-6"
      >
        {/* Small Light Gray Animated Background Vehicles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{ x: ["-10vw", "110vw"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] opacity-30"
          >
            <Car className="w-8 h-8 text-zinc-400" />
          </motion.div>

          <motion.div
            animate={{ x: ["110vw", "-10vw"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute top-[50%] opacity-20"
          >
            <Car className="w-6 h-6 text-zinc-500" />
          </motion.div>

          <motion.div
            animate={{ x: ["-10vw", "110vw"] }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear", delay: 12 }}
            className="absolute top-[80%] opacity-10"
          >
            <Car className="w-10 h-10 text-zinc-600" />
          </motion.div>
        </div>

        <div className="max-w-[88rem] mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-xs font-medium tracking-widest uppercase mb-8 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            AI-Powered Vehicle Curation
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={slideUp}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-light tracking-tight text-white mb-8 leading-[1.1] text-center w-full"
          >
            Discover the vehicle <br className="hidden md:block" />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 relative">
              you were meant to drive.
              <motion.span
                initial={{ left: 0 }}
                animate={{ left: "100%" }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
                className="absolute top-0 bottom-0 w-[1px] bg-white/20 blur-[1px]"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl text-center mb-16 font-light leading-relaxed"
          >
            Move beyond conventional searching. AutoFyx analyzes your lifestyle, financial parameters, and driving habits to engineer the perfect automotive match.
          </motion.p>

          {/* Hero Form / Floating Pill UI -> Staggered Entry */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-4xl p-2 md:p-3 rounded-2xl md:rounded-full bg-[#16161a]/60 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2 relative overflow-hidden group"
          >
            {/* Subtle Glare Effect passing over the pill */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "linear" }}
              className="absolute top-0 bottom-0 w-[20%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
            />

            <motion.div variants={slideUp} className="flex-1 w-full flex items-center gap-3 px-6 py-4 border-b md:border-b-0 md:border-r border-white/5 hover:bg-white/5 transition-colors rounded-xl md:rounded-l-full cursor-pointer">
              <Wallet className="w-5 h-5 text-zinc-500" />
              <div className="text-left flex-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Monthly Budget</p>
                <select className="w-full bg-transparent text-white outline-none appearance-none cursor-pointer">
                  <option className="bg-zinc-900">$300 - $500 / mo</option>
                  <option className="bg-zinc-900">$500 - $800 / mo</option>
                  <option className="bg-zinc-900">$800 - $1200 / mo</option>
                  <option className="bg-zinc-900">$1200+ / mo</option>
                </select>
              </div>
            </motion.div>

            <motion.div variants={slideUp} className="flex-1 w-full flex items-center gap-3 px-6 py-4 border-b md:border-b-0 md:border-r border-zinc-800/50 hover:bg-zinc-800/30 transition-colors rounded-xl cursor-pointer">
              <Briefcase className="w-5 h-5 text-zinc-500" />
              <div className="text-left flex-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Primary Use</p>
                <select className="w-full bg-transparent text-white outline-none appearance-none cursor-pointer">
                  <option className="bg-zinc-900">Daily Commute</option>
                  <option className="bg-zinc-900">Family & Travel</option>
                  <option className="bg-zinc-900">Performance / Track</option>
                  <option className="bg-zinc-900">Off-Road / Utility</option>
                </select>
              </div>
            </motion.div>

            <motion.div variants={slideUp} className="flex-1 w-full flex items-center gap-3 px-6 py-4 hover:bg-zinc-800/30 transition-colors rounded-xl md:rounded-r-full cursor-pointer">
              <MapPin className="w-5 h-5 text-zinc-500" />
              <div className="text-left flex-1">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Environment</p>
                <select className="w-full bg-transparent text-white outline-none appearance-none cursor-pointer">
                  <option className="bg-zinc-900">Urban City</option>
                  <option className="bg-zinc-900">Suburban Driving</option>
                  <option className="bg-zinc-900">Harsh Winters / Snow</option>
                </select>
              </div>
            </motion.div>

            <motion.button
              variants={slideUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-auto mt-2 md:mt-0 px-8 py-5 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl md:rounded-full font-semibold flex items-center justify-center gap-2 flex-shrink-0"
            >
              Analyze Options
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Analysis Engine Active - MATCHING IMAGE 2 EXACTLY */}
      <section className="relative z-10 w-full mb-32">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="w-full h-[400px] md:h-[450px] bg-[#121215] rounded-[2rem] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl"
          >
            {/* Dark Vehicle Background Pattern */}
            <div className="absolute inset-0 z-0">
               <div className="absolute inset-0 bg-gradient-to-b from-[#121215] via-transparent to-[#121215] z-20 pointer-events-none" />
               <motion.div
                 animate={{ scale: [1, 1.03, 1] }}
                 transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-50 grayscale"
               />
               
               {/* Advanced Laser Scan Animation */}
               <motion.div 
                 animate={{ top: ["-20%", "120%"] }}
                 transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                 className="absolute left-0 right-0 h-[2px] bg-white/70 shadow-[0_0_20px_rgba(255,255,255,0.9)] z-10"
               />
               
               <div className="absolute inset-0 bg-black/40 z-10 mix-blend-overlay pointer-events-none" />
            </div>

            {/* Content (Z-index active so it's above the dark car background) */}
            <div className="relative z-30 flex flex-col items-center justify-center space-y-6 text-center">
              <motion.div 
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white/80 tracking-[0.25em] uppercase text-[10px] md:text-xs font-bold font-sans"
              >
                Analysis Engine Active
              </motion.div>
              
              <div className="relative flex items-center justify-center">
                <Cpu className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" strokeWidth={1.5} />
                {/* Processing Rings */}
                <motion.div 
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  className="absolute w-12 h-12 border border-white/40 rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                  className="absolute w-12 h-12 border border-white/20 rounded-full"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-[#a0a0a0] font-mono text-xs md:text-sm tracking-widest mt-4">
                  Processing 1,402 metrics against 850+ active models
                </p>
                <motion.span 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="mt-4 w-1.5 h-4 bg-white block"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Methodology Section (Bento Grid with Hover Physics) */}
      <section id="features" className="relative z-10 py-20 bg-[#0a0a0c] overflow-hidden">
        <div className="max-w-[88rem] mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center md:text-left"
          >
            <h2 className="text-4xl md:text-6xl font-light text-white mb-6 tracking-tight">Engineered for <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">Precision.</span></h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed">
              Eliminate buyer's remorse. Our advanced recommendation matrix evaluates vehicles across performance, cost-to-own, and lifestyle synergy.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Feature */}
            <motion.div
              variants={slideUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              className="lg:col-span-2 bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-zinc-800/20 rounded-full blur-[120px] group-hover:bg-zinc-700/30 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner flex items-center justify-center mb-8">
                  <SlidersHorizontal className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold text-white mb-5 tracking-tight">Deep Lifestyle Integration</h3>
                <p className="text-zinc-400 max-w-lg leading-relaxed font-light text-lg">
                  Do you need cargo space for camping gear? A quiet cabin for highway calls? Pure electric efficiency? AutoFyx matches fundamental vehicle DNA with your exact daily routines.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="py-2.5 px-5 rounded-full border border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm text-sm text-zinc-200 flex items-center gap-2 cursor-pointer shadow-lg">
                    <Zap className="w-4 h-4 text-zinc-400" /> EV & Hybrid Profiling
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="py-2.5 px-5 rounded-full border border-zinc-700/50 bg-zinc-900/80 backdrop-blur-sm text-sm text-zinc-200 flex items-center gap-2 cursor-pointer shadow-lg">
                    <TrendingUp className="w-4 h-4 text-zinc-400" /> Depreciation Tracking
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={slideUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">Total Cost of Ownership</h3>
              <p className="text-zinc-400 text-base leading-relaxed font-light">
                We calculate insurance rates, expected maintenance, fuel costs, and historical repair data to ensure your budget goes beyond the sticker price.
              </p>
            </motion.div>

            <motion.div
              variants={slideUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">Unbiased Ratings</h3>
              <p className="text-zinc-400 text-base leading-relaxed font-light">
                Aggregated safety scores from NHTSA/IIHS, paired with real owner satisfaction data, gives you the unvarnished truth without dealership interference.
              </p>
            </motion.div>

            <motion.div
              variants={slideUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              className="lg:col-span-2 bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-10 transition-all duration-300 group"
            >
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">Market Availability</h3>
                <p className="text-zinc-400 leading-relaxed font-light max-w-md text-lg">
                  Once your match is found, we instantly scour local inventories and nationwide aggregators to find the exact configuration you desire.
                </p>
              </div>
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5, zIndex: 50 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-20 h-20 rounded-full border-4 border-[#0a0a0a] bg-zinc-800 flex items-center justify-center z-10 shadow-xl`}
                    style={{ zIndex: 30 - i }}
                  >
                    <Car className="w-8 h-8 text-zinc-500" />
                  </motion.div>
                ))}
                <motion.div
                  whileHover={{ scale: 1.1, zIndex: 50 }}
                  className="w-20 h-20 rounded-full border-4 border-[#0a0a0a] bg-white flex items-center justify-center text-black font-bold text-sm uppercase shadow-xl cursor-pointer"
                  style={{ zIndex: 40 }}
                >
                  +2k
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Boxed CTA Section - MATCHING IMAGE 1 EXACTLY */}
      <section className="relative z-10 py-32 bg-[#0a0a0c] flex justify-center">
        <div className="w-full max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full rounded-[2.5rem] bg-gradient-to-b from-[#18181c] to-[#0d0d10] border border-white/10 p-16 md:p-24 text-center relative overflow-hidden shadow-2xl"
          >
            {/* Very subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-white/[0.02] blur-3xl opacity-50 rounded-full pointer-events-none" />

            <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-light text-zinc-300 mb-6 tracking-tight relative z-10">
              Stop searching. <span className="font-semibold text-white">Start driving.</span>
            </h2>
            
            <p className="text-[17px] text-[#7a7a7a] max-w-2xl mx-auto mb-10 font-normal leading-relaxed relative z-10">
              Join discerning drivers who used our analytical methodology to find their ideal vehicle without the dealership stress.
            </p>
            
            <div className="flex justify-center relative z-10">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link 
                  href="/register" 
                  className="px-8 py-3.5 rounded-full bg-white text-black text-sm font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all font-sans"
                >
                  Launch Recommendation AI
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#060608] py-8">
        <div className="max-w-[88rem] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-white" />
              <span className="text-lg font-semibold text-white tracking-wide">AutoFyx</span>
            </div>
            <p className="text-xs text-zinc-500 font-light">Intelligent Vehicle Curation</p>
          </div>
          <div className="flex items-center gap-6 text-xs font-light text-zinc-400">
            <Link href="#" className="hover:text-white transition-colors">Platform</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}