'use client';

import { Card } from '@/components/ui/card';
import { ClipboardList, Cpu, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    step: 1,
    icon: ClipboardList,
    title: 'Enter Your Preferences',
    description: 'Tell us about your budget, usage patterns, preferred fuel type, and lifestyle needs.',
  },
  {
    step: 2,
    icon: Cpu,
    title: 'AI Engine Processing',
    description: 'Our advanced algorithms analyze millions of data points to find your ideal matches.',
  },
  {
    step: 3,
    icon: ListChecks,
    title: 'Get Personalized Results',
    description: 'Receive a curated list of top-rated vehicles with detailed insights and comparisons.',
  },
];

export default function StepsSection() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Three simple steps to find your perfect vehicle
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <Card className="bg-slate-900/50 border-slate-800 p-8 text-center relative z-10 hover:border-blue-500/50 transition-all">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-blue-400" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}