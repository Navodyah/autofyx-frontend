"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Car, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";
import axios from "axios";
import { createBrowserAuthToken } from "@/lib/auth-token";
import { resolvePostLoginPath } from "@/lib/auth-token";
import { completeGoogleAuthFlow, persistBrowserAuthSession, signInWithGoogle } from "@/lib/appwrite";
import { motion } from "framer-motion";

// ─── ALL BACKEND LOGIC UNTOUCHED ──────────────────────────────────────────────

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const searchParams = useSearchParams();
    const handledGoogleCallback = useRef(false);

    useEffect(() => {
        const oauth = searchParams.get("oauth") || searchParams.get("outh");
        const oauthError = searchParams.get("error");
        const hasOAuthCallback =
            oauth === "google" ||
            searchParams.has("code") ||
            searchParams.has("state") ||
            searchParams.has("userId") ||
            searchParams.has("secret");

        if (oauth === "failed") {
            setIsGoogleLoading(false);
            alert(oauthError || "Google sign-in failed. Please try again.");
            return;
        }

        if (!hasOAuthCallback || handledGoogleCallback.current) return;
        handledGoogleCallback.current = true;

        let cancelled = false;
        const finalizeGoogleLogin = async () => {
            try {
                setIsGoogleLoading(true);
                const nextPath = searchParams.get("next");
                const result = await completeGoogleAuthFlow("user", nextPath, {
                    oauthUserId: searchParams.get("userId"),
                    oauthSecret: searchParams.get("secret"),
                });
                if (cancelled) return;
                window.location.replace(result.dashboardRoute);
            } catch (error) {
                console.error("Google login completion error:", error);
                alert("Google sign-in failed. Please try again.");
            } finally {
                if (!cancelled) {
                    setIsGoogleLoading(false);
                }
            }
        };

        void finalizeGoogleLogin();
        return () => {
            cancelled = true;
        };
    }, [searchParams]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/users/login", {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log("Login successful:", response.data);
            const user = response.data?.user;
            const token = response.data.access_token || response.data.token || createBrowserAuthToken({
                user_id: user?.user_id,
                appwrite_id: user?.appwrite_id,
                email: user?.email,
                user_type: user?.user_type,
                session_id: response.data?.session_id,
            });

            persistBrowserAuthSession(token);

            const userType = user?.user_type || null;
            const redirectPath = resolvePostLoginPath(userType, searchParams.get("next"));
            window.location.href = redirectPath;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Login error:", error.response?.data);
                alert(error.response?.data?.detail || error.response?.data?.message || "Login failed");
            } else {
                console.error("Login error:", error);
                alert("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ─── UI ───────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen flex bg-[#0a0a0c] overflow-hidden">

            {/* ── Ambient background glow (matches landing page) ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[#2a2a30]/20 blur-[150px] rounded-full"
                />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: "4rem 4rem",
                    }}
                />
            </div>

            {/* ── Left Visual Panel ─────────────────────────────────────────── */}
            <div className="hidden lg:flex w-[52%] relative overflow-hidden">
                {/* BMW luxury car photo */}
                <motion.div
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 12, ease: "easeOut" }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2000&auto=format&fit=crop')" }}
                />
                {/* Dark gradient matching landing page palette */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0c]/80 via-[#0a0a0c]/40 to-[#0a0a0c]/70" />

                {/* Laser scan animation - mirrors landing page analysis section */}
                <motion.div
                    animate={{ top: ["-10%", "110%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10"
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-semibold text-xl tracking-wide">AutoFyx</span>
                    </Link>

                    {/* Center hero text */}
                    <div className="space-y-6 max-w-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.9 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-xs font-medium tracking-widest uppercase mb-5 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                                AI-Powered Curation
                            </div>
                            <h2 className="text-white text-4xl xl:text-5xl font-light leading-tight tracking-tight">
                                Discover the vehicle{" "}
                                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
                                    you were meant to drive.
                                </span>
                            </h2>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-zinc-400 text-base leading-relaxed font-light"
                        >
                            Intelligent recommendations matched to your lifestyle, budget, and driving habits.
                        </motion.p>

                        {/* Feature pills — same style as landing page */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55, duration: 0.8 }}
                            className="flex flex-wrap gap-3"
                        >
                            {[
                                { icon: Zap, label: "Instant Matching" },
                                { icon: ShieldCheck, label: "Verified Data" },
                                { icon: Star, label: "Top-Rated" },
                            ].map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full text-zinc-300 text-xs font-medium"
                                >
                                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                                    {label}
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Bottom testimonial card — glassmorphism matching landing page cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="bg-[#1c1c21]/60 border border-white/10 backdrop-blur-md rounded-[1.5rem] p-6"
                    >
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-zinc-300 text-zinc-300" />
                            ))}
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed font-light italic">
                            "AutoFyx found my ideal car in minutes. The AI understood exactly what I needed — I saved months of research."
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=100&auto=format&fit=crop"
                                alt="user"
                                className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                            <div>
                                <p className="text-zinc-100 font-semibold text-sm">James R.</p>
                                <p className="text-zinc-500 text-xs">Verified AutoFyx User</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── Right Form Panel ──────────────────────────────────────────── */}
            <div className="w-full lg:w-[48%] flex flex-col justify-center px-6 sm:px-12 xl:px-20 py-12 relative z-10 bg-[#0a0a0c]">

                {/* Subtle right-side ambient glow */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute bottom-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-white/[0.02] rounded-full blur-[100px]" />
                </div>

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-10">
                    <div className="w-9 h-9 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-xl text-zinc-100 tracking-wide">AutoFyx</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md mx-auto"
                >
                    {/* Heading */}
                    <div className="mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-xs font-medium tracking-widest uppercase mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                            Secure Sign In
                        </div>
                        <h1 className="text-3xl xl:text-4xl font-bold text-zinc-100 tracking-tight mb-2">
                            Welcome back
                        </h1>
                        <p className="text-zinc-400 text-base font-light">
                            Sign in to access your vehicle recommendations and saved matches.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                setIsGoogleLoading(true);
                                const nextPath = searchParams.get("next");
                                const redirectPath = nextPath
                                    ? `/login?oauth=google&next=${encodeURIComponent(nextPath)}`
                                    : '/login?oauth=google';
                                await signInWithGoogle(redirectPath);
                            } catch (error) {
                                const message = error instanceof Error ? error.message : 'Google sign-in failed';
                                alert(message);
                                setIsGoogleLoading(false);
                            }
                        }}
                        disabled={isLoading || isGoogleLoading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-zinc-200 hover:bg-white/10 hover:border-white/20 transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                    </button>

                    <div className="flex items-center mb-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="px-4 text-[10px] uppercase font-bold tracking-widest text-zinc-600">or sign in with email</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2 tracking-wide">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full bg-[#16161a]/60 border border-white/10 rounded-xl px-4 py-3.5 text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-[#1c1c21] focus:ring-4 focus:ring-white/5 transition-all disabled:opacity-50 caret-white"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-zinc-400 tracking-wide">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-semibold text-zinc-500 hover:text-zinc-200 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="w-full bg-[#16161a]/60 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-[#1c1c21] focus:ring-4 focus:ring-white/5 transition-all disabled:opacity-50 caret-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit — white on dark, matching landing page CTA style */}
                        <div className="pt-2">
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                className="w-full bg-white hover:bg-zinc-100 disabled:bg-zinc-700 disabled:text-zinc-500 text-black rounded-xl py-4 font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In to AutoFyx
                                        <motion.div
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-8">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="px-4 text-[10px] uppercase font-bold tracking-widest text-zinc-600">New to AutoFyx?</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Register CTA — outlined, matching feature pill style */}
                    <Link
                        href="/register"
                        className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-all group"
                    >
                        Create your free account
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
                    </Link>

                    {/* Legal */}
                    <p className="text-center text-xs text-zinc-600 mt-8 leading-relaxed">
                        By signing in, you agree to our{" "}
                        <a href="#" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">Privacy Policy</a>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
