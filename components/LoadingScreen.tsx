"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Car } from "lucide-react";
import { useState, useEffect } from "react";

export function LoadingScreen({ duration = 2500 }: { duration?: number }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0a0a0c] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Ambient noise & glow for loading screen */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Premium Floating Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-20 h-20 md:w-24 md:h-24 border border-white/10 bg-gradient-to-br from-[#1c1c21] to-black flex items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.2)] mb-8 relative overflow-hidden"
            >
              {/* Advanced Laser Scan Animation */}
              <motion.div 
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] z-10"
              />
              <Car className="w-10 h-10 md:w-12 md:h-12 text-zinc-100 relative z-0" />
            </motion.div>

            {/* Brand & Loading Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-3xl md:text-5xl font-black tracking-widest text-white mb-3 uppercase drop-shadow-lg">
                AutoFyx
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-xs md:text-sm font-mono text-zinc-400 uppercase tracking-[0.3em]">
                  Initializing Engine
                </p>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                  className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                />
              </div>
            </motion.div>

            {/* Loading Progress Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-64 md:w-80 h-1 bg-zinc-800/80 rounded-full mt-10 overflow-hidden relative border border-white/5"
            >
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: (duration / 1000) - 0.3, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-400"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
