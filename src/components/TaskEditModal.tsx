"use client";

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Task } from "@/server/types/task";

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskEditModal({ task, isOpen, onClose }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const updateMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      utils.task.getAll.invalidate();
      onClose();
    },
    onError: (err) => {
      setErrorMessage(err.message || "Erro ao atualizar tarefa");
    },
  });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setErrorMessage("O título é obrigatório.");
      return;
    }

    setErrorMessage(null);
    updateMutation.mutate({
      id: task.id,
      title: cleanTitle,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-lg font-semibold text-white">Editar Tarefa</h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">ID: {task.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
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

        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-xs font-medium text-neutral-300 mb-1"
            >
              Título <span className="text-red-400">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              disabled={updateMutation.isPending}
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-xs font-medium text-neutral-300 mb-1"
            >
              Descrição <span className="text-neutral-500">(opcional)</span>
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-y"
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-xl text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !title.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl text-sm font-medium transition-all shadow-md"
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
