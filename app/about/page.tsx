"use client";

import { motion } from "framer-motion";
import { Car, Users, Target, ShieldCheck, Mail, Facebook, Twitter, Send } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  return (
    <>
      <LoadingScreen duration={1500} />
      <div className="min-h-screen bg-[#0a0a0c] text-zinc-50 font-sans selection:bg-zinc-800 selection:text-white overflow-hidden">
      {/* Absolute Ambient Lighting */}
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
      <PublicNavbar />

      {/* Hero Section */}
      <motion.section
        className="relative z-10 pt-48 pb-20 md:pt-56 md:pb-24 px-6"
      >
        <div className="max-w-[88rem] mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-xs font-medium tracking-widest uppercase mb-8 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            About AutoFyx
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={slideUp}
            className="text-5xl md:text-7xl font-light tracking-tight text-white mb-8 leading-[1.1] text-center w-full"
          >
            Redefining the <br className="hidden md:block" />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 relative">
              automotive journey.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl text-center mb-16 font-light leading-relaxed"
          >
            We are a team of data scientists, automotive enthusiasts, and engineers committed to eliminating buyer&apos;s remorse and bringing radical transparency to vehicle purchasing.
          </motion.p>
        </div>
      </motion.section>

      {/* Our Mission & Values */}
      <section className="relative z-10 py-20 bg-[#0a0a0c] overflow-hidden">
        <div className="max-w-[88rem] mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Mission Statement */}
            <motion.div
              variants={slideUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              className="lg:col-span-3 bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] group-hover:bg-blue-600/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner flex items-center justify-center mb-8">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl md:text-4xl font-semibold text-white mb-5 tracking-tight">Our Mission</h3>
                <p className="text-zinc-400 max-w-3xl leading-relaxed font-light text-lg">
                  To democratize automotive intelligence. We believe that everyone deserves to make informed, data-driven decisions when purchasing a vehicle. By analyzing millions of data points—from performance metrics to total cost of ownership—we provide unbiased, highly personalized recommendations that align with your lifestyle and budget.
                </p>
              </div>
            </motion.div>

            {/* Value 1 */}
            <motion.div
              variants={slideUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">Unbiased Integrity</h3>
              <p className="text-zinc-400 text-base leading-relaxed font-light">
                We are not a dealership. We don&apos;t hold inventory, and our recommendations are never influenced by manufacturer kickbacks or sales quotas.
              </p>
            </motion.div>

            {/* Value 2 */}
            <motion.div
              variants={slideUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">User-Centric Design</h3>
              <p className="text-zinc-400 text-base leading-relaxed font-light">
                Everything we build is designed with the end user in mind. Your lifestyle, financial goals, and personal preferences drive our algorithms.
              </p>
            </motion.div>

            {/* Value 3 */}
            <motion.div
              variants={slideUp}
              whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Car className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 tracking-tight">Automotive Passion</h3>
              <p className="text-zinc-400 text-base leading-relaxed font-light">
                We genuinely love cars. Our platform combines hardcore data science with a deep appreciation for automotive engineering and design.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Modern Creative Footer */}
      <footer className="relative z-10 bg-[#08080a] border-t border-white/5 pt-20 pb-10 mt-10">
        <div className="max-w-[88rem] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-zinc-700 bg-gradient-to-br from-zinc-800 to-black text-white flex items-center justify-center rounded-lg shadow-xl">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">AutoFyx</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                AutoFyx is an intelligent vehicle curation platform designed to help you find the perfect automotive match through data-driven analysis.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-2">Quick Links</h4>
              <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-sm">Home</Link>
              <Link href="/about" className="text-zinc-500 hover:text-white transition-colors text-sm">About Us</Link>
              <Link href="/contact" className="text-zinc-500 hover:text-white transition-colors text-sm">Contact</Link>
            </div>
            <div className="hidden lg:block"></div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-2">Connect With Us</h4>
              <div className="flex items-center gap-4 mb-2">
                <motion.a whileHover={{ y: -3 }} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <Facebook className="w-4 h-4" />
                </motion.a>
                <motion.a whileHover={{ y: -3 }} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <Twitter className="w-4 h-4" />
                </motion.a>
                <motion.a whileHover={{ y: -3 }} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <Send className="w-4 h-4" />
                </motion.a>
              </div>
              <a href="mailto:contact@autofyx.com" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm">
                <Mail className="w-4 h-4" />
                contact@autofyx.com
              </a>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-600 text-xs tracking-wide">
              © {new Date().getFullYear()} AutoFyx Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <Link href="#" className="text-zinc-600 hover:text-white transition-colors text-xs font-medium">Privacy Policy</Link>
              <Link href="#" className="text-zinc-600 hover:text-white transition-colors text-xs font-medium">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
