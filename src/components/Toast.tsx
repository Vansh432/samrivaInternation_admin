import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: ToastKind };

const ToastContext = createContext<{ show: (message: string, kind?: ToastKind) => void } | null>(null);

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-emerald" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-slate-500" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            {ICONS[t.kind]}
            <span className="text-sm font-medium text-slate-700">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
