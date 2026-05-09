"use client";

import { motion } from "framer-motion";
import { Car, Mail, Facebook, Twitter, Send, MapPin, Phone, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideUp: any = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  return (
    <>
      <LoadingScreen duration={1500} />
      <div className="min-h-screen bg-[#0a0a0c] text-zinc-50 font-sans selection:bg-zinc-800 selection:text-white overflow-hidden">
      {/* Absolute Ambient Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-30%] w-[1000px] h-[800px] bg-[#2a2a30]/15 blur-[150px] rounded-[100%] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <motion.section
        className="relative z-10 pt-48 pb-20 md:pt-56 md:pb-24 px-6"
      >
        <div className="max-w-[88rem] mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 text-xs font-medium tracking-widest uppercase mb-8 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Get in Touch
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={slideUp}
            className="text-5xl md:text-7xl font-light tracking-tight text-white mb-8 leading-[1.1] text-center w-full"
          >
            We&apos;re here to <br className="hidden md:block" />
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 relative">
              accelerate your search.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl text-center mb-16 font-light leading-relaxed"
          >
            Have a question about our recommendation engine, your account, or partnerships? Reach out to our team below.
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Grid Section */}
      <section className="relative z-10 py-20 bg-[#0a0a0c] overflow-hidden">
        <div className="max-w-[88rem] mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* Contact Form */}
            <motion.div
              variants={slideUp}
              className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-300"
            >
              <h3 className="text-3xl font-semibold text-white mb-8 tracking-tight">Send a Message</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">First Name</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="John" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Last Name</label>
                    <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Email Address</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="john@example.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Message</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>
                
                {submitStatus === "success" && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Message sent successfully! We&apos;ll get back to you soon.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                    Failed to send message. Please try again later.
                  </div>
                )}

                <button disabled={isSubmitting} type="submit" className="mt-4 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Sending..." : "Send Message"}
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <div className="flex flex-col gap-6">
              <motion.div
                variants={slideUp}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex items-start gap-6 transition-all duration-300"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Email Us</h4>
                  <p className="text-zinc-400 mb-3 text-sm">For general inquiries and support, drop us an email.</p>
                  <a href="mailto:support@autofyx.com" className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">support@autofyx.com</a>
                </div>
              </motion.div>

              <motion.div
                variants={slideUp}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex items-start gap-6 transition-all duration-300"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Headquarters</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    AutoFyx Inc.<br />
                    120 Innovation Drive<br />
                    Colombo, Sri Lanka 00100
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={slideUp}
                whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                className="bg-gradient-to-br from-[#1c1c21] to-[#0f0f13] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex items-start gap-6 transition-all duration-300"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Call Us</h4>
                  <p className="text-zinc-400 mb-3 text-sm">Available Mon-Fri, 9am - 5pm IST.</p>
                  <a href="tel:+94112345678" className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">+94 11 234 5678</a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Creative Footer */}
      <footer className="relative z-10 bg-[#08080a] border-t border-white/5 pt-20 pb-10 mt-10">
        <div className="max-w-[88rem] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 border border-zinc-700 bg-gradient-to-br from-zinc-800 to-black text-white flex items-center justify-center rounded-lg shadow-xl">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">AutoFyx</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                AutoFyx is an intelligent vehicle curation platform designed to help you find the perfect automotive match through data-driven analysis.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-2">Quick Links</h4>
              <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-sm">Home</Link>
              <Link href="/about" className="text-zinc-500 hover:text-white transition-colors text-sm">About Us</Link>
              <Link href="/contact" className="text-zinc-500 hover:text-white transition-colors text-sm">Contact</Link>
            </div>
            <div className="hidden lg:block"></div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-semibold uppercase tracking-widest text-xs mb-2">Connect With Us</h4>
              <div className="flex items-center gap-4 mb-2">
                <motion.a whileHover={{ y: -3 }} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <Facebook className="w-4 h-4" />
                </motion.a>
                <motion.a whileHover={{ y: -3 }} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <Twitter className="w-4 h-4" />
                </motion.a>
                <motion.a whileHover={{ y: -3 }} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                  <Send className="w-4 h-4" />
                </motion.a>
              </div>
              <a href="mailto:contact@autofyx.com" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm">
                <Mail className="w-4 h-4" />
                contact@autofyx.com
              </a>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-600 text-xs tracking-wide">
              © {new Date().getFullYear()} AutoFyx Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <Link href="#" className="text-zinc-600 hover:text-white transition-colors text-xs font-medium">Privacy Policy</Link>
              <Link href="#" className="text-zinc-600 hover:text-white transition-colors text-xs font-medium">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
