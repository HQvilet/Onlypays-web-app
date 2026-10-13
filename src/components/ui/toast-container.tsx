"use client";

import React from "react";
import { useUIStore } from "@/store/use-ui-store";

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const bgColors = {
          success: "bg-emerald-600 text-white border-emerald-700",
          error: "bg-rose-600 text-white border-rose-700",
          warning: "bg-amber-600 text-white border-amber-700",
          info: "bg-slate-900 text-white border-slate-800",
        };

        const icons = {
          success: "✓",
          error: "✕",
          warning: "⚠",
          info: "ℹ",
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-center justify-between gap-3 text-xs font-medium animate-fadeIn ${
              bgColors[toast.type]
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm">{icons[toast.type]}</span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity ml-2 text-sm font-bold"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
