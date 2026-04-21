"use client";

import { Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] w-full">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#2a2a30]/20 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 px-6 w-full max-w-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-zinc-200" />
                    </div>
                    <span className="text-white font-bold text-2xl tracking-wide">AutoFyx</span>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex flex-col items-center gap-5 mt-4"
                >
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-white/60 border-r-white/20 border-b-transparent border-l-transparent animate-spin" />
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-zinc-100 font-semibold text-[17px] tracking-wide">
                            Loading Dashboard
                        </p>
                        <p className="text-zinc-500 text-sm mt-1.5 font-medium">
                            Preparing your workspace and datasets...
                        </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                            <div 
                                key={i} 
                                className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" 
                                style={{ animationDelay: `${i * 0.2}s` }} 
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
