"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { Fuel, Gauge, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VehicleRecommendationCardData {
  id: string;
  name: string;
  year: number;
  imageUrl: string;
  matchScore: number;
  fuelType: string;
  engineCapacity: string;
  transmission: string;
  marketPrice: number;
  monthlyEMI: number;
  annualFuelCost: number;
  fiveYearOwnershipCost: number;
  currency: string;
}

interface VehicleRecommendationCardProps {
  vehicle: VehicleRecommendationCardData;
}

function AnimatedCounter({
  value,
  duration = 1.8,
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest * 10) / 10);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration,
      });
      return () => controls.stop();
    }
    return undefined;
  }, [motionValue, value, duration, isInView]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toFixed(1);
      }
    });
    return unsubscribe;
  }, [rounded]);

  return <span ref={ref}>0.0</span>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VehicleRecommendationCard({ vehicle }: VehicleRecommendationCardProps) {
  const isTopChoice = vehicle.matchScore > 95;
  const ikmanSearchUrl = `https://ikman.lk/en/ads?query=${encodeURIComponent(vehicle.name.toLowerCase())}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-black transition-all duration-300 hover:border-slate-700"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="relative h-64 bg-gradient-radial from-slate-900 via-slate-950 to-black lg:h-auto lg:w-[34%]">
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.name} ${vehicle.year}`}
            className="h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />

          {isTopChoice && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: "spring" }}
              className="absolute left-4 top-4"
            >
              <span className="rounded-lg border-2 border-white bg-black/80 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
                TOP CHOICE
              </span>
            </motion.div>
          )}
        </div>

        <div className="space-y-6 p-6 lg:w-[66%] lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="mb-1 text-2xl font-bold text-white lg:text-4xl">{vehicle.name}</h3>
              <p className="text-sm text-slate-400">{vehicle.year} Model</p>
            </div>

            <div className="text-right">
              <motion.div
                className="text-5xl font-bold text-white lg:text-7xl"
                style={{
                  textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
                }}
              >
                <AnimatedCounter value={vehicle.matchScore} />%
              </motion.div>
              <p className="mt-1 text-xs tracking-wider text-slate-500">MATCH SCORE</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Gauge className="h-5 w-5" />
              <span className="text-sm">{vehicle.engineCapacity}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Settings className="h-5 w-5" />
              <span className="text-sm">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Fuel className="h-5 w-5" />
              <span className="text-sm">{vehicle.fuelType}</span>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Cost Analysis</h4>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 transition-colors hover:border-slate-700">
                <p className="mb-2 text-xs text-slate-500">Market Price</p>
                <p className="text-lg font-semibold text-white">
                  {vehicle.currency} {formatCurrency(vehicle.marketPrice)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 transition-colors hover:border-slate-700">
                <p className="mb-2 text-xs text-slate-500">Monthly EMI</p>
                <p className="text-lg font-semibold text-white">
                  {vehicle.currency} {formatCurrency(vehicle.monthlyEMI)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 transition-colors hover:border-slate-700">
                <p className="mb-2 text-xs text-slate-500">Annual Fuel</p>
                <p className="text-lg font-semibold text-white">
                  {vehicle.currency} {formatCurrency(vehicle.annualFuelCost)}
                </p>
              </div>

              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(255, 255, 255, 0)",
                    "0 0 15px rgba(255, 255, 255, 0.2)",
                    "0 0 0px rgba(255, 255, 255, 0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="relative overflow-hidden rounded-lg border-2 border-white bg-white p-4"
              >
                <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-black" />
                <p className="mb-2 text-xs font-semibold text-slate-800">5-Year Total Cost</p>
                <p className="text-lg font-bold text-black">
                  {vehicle.currency} {formatCurrency(vehicle.fiveYearOwnershipCost)}
                </p>
                <p className="mt-1 text-xs text-slate-600">Key Insight</p>
              </motion.div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              asChild
              size="lg"
              className="bg-white px-8 font-semibold text-black transition-all duration-300 hover:bg-slate-200"
            >
              <a href={ikmanSearchUrl} target="_blank" rel="noopener noreferrer">
                Detailed Analysis
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
