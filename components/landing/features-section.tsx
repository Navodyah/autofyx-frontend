'use client';

import { Card } from '@/components/ui/card';
import { Brain, DollarSign, Scale, Shield, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Our algorithms analyze thousands of data points to find your perfect match.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: DollarSign,
    title: 'Cost Prediction',
    description: 'Get accurate maintenance and fuel cost estimates before you buy.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Scale,
    title: 'Smart Comparison',
    description: 'Compare models side-by-side with unbiased data and expert insights.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Safety Ratings',
    description: 'Access comprehensive safety scores and crash test results.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get personalized recommendations in seconds, not hours.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: TrendingUp,
    title: 'Market Insights',
    description: 'Real-time pricing trends and depreciation forecasts.',
    color: 'from-cyan-500 to-blue-500',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
          >
            Intelligent Features for
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {' '}
              Smarter Decisions
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Powered by advanced machine learning and real-time data analysis
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all duration-300 p-6 h-full group hover:shadow-xl hover:shadow-blue-500/10">
                <div className="space-y-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-2.5 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}