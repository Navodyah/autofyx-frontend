'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">AI-Powered Recommendations</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Find Your Perfect Ride</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                with AI Precision
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl">
              Stop guessing. Let AutoFyx analyze your needs, budget, and lifestyle to recommend the
              best vehicle for you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white group"
              >
                Start Recommendation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                View Inventory
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-sm text-slate-400">Vehicles Analyzed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-sm text-slate-400">Match Accuracy</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">5K+</div>
                <div className="text-sm text-slate-400">Happy Users</div>
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square">
              {/* Placeholder for Hero Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl border border-blue-500/30 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-white" />
                  </div>
                  <p className="text-slate-400 text-sm">Hero Image Placeholder</p>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-xl">
                <div className="text-xs text-slate-400">AI Confidence</div>
                <div className="text-2xl font-bold text-green-400">95%</div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-xl p-4 shadow-xl">
                <div className="text-xs text-slate-400">Processing Time</div>
                <div className="text-2xl font-bold text-blue-400">2.3s</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}