import { Task } from "../types/task";

declare global {
  // eslint-disable-next-line no-var
  var __taskStore: Map<string, Task> | undefined;
}

// In-memory task repository (persisted in globalThis during Next.js development reloads)
class TaskStore {
  private tasks: Map<string, Task>;

  constructor() {
    if (!global.__taskStore) {
      global.__taskStore = new Map<string, Task>();
      this.seedInitialTasks(global.__taskStore);
    }
    this.tasks = global.__taskStore;
  }

  private seedInitialTasks(store: Map<string, Task>) {
    const now = Date.now();
    const initialTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        title: "1. Configurar arquitetura tRPC v11 e Next.js App Router",
        description: "Instalar dependências, configurar o roteador raiz e o endpoint fetchRequestHandler.",
        dateCreation: now - 1000 * 60 * 110,
      },
      {
        id: crypto.randomUUID(),
        title: "2. Implementar modelagem da entidade Task",
        description: "Definir os campos obrigatórios (id único, title mandatório, description opcional e dateCreation timestamp).",
        dateCreation: now - 1000 * 60 * 100,
      },
      {
        id: crypto.randomUUID(),
        title: "3. Configurar Server-Side Rendering (SSR)",
        description: "Utilizar getServerCaller() para pré-carregar os dados diretamente no servidor Next.js.",
        dateCreation: now - 1000 * 60 * 90,
      },
      {
        id: crypto.randomUUID(),
        title: "4. Criar validação de campos com Zod Schemas",
        description: "Garantir que tarefas sem título ou apenas com espaços em branco sejam rejeitadas.",
        dateCreation: now - 1000 * 60 * 80,
      },
      {
        id: crypto.randomUUID(),
        title: "5. Implementar tratamento de erros customizado com TRPCError",
        description: "Retornar mensagens claras como NOT_FOUND ao tentar atualizar ou excluir tarefas inexistentes.",
        dateCreation: now - 1000 * 60 * 70,
      },
      {
        id: crypto.randomUUID(),
        title: "6. Desenvolver componente de formulário para criação",
        description: "Construir interface com feedback de validação, botão de carregamento e foco acessível.",
        dateCreation: now - 1000 * 60 * 60,
      },
      {
        id: crypto.randomUUID(),
        title: "7. Criar modal de edição de tarefas",
        description: "Permitir alteração de título e descrição de tarefas existentes com validação em tempo real.",
        dateCreation: now - 1000 * 60 * 50,
      },
      {
        id: crypto.randomUUID(),
        title: "8. Implementar confirmação de exclusão e mensagens de erro",
        description: "Adicionar botão de confirmação e alertas visuais caso a exclusão falhe.",
        dateCreation: now - 1000 * 60 * 40,
      },
      {
        id: crypto.randomUUID(),
        title: "9. Adicionar filtros de busca por título, descrição e ID",
        description: "Permitir busca instantânea com destaque visual dos termos encontrados.",
        dateCreation: now - 1000 * 60 * 30,
      },
      {
        id: crypto.randomUUID(),
        title: "10. Configurar ordenação flexível",
        description: "Permitir ordenar as tarefas por data de criação (mais recentes/mais antigas) e ordem alfabética.",
        dateCreation: now - 1000 * 60 * 20,
      },
      {
        id: crypto.randomUUID(),
        title: "11. Implementar carregamento incremental (Infinite Scroll)",
        description: "Exibir 5 tarefas por vez e carregar o restante conforme o usuário rola a página, sem remover as anteriores.",
        dateCreation: now - 1000 * 60 * 10,
      },
      {
        id: crypto.randomUUID(),
        title: "12. Elaborar suíte completa de testes automatizados",
        description: "Cobrir casos de sucesso, falhas de validação e respostas de erro da API.",
        dateCreation: now,
      },
    ];

    for (const task of initialTasks) {
      store.set(task.id, task);
    }
  }

  getAll(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.dateCreation - a.dateCreation
    );
  }

  getById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  create(input: { title: string; description?: string }): Task {
    const cleanTitle = input.title?.trim();
    if (!cleanTitle) {
      throw new Error("O título da tarefa é obrigatório e não pode ser vazio.");
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      description: input.description?.trim() ? input.description.trim() : undefined,
      dateCreation: Date.now(),
    };

    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  update(
    id: string,
    input: { title?: string; description?: string }
  ): Task | null {
    const existing = this.tasks.get(id);
    if (!existing) {
      return null;
    }

    const updatedTask: Task = {
      ...existing,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? {
            description: input.description.trim() ? input.description.trim() : undefined,
          }
        : {}),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  clear(): void {
    this.tasks.clear();
  }
}

export const taskStore = new TaskStore();
