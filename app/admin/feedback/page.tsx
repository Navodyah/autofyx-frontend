"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Mail, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface Feedback {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const response = await fetch("/api/feedback");
        const data = await response.json();
        if (data.feedbacks) {
          setFeedbacks(data.feedbacks);
        }
      } catch (error) {
        console.error("Failed to fetch feedbacks", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedbacks();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Feedback</h1>
          <p className="text-slate-500 mt-1">Review messages and inquiries from the contact page</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-sm border border-blue-100">
          <MessageSquare size={18} />
          <span>{feedbacks.length} Messages</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No feedback yet</h3>
          <p className="text-slate-500">Messages sent via the contact form will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {feedbacks.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={item._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex flex-shrink-0 items-center justify-center font-bold text-lg shadow-sm border border-blue-200">
                  {item.firstName.charAt(0)}{item.lastName?.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        {item.firstName} {item.lastName}
                      </h3>
                      <a href={`mailto:${item.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                        <Mail size={14} />
                        {item.email}
                      </a>
                    </div>
                    <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap border border-slate-200 shadow-sm">
                      <Calendar size={14} />
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl text-slate-700 whitespace-pre-wrap text-sm border border-slate-100 leading-relaxed">
                    {item.message}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
