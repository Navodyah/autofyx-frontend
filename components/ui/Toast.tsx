'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface Props {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
  error:   <XCircle      className="w-5 h-5 text-red-400 shrink-0" />,
  info:    <Info         className="w-5 h-5 text-blue-400 shrink-0" />,
};

const styles = {
  success: { border: 'rgba(52,211,153,0.25)', bg: 'rgba(16,185,129,0.08)', bar: '#34d399' },
  error:   { border: 'rgba(248,113,113,0.25)', bg: 'rgba(239,68,68,0.08)',  bar: '#f87171' },
  info:    { border: 'rgba(96,165,250,0.25)',  bg: 'rgba(59,130,246,0.08)', bar: '#60a5fa' },
};

function Toast({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const s = styles[item.type];

  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), 4500);
    return () => clearTimeout(t);
  }, [item.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="relative w-[340px] max-w-[90vw] rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
      style={{ background: 'rgba(15,17,26,0.96)', border: `1px solid ${s.border}`, backdropFilter: 'blur(16px)' }}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
        transition={{ duration: 4.5, ease: 'linear' }}
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
        style={{ background: s.bar }}
      />
      {/* Glow bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: s.bg }} />

      <div className="relative flex items-start gap-3 px-4 py-3.5">
        {icons[item.type]}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white leading-tight">{item.title}</p>
          {item.message && (
            <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{item.message}</p>
          )}
        </div>
        <button onClick={() => onRemove(item.id)} className="text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5 shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map(t => (
          <Toast key={t.id} item={t} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Hook ── */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = (type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return {
    toasts,
    remove,
    success: (title: string, message?: string) => add('success', title, message),
    error:   (title: string, message?: string) => add('error',   title, message),
    info:    (title: string, message?: string) => add('info',    title, message),
  };
}
