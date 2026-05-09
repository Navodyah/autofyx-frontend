"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldAlert, ArrowRight, Lock, Activity, ShieldCheck } from "lucide-react";
import {
    loginUser,
    performFullLogout,
    persistBrowserAuthSession,
} from "@/lib/appwrite";
import { createBrowserAuthToken, resolvePostLoginPath } from "@/lib/auth-token";
import { motion } from "framer-motion";

function AdminLoginContent() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const searchParams = useSearchParams();

    useEffect(() => {
        const err = searchParams.get("error");
        if (err) setErrorMsg(decodeURIComponent(err));
    }, [searchParams]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);
        try {
            // Backend /users/login authenticates against Appwrite and returns Appwrite session/user details.
            const response = await loginUser({
                email: email.trim().toLowerCase(),
                password,
            });

            const sessionId = response.session_id || "";
            const user = response.user;
            const userType = (user?.user_type || "").toLowerCase();

            // Access control: only admin users are allowed here.
            if (userType !== 'admin') {
                await performFullLogout(sessionId || undefined);
                throw new Error("Access Denied: Administrator privileges required.");
            }

            // Build and persist auth token for proxy.ts role-based authorization.
            const token = createBrowserAuthToken({
                user_id: user?.user_id,
                appwrite_id: user?.appwrite_id,
                email: email.trim().toLowerCase(),
                user_type: userType,
                session_id: sessionId || undefined,
            });
            persistBrowserAuthSession(token);

            // Persist user session metadata for client-side auth context.
            localStorage.setItem("user_data", JSON.stringify({
                user_id: user?.user_id || "",
                appwrite_id: user?.appwrite_id || "",
                email: email.trim().toLowerCase(),
                username: user?.username || email.trim().toLowerCase().split("@")[0],
                user_type: userType,
            }));
            localStorage.setItem("auth_session", JSON.stringify({
                sessionId,
                timestamp: new Date().toISOString(),
            }));

            // Redirect only to admin-allowed destinations.
            const redirectPath = resolvePostLoginPath("admin", searchParams.get("next"));
            window.location.replace(redirectPath);

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Login failed";
            if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("password")) {
                setErrorMsg("Invalid credentials. Please verify your admin access.");
            } else {
                setErrorMsg(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#030304] overflow-hidden">
            {/* ── Ambient background glow ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" as const }}
                    className="absolute top-[-20%] right-[-10%] w-[900px] h-[700px] bg-red-900/10 blur-[150px] rounded-full"
                />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                        backgroundSize: "4rem 4rem",
                    }}
                />
            </div>

            {/* â”€â”€ Left Visual Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="hidden lg:flex w-[52%] relative overflow-hidden">
                <motion.div
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 12, ease: "easeOut" as const }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#030304]/90 via-[#030304]/60 to-[#030304]/80" />
                <motion.div
                    animate={{ top: ["-10%", "110%"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" as const }}
                    className="absolute left-0 right-0 h-[1px] bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.6)] z-10"
                />
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <div className="flex items-center gap-3 group w-fit cursor-default">
                        <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-white font-semibold text-xl tracking-wide">AutoFyx <span className="text-blue-500 font-bold">Admin</span></span>
                    </div>
                    <div className="space-y-6 max-w-md">
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9 }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium tracking-widest uppercase mb-5 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Restricted Portal
                            </div>
                            <h2 className="text-white text-4xl font-light leading-tight tracking-tight">
                                System Administration <br />
                                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                                    Access Control.
                                </span>
                            </h2>
                        </motion.div>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-zinc-400 text-base leading-relaxed font-light">
                            Unauthorized access to this system is strictly prohibited and subject to monitoring.
                        </motion.p>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.8 }} className="flex flex-wrap gap-3">
                            {[
                                { icon: ShieldCheck, label: "Encrypted Auth" },
                                { icon: Lock, label: "Secure Connection" },
                                { icon: Activity, label: "Monitored Session" },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm rounded-full text-zinc-300 text-xs font-medium">
                                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                                    {label}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                    <div />
                </div>
            </div>

            {/* â”€â”€ Right Form Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="w-full lg:w-[48%] flex flex-col justify-center px-6 sm:px-12 xl:px-20 py-12 relative z-10 bg-[#030304]">
                <div className="lg:hidden flex items-center gap-2 mb-10">
                    <div className="w-9 h-9 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-semibold text-xl text-zinc-100 tracking-wide">AutoFyx <span className="text-blue-500">Admin</span></span>
                </div>

                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md mx-auto">
                    <div className="mb-10">
                        <h1 className="text-3xl xl:text-4xl font-bold text-zinc-100 tracking-tight mb-2">Admin Login</h1>
                        <p className="text-zinc-400 text-base font-light">Please authenticate to continue.</p>
                    </div>

                    {/* Error banner */}
                    {errorMsg && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-300 text-sm leading-relaxed font-medium">{errorMsg}</p>
                        </motion.div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2 tracking-wide uppercase text-xs">Admin Email ID</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@autofyx.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-zinc-100 font-medium placeholder:text-zinc-700 focus:outline-none focus:border-[#155dfc]/50 focus:bg-white/10 focus:ring-4 focus:ring-[#155dfc]/20 transition-all disabled:opacity-50 caret-blue-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-zinc-400 tracking-wide uppercase text-xs">Admin Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-zinc-100 font-medium placeholder:text-zinc-700 focus:outline-none focus:border-[#155dfc]/50 focus:bg-white/10 focus:ring-4 focus:ring-[#155dfc]/20 transition-all disabled:opacity-50 caret-blue-500"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors" tabIndex={-1}>
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="pt-4">
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl py-4 font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:cursor-not-allowed shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Authorize Access
                                        <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" as const }}>
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.div>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </form>

                    <div className="mt-12 text-center">
                        <Link href="/login" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-medium">
                            &larr; Return to User Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030304]" />}>
            <AdminLoginContent />
        </Suspense>
    );
}

