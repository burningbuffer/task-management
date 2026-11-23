"use client";

import React from "react";
import { Task } from "@/server/types/task";
import { trpc } from "@/utils/trpc";
import { useNotification } from "@/components/providers/NotificationProvider";

interface TaskDeleteModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDeleteModal({ task, isOpen, onClose }: TaskDeleteModalProps) {
  const { notifySuccess, notifyError } = useNotification();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.task.delete.useMutation({
    onSuccess: () => {
      utils.task.getAll.invalidate();
      notifySuccess(`Tarefa "${task.title}" foi excluída com sucesso!`);
      onClose();
    },
    onError: (err) => {
      notifyError(err.message || `Erro ao excluir a tarefa "${task.title}".`);
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate({ id: task.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header da Caixa de Confirmação */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/90 border border-red-800 text-red-400 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirmar Exclusão</h3>
              <p className="text-xs text-neutral-400">Esta ação não poderá ser desfeita</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <svg
              className="w-5 h-5"
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

        {/* Detalhes da Tarefa */}
        <div className="space-y-1.5 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
          <p className="text-xs text-neutral-400">
            Tem certeza de que deseja excluir a seguinte tarefa?
          </p>
          <p className="text-sm font-semibold text-white break-words">{task.title}</p>
          {task.description && (
            <p className="text-xs text-neutral-400 line-clamp-2">{task.description}</p>
          )}
          <p className="text-[11px] font-mono text-neutral-500 pt-1">ID: {task.id}</p>
        </div>

        {/* Botões Confirmar e Cancelar */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2.5 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-red-950/40 flex items-center gap-2 cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <>
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Excluindo...
              </>
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
