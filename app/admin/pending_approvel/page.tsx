"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Clock, GraduationCap, FlaskConical, User as UserIcon } from "lucide-react";

interface Application {
  _id: string;
  name: string;
  email: string;
  academic_role: string;
  comment: string;
  status: string;
  created_at: string;
}

export default function PendingApproval() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BackendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${BackendURL}/applications/pending`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      } else {
        setError("Failed to load applications");
      }
    } catch (err) {
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleReview = async (id: string, status: "approved" | "declined") => {
    try {
      const res = await fetch(`${BackendURL}/applications/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        // Remove from list
        setApplications(apps => apps.filter(app => app._id !== id));
      } else {
        alert(data.message || "Review failed");
      }
    } catch (err) {
      alert("Error processing review");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student": return <UserIcon className="w-4 h-4 text-zinc-400" />;
      case "undergraduate": return <GraduationCap className="w-4 h-4 text-zinc-400" />;
      case "researcher": return <FlaskConical className="w-4 h-4 text-zinc-400" />;
      default: return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Pending Approvals</h1>
        <p className="text-slate-500">Review and approve pending researcher access requests.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl">
          {error}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">No Pending Applications</h3>
          <p className="text-slate-500">All caught up! There are no new researcher applications to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{app.name}</h3>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-yellow-200">
                    Pending
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                    {getRoleIcon(app.academic_role)}
                    <span className="capitalize">{app.academic_role}</span>
                  </span>
                  <span>{app.email}</span>
                  <span>{new Date(app.created_at).toLocaleDateString()}</span>
                </div>

                {app.comment && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-600">
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Comment</p>
                    {app.comment}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 md:flex-col lg:flex-row shrink-0">
                <button
                  onClick={() => handleReview(app._id, "declined")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100 font-medium text-sm"
                >
                  <X className="w-4 h-4" />
                  Decline
                </button>
                <button
                  onClick={() => handleReview(app._id, "approved")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100 font-medium text-sm"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
