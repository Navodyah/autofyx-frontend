'use client';

import { ArrowRight, FileText, Briefcase, MapPin, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 mt-16 flex flex-col items-center text-center">
      <div className="max-w-4xl mx-auto z-10 w-full flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 border border-white/10 rounded-full px-4 py-1.5 mb-8 bg-[#0a0a0a]/50"
        >
          <Plus className="h-3 w-3 text-gray-400" />
          <span className="text-[10px] tracking-widest text-gray-400 font-semibold uppercase">
            AI-Powered Vehicle Curation
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4 mb-8"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Discover the vehicle<br />you were meant to drive.
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          Move beyond conventional searching. AutoFyx analyzes your lifestyle, financial
          parameters, and driving habits to engineer the perfect automotive match.
        </motion.p>

        {/* Search / Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-2 flex flex-col md:flex-row items-center justify-between"
        >
          <div className="flex-1 flex flex-col sm:flex-row w-full divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {/* Filter 1 */}
            <div className="flex-1 flex items-center gap-3 px-6 py-4">
              <FileText className="h-5 w-5 text-gray-500" />
              <div className="text-left">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Monthly Budget</div>
                <div className="text-white text-sm font-medium">$300 - $500 / mo</div>
              </div>
            </div>

            {/* Filter 2 */}
            <div className="flex-1 flex items-center gap-3 px-6 py-4">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <div className="text-left">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Primary Use</div>
                <div className="text-white text-sm font-medium">Daily Commute</div>
              </div>
            </div>

            {/* Filter 3 */}
            <div className="flex-1 flex items-center gap-3 px-6 py-4">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div className="text-left">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Environment</div>
                <div className="text-white text-sm font-medium">Urban City</div>
              </div>
            </div>
          </div>

          <button className="w-full md:w-auto mt-2 md:mt-0 bg-white text-black px-6 py-4 md:py-0 md:h-[60px] rounded-[1.5rem] text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shrink-0">
            Analyze Options
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}