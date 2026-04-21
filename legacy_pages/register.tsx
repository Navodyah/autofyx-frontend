"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Car, ArrowRight, ShieldCheck, Users, FlaskConical } from "lucide-react";
import { AppwriteException } from "appwrite";

import {
  account,
  completeOtpRegistration,
  getCurrentSession,
  persistBrowserAuthSession,
  registerUser,
  sendEmailOtp,
  setUserRoleLabel,
  signInWithGoogle,
  verifyEmailOtp,
} from "@/lib/appwrite";
import { createBrowserAuthToken, resolvePostLoginPath } from "@/lib/auth-token";

import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [otp, setOtp] = useState("");
  const [otpUserId, setOtpUserId] = useState("");
  const [otpExpire, setOtpExpire] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Show OAuth failure message if Appwrite redirected back with ?error=
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setOauthError(decodeURIComponent(err));
  }, [searchParams]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        left: `${(i * 37 + 13) % 100}%`,
        top: `${(i * 53 + 29) % 100}%`,
        animationDelay: `${((i * 17) % 30) / 10}s`,
        animationDuration: `${2 + ((i * 19) % 20) / 10}s`,
      })),
    []
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      setStatusMessage(null);

      if (step === "details") {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error("Full name, email, and password are required.");
        }

        const otpToken = await sendEmailOtp(email, otpUserId || undefined);
        setOtpUserId(otpToken.userId);
        setOtpExpire(otpToken.expire);
        setStep("otp");
        setStatusMessage("We sent an Appwrite OTP to your email. Enter it below to finish registration.");
      } else {
        if (!otp.trim()) {
          throw new Error("Enter the OTP sent to your email.");
        }

        // Verify OTP and complete Appwrite account setup
        const session = await verifyEmailOtp(otpUserId, otp.trim());
        await completeOtpRegistration(fullName, password);

        // ── Write role as Appwrite label (authoritative source of truth) ──
        const normalizedRole = role.toLowerCase() as 'user' | 'researcher';
        try {
          await setUserRoleLabel(normalizedRole);
        } catch (labelError) {
          console.warn('Failed to set Appwrite role label:', labelError);
        }

        // Save to MongoDB via backend (idempotent upsert)
        const regResult = await registerUser({
          username: fullName,
          email,
          password,
          user_type: role.toLowerCase() as "user" | "admin" | "researcher",
          appwrite_id: otpUserId || undefined,
        });

        const mongoUser = regResult?.user ?? null;
        const userType = (mongoUser?.user_type || normalizedRole);
        const userId = mongoUser?.user_id || "";
        const sessionId = session.$id;

        // Build and persist auth token so the proxy lets the user through
        const token = createBrowserAuthToken({
          user_id: userId,
          appwrite_id: otpUserId || undefined,
          email,
          user_type: userType,
          session_id: sessionId,
        });
        persistBrowserAuthSession(token);
        localStorage.setItem("user_data", JSON.stringify({
          user_id: userId,
          appwrite_id: otpUserId,
          email,
          username: fullName,
          user_type: userType,
        }));
        localStorage.setItem("auth_session", JSON.stringify({
          sessionId,
          timestamp: new Date().toISOString(),
        }));

        setStatusMessage("Registration complete! Redirecting to your dashboard…");
        const dashboardPath = resolvePostLoginPath(userType, null);
        window.setTimeout(() => {
          window.location.replace(dashboardPath);
        }, 800);
      }

    } catch (error) {
      if (error instanceof AppwriteException) {
        console.error("Appwrite registration error:", error);
        alert(error.message || "OTP verification failed");
      } else if (error instanceof Error) {
        console.error("Registration error:", error);
        alert(error.message || "Registration failed");
      } else {
        console.error("Registration error:", error);
        alert("An unexpected error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: "User", label: "User", sub: "Standard access", icon: Users },
    { value: "Researcher", label: "Researcher", sub: "Analytics & insights", icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0a0c] overflow-hidden">

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

      <div className="hidden lg:flex w-[52%] relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0c]/80 via-[#0a0a0c]/40 to-[#0a0a0c]/75" />

        <motion.div
          animate={{ top: ["-10%", "110%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-white/30 shadow-[0_0_15px_rgba(255,255,255,0.6)] z-10"
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-xl tracking-wide">AutoFyx</span>
          </Link>

          <div className="space-y-6 max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-xs font-medium tracking-widest uppercase mb-5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                Join AutoFyx Today
              </div>
              <h2 className="text-white text-4xl xl:text-5xl font-light leading-tight tracking-tight">
                Your perfect match{" "}
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
                  starts here.
                </span>
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-zinc-400 text-base leading-relaxed font-light"
            >
              Create your account and let our AI recommend the ideal vehicle matched to your lifestyle and budget.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8 }}
              className="space-y-3"
            >
              {[
                "Analyse 850+ active vehicle models",
                "OTP-verified secure registration",
                "Personalised AI recommendations",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  </div>
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="bg-[#1c1c21]/60 border border-white/10 backdrop-blur-md rounded-[1.5rem] p-6"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <p className="text-zinc-100 font-semibold text-sm">Email OTP Verified</p>
                <p className="text-zinc-500 text-xs">Powered by Appwrite Auth</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Every account is verified via a one-time passcode sent directly to your email — no passwords stored in plain text.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-[48%] flex flex-col justify-center px-6 sm:px-12 xl:px-20 py-12 relative z-10 bg-[#0a0a0c] overflow-y-auto">

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-white/[0.02] rounded-full blur-[100px]" />
        </div>

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
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-zinc-400 text-xs font-medium tracking-widest uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
              {step === "otp" ? "Verify Email" : "Create Account"}
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-zinc-100 tracking-tight mb-2">
              {step === "otp" ? "Check your inbox" : "Get started"}
            </h1>
            <p className="text-zinc-400 text-base font-light">
              {step === "otp"
                ? `We sent a 6-digit code to ${email}`
                : "Create your AutoFyx account to start finding your perfect vehicle."}
            </p>
          </div>

          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium flex items-start gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0 animate-pulse" />
              {statusMessage}
            </motion.div>
          )}

          {/* OAuth error banner */}
          {oauthError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <p className="text-red-300 text-sm leading-relaxed">{oauthError}</p>
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsGoogleLoading(true);
                  setStatusMessage(null);
                  setOauthError(null);
                  await signInWithGoogle();
                  // Note: signInWithGoogle triggers a full-page redirect to Google.
                  // Execution does not continue past this point.
                } catch (error) {
                  const message = error instanceof Error ? error.message : 'Google sign-in failed';
                  setOauthError(message);
                  setIsGoogleLoading(false);
                }
              }}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-zinc-200 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              <GoogleIcon />
              {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
            </button>

            <AnimatePresence mode="wait">
              {step === "details" ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-zinc-400 mb-2 tracking-wide">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                      required
                      className="w-full bg-[#16161a]/60 border border-white/10 rounded-xl px-4 py-3.5 text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-[#1c1c21] focus:ring-4 focus:ring-white/5 transition-all disabled:opacity-50 caret-white"
                    />
                  </div>

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

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-2 tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
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

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2 tracking-wide">
                      Account Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map(({ value, label, sub, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRole(value)}
                          disabled={isLoading}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                            role === value
                              ? "bg-white/10 border-white/30 text-zinc-100"
                              : "bg-[#16161a]/60 border-white/10 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold">{label}</span>
                          <span className="text-[10px] leading-tight opacity-70">{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-zinc-400 mb-2 tracking-wide">
                      Email OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      placeholder="Enter the code from your email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.trim())}
                      disabled={isLoading}
                      className="w-full bg-[#16161a]/60 border border-white/10 rounded-xl px-4 py-3.5 text-zinc-100 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-[#1c1c21] focus:ring-4 focus:ring-white/5 transition-all disabled:opacity-50 caret-white tracking-[0.3em] text-center text-lg"
                    />
                    <p className="text-xs text-zinc-600 mt-2">
                      OTP requested for {email}.{otpExpire ? ` Expires at ${new Date(otpExpire).toLocaleString()}.` : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        setStatusMessage(null);
                        try {
                          const otpToken = await sendEmailOtp(email, otpUserId || undefined);
                          setOtpUserId(otpToken.userId);
                          setOtpExpire(otpToken.expire);
                          setStatusMessage("A new OTP has been sent to your email.");
                        } catch (error) {
                          const message = error instanceof Error ? error.message : "Failed to resend OTP";
                          alert(message);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setStep("details");
                        setOtp("");
                        setStatusMessage(null);
                      }}
                      className="py-3 rounded-xl bg-transparent border border-white/10 text-sm font-semibold text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit Details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                    {step === "otp" ? "Verifying OTP..." : "Sending OTP..."}
                  </>
                ) : (
                  <>
                    {step === "otp" ? "Verify OTP & Create Account" : "Send Email OTP"}
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

          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="px-4 text-[10px] uppercase font-bold tracking-widest text-zinc-600">Have an account?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            Sign in here
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
          </Link>

          <p className="text-center text-xs text-zinc-600 mt-8 leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.652 32.657 29.4 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.967 3.036l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.967 3.036l5.657-5.657C34.046 6.053 29.278 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.207 0 9.897-1.995 13.466-5.244l-6.21-5.236C29.148 35.091 26.715 36 24 36c-5.379 0-9.625-3.322-11.289-7.957l-6.521 5.025C9.503 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.08 12.08 0 0 1-4.047 5.52l.003-.002 6.21 5.236C36.97 36.804 40 31.2 40 24c0-1.341-.138-2.651-.389-3.917z" />
    </svg>
  );
}
