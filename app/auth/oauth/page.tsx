"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Car, Users, FlaskConical } from "lucide-react";
import {
    account,
    persistBrowserAuthSession,
    getCurrentSession,
} from "@/lib/appwrite";
import { createBrowserAuthToken, resolvePostLoginPath } from "@/lib/auth-token";
import { motion, AnimatePresence } from "framer-motion";

type Step = "loading" | "pick-role" | "saving" | "error";
type Role = "user" | "researcher";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ROLES: { value: Role; label: string; sub: string; icon: React.ElementType }[] = [
    { value: "user", label: "User", sub: "Standard access", icon: Users },
    { value: "researcher", label: "Researcher", sub: "Analytics & insights", icon: FlaskConical },
];

/**
 * Call the backend /users/register endpoint with a timeout.
 * Returns null if it fails or times out.
 */
async function syncUserWithBackend(body: {
    username: string;
    email: string;
    password: string;
    user_type: string;
    appwrite_id: string;
}): Promise<{ user_id: string; username: string; user_type: string } | null> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        console.log("[OAuth] Syncing with backend:", API_BASE_URL + "/users/register", body);

        const resp = await fetch(`${API_BASE_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        console.log("[OAuth] Backend response status:", resp.status);

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            console.warn("[OAuth] Backend register returned error:", resp.status, err);
            return null;
        }

        const data = await resp.json();
        console.log("[OAuth] Backend register result:", data);

        const user = data?.user;
        if (user?.user_id) {
            return {
                user_id: user.user_id,
                username: user.username || body.username,
                user_type: (user.user_type || body.user_type || "user").toLowerCase(),
            };
        }
        return null;
    } catch (err) {
        console.warn("[OAuth] Backend sync failed (will show role picker):", err);
        return null;
    }
}

/**
 * /auth/oauth — Appwrite redirects here after a successful Google OAuth.
 *
 * Flow:
 *  1. Get the Appwrite session & user.
 *  2. Sync with MongoDB: if user already exists, redirect directly.
 *  3. If new user, show role picker → save to MongoDB → redirect.
 */
function OAuthCallbackContent() {
    const searchParams = useSearchParams();
    const handled = useRef(false);

    const [step, setStep] = useState<Step>("loading");
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role>("user");

    const [pendingAuth, setPendingAuth] = useState<{
        appwriteId: string;
        sessionId: string;
        email: string;
        displayName: string;
    } | null>(null);

    // ── Step 1: Get Appwrite session ──────────────────────────────────────
    useEffect(() => {
        if (handled.current) return;
        handled.current = true;

        const next = searchParams.get("next");

        const init = async () => {
            try {
                console.log("[OAuth] Starting auth finalization...");

                // Wait for Appwrite session to be ready
                let appwriteUser = null;
                for (let i = 0; i < 15; i++) {
                    try {
                        appwriteUser = await account.get();
                        if (appwriteUser?.$id) {
                            console.log("[OAuth] Appwrite user found on attempt", i + 1, appwriteUser.$id);
                            break;
                        }
                    } catch {
                        console.log("[OAuth] account.get() attempt", i + 1, "failed, retrying...");
                    }
                    await new Promise((r) => setTimeout(r, 400));
                }

                if (!appwriteUser?.$id) {
                    throw new Error("Google sign-in session not found after 15 attempts. Please try again.");
                }

                let sessionId = "";
                try {
                    const sess = await getCurrentSession();
                    sessionId = sess?.$id || "";
                } catch {
                    console.warn("[OAuth] Could not get session ID");
                }

                const appwriteId = appwriteUser.$id;
                const email = (appwriteUser.email || "").toLowerCase().trim();
                const displayName = appwriteUser.name || email.split("@")[0];

                console.log("[OAuth] User:", { appwriteId, email, displayName, sessionId });

                // Try to sync/fetch from MongoDB
                const mongoUser = await syncUserWithBackend({
                    username: displayName,
                    email,
                    password: `oauth-${appwriteId}`,
                    user_type: "user",
                    appwrite_id: appwriteId,
                });

                if (mongoUser?.user_id) {
                    // Existing user → go straight to dashboard
                    console.log("[OAuth] Existing user found, redirecting...", mongoUser);
                    finalizeAndRedirect({
                        appwriteId,
                        sessionId,
                        email,
                        displayName: mongoUser.username || displayName,
                        userType: mongoUser.user_type as Role,
                        userId: mongoUser.user_id,
                        next,
                    });
                    return;
                }

                // New user or backend unreachable → show role picker
                console.log("[OAuth] No existing MongoDB user found. Showing role picker.");
                setPendingAuth({ appwriteId, sessionId, email, displayName });
                setStep("pick-role");

            } catch (err) {
                console.error("[OAuth] Init error:", err);
                setError(err instanceof Error ? err.message : "Authentication failed");
                setStep("error");
            }
        };

        void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Step 2: User picks a role → save to MongoDB ──────────────────────
    const handleRoleConfirm = async () => {
        if (!pendingAuth) return;
        setStep("saving");
        const next = searchParams.get("next");

        try {
            console.log("[OAuth] Saving role:", selectedRole);

            const mongoUser = await syncUserWithBackend({
                username: pendingAuth.displayName,
                email: pendingAuth.email,
                password: `oauth-${pendingAuth.appwriteId}`,
                user_type: selectedRole,
                appwrite_id: pendingAuth.appwriteId,
            });

            const userId = mongoUser?.user_id || "";
            const userType = mongoUser?.user_type || selectedRole;

            console.log("[OAuth] Saved. Redirecting with role:", userType);

            finalizeAndRedirect({
                appwriteId: pendingAuth.appwriteId,
                sessionId: pendingAuth.sessionId,
                email: pendingAuth.email,
                displayName: mongoUser?.username || pendingAuth.displayName,
                userType,
                userId,
                next,
            });
        } catch (err) {
            console.error("[OAuth] Save error:", err);
            setError(err instanceof Error ? err.message : "Failed to save your profile");
            setStep("error");
        }
    };

    // ── Build token, persist, redirect ────────────────────────────────────
    function finalizeAndRedirect(opts: {
        appwriteId: string;
        sessionId: string;
        email: string;
        displayName: string;
        userType: string;
        userId: string;
        next: string | null;
    }) {
        const { appwriteId, sessionId, email, displayName, userType, userId, next } = opts;

        const token = createBrowserAuthToken({
            user_id: userId,
            appwrite_id: appwriteId,
            email,
            user_type: userType,
            session_id: sessionId,
        });
        persistBrowserAuthSession(token);

        const resolvedUser = {
            user_id: userId,
            appwrite_id: appwriteId,
            email,
            username: displayName,
            user_type: userType,
        };
        localStorage.setItem("user_data", JSON.stringify(resolvedUser));
        localStorage.setItem("auth_session", JSON.stringify({
            sessionId,
            timestamp: new Date().toISOString(),
        }));

        // Determine correct dashboard
        const destination = resolvePostLoginPath(userType, next);
        // Safety: never redirect back to auth pages
        const authPrefixes = ["/login", "/register", "/auth/"];
        const safeDestination = authPrefixes.some((p) => destination.startsWith(p))
            ? resolvePostLoginPath(userType, null)
            : destination;

        console.log("[OAuth] Final redirect to:", safeDestination);
        window.location.replace(safeDestination);
    }

    // ─────────────────────────────────────────────────────────────────────
    // UI
    // ─────────────────────────────────────────────────────────────────────

    if (step === "error") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] gap-6 px-6">
                <Logo />
                <div className="bg-[#1c1c21]/70 border border-red-500/20 rounded-2xl p-8 max-w-sm w-full text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-zinc-100 font-semibold text-lg mb-2">Sign-in Failed</h2>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">{error}</p>
                    <a href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-sm font-semibold hover:bg-zinc-100 transition-colors">
                        Back to Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c]">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#2a2a30]/20 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-6 px-6 w-full max-w-sm">
                <Logo />

                <AnimatePresence mode="wait">
                    {/* ── Spinner (loading / saving) ── */}
                    {(step === "loading" || step === "saving") && (
                        <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                            <div className="relative w-14 h-14">
                                <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                                <div className="absolute inset-0 rounded-full border-2 border-t-white/60 border-r-white/20 border-b-transparent border-l-transparent animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-zinc-200 font-medium text-base">
                                    {step === "saving" ? "Saving your profile…" : "Completing sign-in"}
                                </p>
                                <p className="text-zinc-500 text-sm mt-1">
                                    {step === "saving" ? "Almost there!" : "Finalizing your Google authentication…"}
                                </p>
                            </div>
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Role picker ── */}
                    {step === "pick-role" && (
                        <motion.div
                            key="role-picker"
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full bg-[#1c1c21]/80 border border-white/10 backdrop-blur-xl rounded-2xl p-7 shadow-2xl"
                        >
                            <div className="mb-6 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-xs font-medium tracking-widest uppercase mb-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                                    One last step
                                </div>
                                <h2 className="text-zinc-100 font-bold text-xl mb-1">Choose your account type</h2>
                                <p className="text-zinc-500 text-sm">Select how you&apos;ll be using AutoFyx</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {ROLES.map(({ value, label, sub, icon: Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setSelectedRole(value)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                                            selectedRole === value
                                                ? "bg-white/10 border-white/30 text-zinc-100"
                                                : "bg-[#16161a]/60 border-white/10 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                                        }`}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-xs font-semibold">{label}</span>
                                        <span className="text-[10px] leading-tight opacity-70">{sub}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleRoleConfirm}
                                className="w-full bg-white hover:bg-zinc-100 text-black rounded-xl py-3.5 font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                            >
                                Continue as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c]" />}>
            <OAuthCallbackContent />
        </Suspense>
    );
}

function Logo() {
    return (
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-xl tracking-wide">AutoFyx</span>
        </div>
    );
}
