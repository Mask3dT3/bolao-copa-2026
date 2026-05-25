"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X, Trophy } from "lucide-react";

type ToastTipo = "success" | "error" | "info" | "trophy";

type Toast = {
  id: number;
  tipo: ToastTipo;
  titulo: string;
  mensagem?: string;
};

type ToastContextType = {
  toast: (tipo: ToastTipo, titulo: string, mensagem?: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (tipo: ToastTipo, titulo: string, mensagem?: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, tipo, titulo, mensagem }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 4000);
    },
    []
  );

  function removerToast(id: number) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  const icones = {
    success: <CheckCircle2 size={18} className="text-green-400" />,
    error: <AlertCircle size={18} className="text-red-400" />,
    info: <Info size={18} className="text-blue-400" />,
    trophy: <Trophy size={18} className="text-[var(--gold)]" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-enter scorecard rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 min-w-[280px]"
          >
            <div className="flex-shrink-0 mt-0.5">{icones[t.tipo]}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{t.titulo}</div>
              {t.mensagem && (
                <div className="text-xs text-secondary mt-0.5">{t.mensagem}</div>
              )}
            </div>
            <button
              onClick={() => removerToast(t.id)}
              className="flex-shrink-0 text-muted hover:text-primary"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
