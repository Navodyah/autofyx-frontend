'use client';

import { useState, useEffect } from "react";
import { MessageSquare, Mail, Calendar, RefreshCw, Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Feedback {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: string;
}

/* ───── Toast ───── */
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed top-5 right-5 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
      {ok ? <CheckCircle size={16} /> : <XCircle size={16} />}{msg}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/feedback");
      const data = await response.json();
      if (data.feedbacks) {
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks", error);
      showToast("Failed to fetch feedbacks.", false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-screen bg-slate-50/20 font-sans text-slate-900">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={22} className="text-blue-600" />User Feedback</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review messages and inquiries from the contact page.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold shadow-sm border border-blue-100">
            <span>{feedbacks.length} Total Messages</span>
          </div>
          <button onClick={fetchFeedbacks}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-500' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading messages...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <MessageSquare className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No feedback yet</h3>
          <p className="text-sm text-slate-500 max-w-sm">Messages sent via the public contact form will appear here once submitted.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={item._id}
              className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
            >
              {/* Avatar Column */}
              <div className="flex-shrink-0 flex items-start">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white">
                  {item.firstName.charAt(0).toUpperCase()}{item.lastName?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* Details Column */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.firstName} {item.lastName}
                    </h3>
                    <a href={`mailto:${item.email}`} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 mt-1">
                      <Mail size={14} /> {item.email}
                    </a>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto">
                    <Calendar size={13} />
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
                
                <div className="bg-slate-50/50 p-5 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100/50">
                  <p className="whitespace-pre-wrap">{item.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
