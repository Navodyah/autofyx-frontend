"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Car, LogOut, LayoutDashboard, ChevronDown, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { performFullLogout } from "@/lib/appwrite";
import { getDashboardRouteByUserType } from "@/lib/auth-token";

interface LocalUser {
  username: string;
  email: string;
  user_type: "user" | "admin" | "researcher";
  user_id: string;
  appwrite_id: string;
}

/** Extract up to 2 initials from a display name */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Stable gradient colour derived from the username */
function getAvatarGradient(name: string): string {
  const palette = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-sky-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const carXPos = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  /* ── Read auth state from localStorage on mount ── */
  useEffect(() => {
    function readUser() {
      try {
        const rawUser = localStorage.getItem("user_data");
        const rawSession = localStorage.getItem("auth_session");
        if (rawUser && rawSession) {
          setUser(JSON.parse(rawUser) as LocalUser);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }

    readUser();
    // Re-sync when another tab logs in/out
    window.addEventListener("storage", readUser);
    return () => window.removeEventListener("storage", readUser);
  }, []);

  /* ── Scroll detection ── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setDropdownOpen(false);
    try {
      const rawSession = localStorage.getItem("auth_session");
      const sessionId = rawSession ? JSON.parse(rawSession)?.sessionId : null;
      await performFullLogout(sessionId);
    } catch {
      // Best-effort — always clear local state regardless
    } finally {
      setUser(null);
      setLoggingOut(false);
      router.refresh();
    }
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Recommendation", href: "/recommend" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const dashboardRoute = getDashboardRouteByUserType(user?.user_type);
  const initials = user ? getInitials(user.username) : "";
  const avatarGradient = user ? getAvatarGradient(user.username) : "";

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl border-zinc-800/50 py-4"
          : "bg-transparent border-transparent py-8"
      }`}
    >
      <div className="max-w-[88rem] mx-auto px-6 md:px-12 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 md:w-10 md:h-10 border border-zinc-700 bg-gradient-to-br from-zinc-800 to-black text-white flex items-center justify-center rounded-sm">
              <Car className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <span className="text-xl md:text-2xl font-semibold tracking-wide text-zinc-100">AutoFyx</span>
          </motion.div>
        </Link>

        {/* ── Nav Links ── */}
        <div className="hidden lg:flex items-center gap-10 text-sm font-medium text-zinc-400 tracking-wide">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`${isActive ? "text-white" : "hover:text-white"} transition-colors relative group`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-[1px] bg-white transition-all duration-300 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* ── Right Side: Auth-aware ── */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {user ? (
            /* ─── Authenticated ─── */
            <div className="flex items-center gap-3">

              {/* Dashboard quick-link */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:block"
              >
                <Link
                  href={dashboardRoute}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-sm border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-xs tracking-wide"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              </motion.div>

              {/* Avatar button + dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-expanded={dropdownOpen}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  {/* Initials avatar */}
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-[11px] font-black shadow-lg flex-shrink-0 select-none`}
                  >
                    {initials || <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  {/* Username */}
                  <span className="hidden sm:block text-zinc-200 text-xs font-semibold max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                {/* Animated dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-[#111115]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
                    >
                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          {/* Larger avatar in dropdown */}
                          <div
                            className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-sm font-black shadow-lg flex-shrink-0 select-none`}
                          >
                            {initials || <UserIcon className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{user.username}</p>
                            <p className="text-zinc-500 text-xs truncate">{user.email}</p>
                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/25 bg-blue-500/10 text-blue-400">
                              {user.user_type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="py-2">
                        <Link
                          href={dashboardRoute}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                          Go to Dashboard
                        </Link>

                        <div className="my-1 mx-3 h-px bg-white/5" />

                        <button
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {loggingOut ? (
                            <span className="w-4 h-4 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin flex-shrink-0" />
                          ) : (
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                          )}
                          {loggingOut ? "Signing out…" : "Sign Out"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* ─── Guest ─── */
            <>
              <Link
                href="/login"
                className="text-zinc-400 hover:text-white transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-sm tracking-wide"
                >
                  Start Match
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* ── Scroll Progress Bar + Car ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent">
        <motion.div
          style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
          className="absolute inset-0 bg-white/20"
        />
        <motion.div
          style={{ left: carXPos }}
          className="absolute bottom-[-7px] ml-[-16px] flex items-center z-50 pointer-events-none"
        >
          <Car className="w-4 h-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <motion.div
            animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1.5, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-12 h-[1px] bg-gradient-to-l from-white/80 to-transparent ml-1 origin-left"
          />
        </motion.div>
      </div>
    </motion.nav>
  );
}
