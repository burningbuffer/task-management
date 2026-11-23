"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { Task } from "@/server/types/task";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  initialTasks?: Task[];
}

const PAGE_SIZE = 5;

export function TaskList({ initialTasks = [] }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("oldest");

  // Quantidade de tarefas visíveis atualmente (começa com 5 tarefas por vez)
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Consulta tRPC com dados pré-carregados pelo SSR
  const { data: tasks, isLoading, error, refetch, isRefetching } =
    trpc.task.getAll.useQuery(undefined, {
      initialData: initialTasks,
    });

  // Lista filtrada e ordenada
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

  // Tarefas que serão renderizadas na tela (mantém as já carregadas e adiciona mais 5 a cada rolagem)
  const visibleTasks = useMemo(() => {
    return filteredTasks.slice(0, visibleCount);
  }, [filteredTasks, visibleCount]);

  const hasMore = visibleCount < filteredTasks.length;

  // Reinicia para 5 tarefas quando o usuário altera filtros de busca ou ordenação
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, sortBy]);

  // Função para carregar mais 5 tarefas mantendo as anteriores
  const handleLoadMore = React.useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredTasks.length));
      setIsLoadingMore(false);
    }, 300);
  }, [hasMore, isLoadingMore, filteredTasks.length]);

  // IntersectionObserver para detectar quando o usuário rola até o final da página
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "150px", // dispara um pouco antes de atingir o final para uma experiência fluida
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, handleLoadMore]);

  return (
    <div className="space-y-4">
      {/* Header com Controles e Contadores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-white">Tarefas</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
              Total: {filteredTasks.length}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              Exibindo <span className="text-white font-semibold">{visibleTasks.length}</span> de{" "}
              <span className="text-white font-semibold">{filteredTasks.length}</span>
            </span>
            {isRefetching && (
              <span className="text-xs text-neutral-500 animate-pulse">
                Atualizando...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
              {/* Campo de Busca */}
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar tarefa..."
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

              {/* Seletor de Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "title")}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="title">Título (A-Z)</option>
              </select>

              {/* Botão de Atualizar */}
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

          {/* Loading inicial (caso não haja SSR) */}
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

          {/* Estado de Erro */}
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

          {/* Estado Vazio Geral */}
          {!isLoading && !error && tasks && tasks.length === 0 && (
            <div className="bg-neutral-900 border border-dashed border-neutral-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 text-xl font-bold">
                ✓
              </div>
              <h3 className="text-base font-semibold text-white">Nenhuma tarefa encontrada</h3>
              <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                A lista em memória está vazia. Adicione uma nova tarefa pelo formulário para começar.
              </p>
            </div>
          )}

          {/* Estado Vazio de Busca */}
          {!isLoading && !error && tasks && tasks.length > 0 && filteredTasks.length === 0 && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-2">
              <p className="text-sm text-neutral-300">
                Nenhuma tarefa encontrada para a busca &quot;{searchTerm}&quot;.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-xs text-blue-400 hover:underline cursor-pointer"
              >
                Limpar busca
              </button>
            </div>
          )}

            {/* Lista de Tarefas Renderizadas Incrementalmente */ }
      {visibleTasks.length > 0 && (
            <div className="space-y-3">
                {
                  visibleTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                }
        </div>
          )}

          {/* Elemento Sentinela / Gatilho de Carregamento Incremental ao Rolar a Página */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="py-6 flex flex-col items-center justify-center gap-2"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2.5 text-xs text-blue-400 bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-xl shadow-md animate-pulse">
                  <svg
                    className="w-4 h-4 animate-spin text-blue-400"
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
                  <span>Carregando mais 5 tarefas conforme você rola a página...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
                >
                  <svg
                    className="w-3.5 h-3.5 text-blue-400 group-hover:translate-y-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span>
                    Role para baixo ou clique para ver mais 5 tarefas ({filteredTasks.length - visibleCount} restantes)
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Indicador de Fim da Lista (quando todas as tarefas já foram carregadas) */}
          {!hasMore && filteredTasks.length > PAGE_SIZE && (
            <div className="py-4 text-center">
              <span className="text-xs text-neutral-500 bg-neutral-900/60 border border-neutral-800/80 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                Todas as {filteredTasks.length} tarefas foram carregadas
              </span>
            </div>
          )}
        </div>
        );
}
