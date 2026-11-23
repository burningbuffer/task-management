import { getServerCaller } from "@/server/caller";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";

// Força a renderização do lado do servidor (SSR) em cada requisição
export const dynamic = "force-dynamic";

export default async function Home() {
  // Pré-carregamento Server-Side Rendering (SSR) via tRPC caller no servidor
  const caller = await getServerCaller();
  const initialTasks = await caller.task.getAll();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              TM
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Task Management System
              </h1>
              <p className="text-[11px] text-neutral-400">
                Backend em memória • Exposto via tRPC • SSR Habilitado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-950/80 text-blue-400 border border-blue-800/60">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              SSR Ativo
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              tRPC Ativo
            </span>
            <a
              href="/api/trpc/task.getAll"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-white px-3 py-1 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
              title="Acessar endpoint tRPC diretamente"
            >
              /api/trpc ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Task Form Section */}
        <section>
          <TaskForm />
        </section>

        {/* Task List Section com dados pré-carregados pelo SSR */}
        <section>
          <TaskList initialTasks={initialTasks} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 py-6 mt-12 bg-neutral-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>
            Task Management System • Simulação de backend em memória com SSR e tRPC
          </p>
        </div>
      </footer>
    </div>
  );
}
