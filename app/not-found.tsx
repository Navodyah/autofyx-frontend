"use client";

import Link from "next/link";
import { Car, Map, ArrowLeft, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030304] overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#155dfc]/10 blur-[150px] rounded-full" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: "4rem 4rem"
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Animated Icon */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-[#155dfc]/20 blur-2xl rounded-full" />
          <div className="w-24 h-24 rounded-2xl bg-[#030304] border border-[#155dfc]/20 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(21,93,252,0.15)] relative overflow-hidden">
            <TriangleAlert className="w-10 h-10 text-[#155dfc] mb-1" />
            <span className="text-zinc-500 text-xs font-mono font-bold tracking-widest">404</span>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#155dfc]/0 via-[#155dfc] to-[#155dfc]/0" />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Dead End
          </h1>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto">
            It looks like this route doesn&apos;t exist. Let&apos;s redirect you back to familiar roads.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="/">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-zinc-100 text-black rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Head Home
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 group">
              <Map className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              Go to Dashboard
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Brand Watermark */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-30 select-none pointer-events-none">
        <Car className="w-4 h-4 text-white" />
        <span className="text-white font-semibold text-sm tracking-widest uppercase">AutoFyx</span>
      </div>
    </div>
  );
}

