"use client";

import React, { useState } from "react";
import { Task } from "@/server/types/task";
import { TaskEditModal } from "./TaskEditModal";
import { TaskDeleteModal } from "./TaskDeleteModal";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(task.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(task.dateCreation));

  return (
    <>
      <div className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-5 transition-all shadow-sm group space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 className="text-base font-semibold text-white break-words">
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p className="text-sm text-neutral-300 mt-1 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-neutral-800/80 text-xs text-neutral-400">
              {/* ID Badge */}
              <div className="flex items-center gap-1.5 font-mono bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                <span className="text-neutral-500">id:</span>
                <span
                  className="text-neutral-300 truncate max-w-[140px] sm:max-w-[200px]"
                  title={task.id}
                >
                  {task.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  title="Copiar ID da tarefa"
                  className="hover:text-white transition-colors cursor-pointer ml-1"
                >
                  {copied ? (
                    <span className="text-green-400 text-[10px] font-sans font-medium">
                      Copiado!
                    </span>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* dateCreation Badge */}
              <div className="flex items-center gap-1.5 text-neutral-400">
                <svg
                  className="w-3.5 h-3.5 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                </svg>
                <span>Criada em: {formattedDate}</span>
                <span className="text-neutral-600 font-mono text-[10px]">
                  ({task.dateCreation})
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botão de Editar */}
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
              title="Editar tarefa"
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            {/* Botão de Excluir: Abre modal de confirmação com textbox */}
            <button
              onClick={() => setIsDeleting(true)}
              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded-xl transition-all cursor-pointer"
              title="Excluir tarefa"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <TaskEditModal
        task={task}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />

      {/* Modal com Textbox de Confirmação para Exclusão */}
      <TaskDeleteModal
        task={task}
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
      />
    </>
  );
}
