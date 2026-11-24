"use client";

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import { useNotification } from "@/components/providers/NotificationProvider";

export function TaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { notifySuccess } = useNotification();
  const utils = trpc.useUtils();

  const createMutation = trpc.task.create.useMutation({
    onSuccess: (newTask) => {
      setTitle("");
      setDescription("");
      setErrorMessage(null);
      utils.task.getAll.invalidate();
      notifySuccess(`Tarefa "${newTask.title}" criada com sucesso!`);
    },
    onError: (err) => {
      setErrorMessage(err.message || "Erro ao criar tarefa");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setErrorMessage("O campo título é obrigatório.");
      return;
    }

    setErrorMessage(null);
    createMutation.mutate({
      title: cleanTitle,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Adicionar Nova Tarefa</h2>
          <p className="text-xs text-neutral-400">
            Preencha os campos para cadastrar uma tarefa em memória via tRPC
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium text-neutral-300 mb-1.5"
          >
            Título <span className="text-red-400 font-bold">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            disabled={createMutation.isPending}
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-xs font-medium text-neutral-300 mb-1.5"
          >
            Descrição <span className="text-neutral-500 font-normal">(opcional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
            disabled={createMutation.isPending}
            className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-700/80 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all resize-y"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-neutral-500">
            * ID e timestamp (dateCreation) são gerados automaticamente
          </span>
          <button
            type="submit"
            disabled={createMutation.isPending || !title.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Salvando...
              </>
            ) : (
              <>
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Criar Tarefa
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
