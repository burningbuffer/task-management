"use client";

import React from "react";
import { useNotification } from "@/components/providers/NotificationProvider";

/**
 * Componente de feedback visual exibido no topo da página
 * para mensagens de sucesso e erro (ex.: após excluir uma tarefa)
 */
export function TopNotificationBanner() {
  const { notification, clearNotification } = useNotification();

  if (!notification) return null;

  const isSuccess = notification.type === "success";
  const isError = notification.type === "error";

  return (
    <aside
      aria-label="Notificações do sistema"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      <div
        role="alert"
        className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all ${
          isSuccess
            ? "bg-emerald-950/95 border-emerald-500/80 text-emerald-100 shadow-emerald-950/60"
            : isError
            ? "bg-red-950/95 border-red-500/80 text-red-100 shadow-red-950/60"
            : "bg-neutral-900/95 border-neutral-700 text-neutral-100 shadow-black/60"
        }`}
      >
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}

          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-75">
              {isSuccess ? "Sucesso na operação" : isError ? "Erro na operação" : "Aviso"}
            </p>
            <p className="text-sm font-medium leading-relaxed">{notification.message}</p>
          </div>
        </div>

        <button
          onClick={clearNotification}
          className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          title="Fechar notificação"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
