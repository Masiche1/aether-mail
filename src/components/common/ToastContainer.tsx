import React from 'react';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  X,
  ArrowRight,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();
  const { setActiveTab } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notification-system"
      aria-live="polite"
      className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] sm:w-[420px] pointer-events-none"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        const borderColor = isError
          ? 'border-rose-500/60 shadow-rose-950/40'
          : isWarning
          ? 'border-amber-500/60 shadow-amber-950/40'
          : isSuccess
          ? 'border-emerald-500/60 shadow-emerald-950/40'
          : 'border-[#D4AF37]/60 shadow-[#D4AF37]/20';

        const accentBg = isError
          ? 'bg-rose-500/15 text-rose-400'
          : isWarning
          ? 'bg-amber-500/15 text-amber-400'
          : isSuccess
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-[#D4AF37]/15 text-[#D4AF37]';

        const Icon = isError
          ? AlertOctagon
          : isWarning
          ? AlertTriangle
          : isSuccess
          ? CheckCircle2
          : Info;

        const handleActionClick = () => {
          if (toast.actionTab) {
            setActiveTab(toast.actionTab);
          }
          if (toast.onAction) {
            toast.onAction();
          }
          dismissToast(toast.id);
        };

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto bg-[#0C0C0C]/95 backdrop-blur-md border ${borderColor} rounded-2xl p-4 shadow-2xl transition-all duration-300 transform translate-y-0 relative overflow-hidden`}
          >
            {/* Top glowing bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-[2px] ${
                isError
                  ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-transparent'
                  : isWarning
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-transparent'
                  : isSuccess
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent'
                  : 'bg-gradient-to-r from-[#D4AF37] via-amber-300 to-transparent'
              }`}
            />

            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl ${accentBg} border border-white/10 flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold font-serif text-white tracking-wide truncate">
                    {toast.title}
                  </h4>
                  <span className="text-[10px] text-white/40 font-mono shrink-0">
                    {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-white/70 mt-1 font-light leading-relaxed break-words">
                  {toast.message}
                </p>

                {toast.actionLabel && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      id={`toast-action-${toast.id}`}
                      onClick={handleActionClick}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold font-serif uppercase tracking-wider transition-all shadow-md ${
                        isError
                          ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20'
                          : isWarning
                          ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                          : 'bg-[#D4AF37] text-black hover:bg-white shadow-[#D4AF37]/20'
                      }`}
                    >
                      <span>{toast.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => dismissToast(toast.id)}
                      className="px-2 py-1.5 rounded-lg text-[11px] text-white/50 hover:text-white hover:bg-white/5 transition-colors font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              <button
                id={`toast-close-${toast.id}`}
                onClick={() => dismissToast(toast.id)}
                className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 -mr-1 -mt-1"
                title="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
