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
    const initialTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        title: "Configurar ambiente tRPC no Next.js",
        description: "Instalar dependências e configurar o router tRPC com endpoints CRUD.",
        dateCreation: Date.now() - 3600000 * 2,
      },
      {
        id: crypto.randomUUID(),
        title: "Modelagem da entidade Task",
        description: "Definir os campos obrigatórios (id, title, description opcional, dateCreation).",
        dateCreation: Date.now() - 3600000,
      },
      {
        id: crypto.randomUUID(),
        title: "Criar interface de gerenciamento de tarefas",
        description: "Construir formulário para adicionar tarefas e listagem interativa em tempo real.",
        dateCreation: Date.now(),
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
