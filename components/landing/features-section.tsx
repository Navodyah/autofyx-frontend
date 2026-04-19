'use client';

import { Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-12">
      {/* Analysis Engine Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full h-80 rounded-[2rem] border border-white/5 overflow-hidden relative group"
      >
        <div className="absolute inset-0 bg-[#0a0a0a]">
          {/* Subtle vehicle background (gradient overlay) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-[#0a0a0a] z-10" />
          {/* Placeholder for the background image */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-luminosity grayscale" />
        </div>

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pb-10">
          <div className="text-[10px] tracking-[0.2em] text-gray-500 font-semibold uppercase mb-4">
            Analysis Engine Active
          </div>
          <div className="w-12 h-12 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center mb-4">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm text-gray-400 font-mono">
            Processing 1,402 metrics against 850+ active models...
          </div>
        </div>

        {/* Loading Bar at bottom edge */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 z-30">
          <div className="h-full bg-white w-1/3 animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
}