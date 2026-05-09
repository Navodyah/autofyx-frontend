"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GraduationCap, FlaskConical, User as UserIcon } from "lucide-react";

interface ResearcherApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { academic_role: string; comment: string }) => Promise<void>;
  name: string;
  email: string;
}

export function ResearcherApplicationModal({ isOpen, onClose, onSubmit, name, email }: ResearcherApplicationModalProps) {
  const [role, setRole] = useState("student");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { id: "student", label: "Student", icon: UserIcon },
    { id: "undergraduate", label: "Undergraduate", icon: GraduationCap },
    { id: "researcher", label: "Researcher", icon: FlaskConical },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ academic_role: role, comment });
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#16161a] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">Apply as Researcher</h3>
                  <p className="text-sm text-zinc-400 mt-1">Provide your details to request access</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Applicant Details</p>
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-sm text-zinc-400">{email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Academic Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            role === r.id
                              ? "bg-white/10 border-white/30 text-white"
                              : "bg-[#1c1c21] border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                          }`}
                        >
                          <r.icon className="w-5 h-5 mb-1.5" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-zinc-300 mb-2">
                      Comments / Research Interest
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us briefly about your research..."
                      rows={3}
                      className="w-full bg-[#1c1c21] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 resize-none transition-all"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-white text-black py-3 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
