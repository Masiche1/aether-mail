import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastNotification, NavigationTab } from '../types';

interface ToastContextType {
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  notifyQueueStall: (details?: { count?: number; reason?: string; onInspect?: () => void }) => void;
  notifySmtpAuthFailure: (details?: { domain?: string; server?: string; code?: string; onFix?: () => void }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (toastData: Omit<ToastNotification, 'id' | 'timestamp'>): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastNotification = {
        ...toastData,
        id,
        timestamp: new Date().toISOString(),
        autoCloseMs: toastData.autoCloseMs !== undefined ? toastData.autoCloseMs : 7000,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 active

      if (newToast.autoCloseMs && newToast.autoCloseMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, newToast.autoCloseMs);
      }

      return id;
    },
    [dismissToast]
  );

  const notifyQueueStall = useCallback(
    (details?: { count?: number; reason?: string; onInspect?: () => void }) => {
      const stalledCount = details?.count || 4;
      const reason = details?.reason || 'Remote ISP rate-limiting greylist (421 4.7.0) detected across active outbound workers.';

      showToast({
        type: 'warning',
        title: 'MTA Campaign Queue Stalled',
        message: `${stalledCount} messages delayed in spool queue. ${reason}`,
        actionLabel: 'Inspect Spool Queue',
        actionTab: 'queue',
        onAction: details?.onInspect,
        autoCloseMs: 10000,
      });
    },
    [showToast]
  );

  const notifySmtpAuthFailure = useCallback(
    (details?: { domain?: string; server?: string; code?: string; onFix?: () => void }) => {
      const domain = details?.domain || 'aethermail.net';
      const code = details?.code || '535 5.7.8 Authentication credentials invalid';

      showToast({
        type: 'error',
        title: 'SMTP Authentication Failed',
        message: `Handshake rejected on ${domain} (${code}). Outbound worker halted dispatch to prevent domain reputation damage.`,
        actionLabel: 'Diagnose SMTP Domain',
        actionTab: 'diagnostics',
        onAction: details?.onFix,
        autoCloseMs: 12000,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        clearAllToasts,
        notifyQueueStall,
        notifySmtpAuthFailure,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
