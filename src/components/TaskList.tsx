"use client";

import React, { useState, useMemo } from "react";
import { trpc } from "@/utils/trpc";
import { Task } from "@/server/types/task";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  initialTasks?: Task[];
}

export function TaskList({ initialTasks = [] }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("oldest");

  // Utiliza os dados pré-carregados via SSR (Server-Side Rendering) como initialData
  const { data: tasks, isLoading, error, refetch, isRefetching } =
    trpc.task.getAll.useQuery(undefined, {
      initialData: initialTasks,
    });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    let list = [...tasks];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term)) ||
          t.id.toLowerCase().includes(term)
      );
    }

    if (sortBy === "newest") {
      list.sort((a, b) => b.dateCreation - a.dateCreation);
    } else if (sortBy === "oldest") {
      list.sort((a, b) => a.dateCreation - b.dateCreation);
    } else if (sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [tasks, searchTerm, sortBy]);

  return (
    <div className="space-y-4">
      {/* List Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Tarefas Cadastradas</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
            {tasks ? tasks.length : 0}
          </span>
          {initialTasks.length > 0 && (
            <span
              className="text-[11px] text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded-full"
              title="Tarefas pré-carregadas pelo servidor no carregamento inicial da página"
            >
              SSR Pré-carregado
            </span>
          )}
          {isRefetching && (
            <span className="text-xs text-neutral-500 animate-pulse">
              Atualizando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar título ou descrição..."
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="w-4 h-4 text-neutral-500 absolute left-2.5 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
            </svg>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "title")}
            className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none cursor-pointer"
          >
            <option value="newest">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="title">Título (A-Z)</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            title="Recarregar tarefas"
            className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin text-blue-400" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading state (apenas exibido se não houver dados pré-carregados) */}
      {isLoading && !tasks && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 animate-pulse"
            >
              <div className="h-5 bg-neutral-800 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-neutral-800/60 rounded w-2/3 mb-4"></div>
              <div className="h-3 bg-neutral-800/40 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 bg-red-950/40 border border-red-800 rounded-2xl text-center space-y-2">
          <p className="text-red-300 font-medium">Erro ao carregar tarefas</p>
          <p className="text-xs text-red-400">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-800/60 hover:bg-red-800 text-white rounded-xl text-xs font-semibold transition-colors mt-2"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty states */}
      {!isLoading && !error && tasks && tasks.length === 0 && (
        <div className="bg-neutral-900 border border-dashed border-neutral-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 text-xl font-bold">
            ✓
          </div>
          <h3 className="text-base font-semibold text-white">Nenhuma tarefa encontrada</h3>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto">
            A lista em memória está vazia. Crie uma nova tarefa pelo formulário acima para começar.
          </p>
        </div>
      )}

      {!isLoading && !error && tasks && tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm text-neutral-300">
            Nenhuma tarefa encontrada para a busca &quot;{searchTerm}&quot;.
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-blue-400 hover:underline"
          >
            Limpar busca
          </button>
        </div>
      )}

      {/* Tasks list */}
      {filteredTasks.length > 0 && (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
