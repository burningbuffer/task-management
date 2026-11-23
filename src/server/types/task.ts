import { z } from "zod";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dateCreation: number; // Unix timestamp in milliseconds
}

export const createTaskSchema = z.object({
  title: z
    .string("O título da tarefa é obrigatório.")
    .trim()
    .min(1, "O título da tarefa é obrigatório e não pode ser vazio.")
    .max(200, "O título deve ter no máximo 200 caracteres."),
  description: z
    .string("A descrição deve ser um texto.")
    .trim()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
    .optional(),
});

export const updateTaskSchema = z
  .object({
    id: z
      .string("O ID da tarefa é obrigatório para atualização.")
      .trim()
      .min(1, "O ID da tarefa é obrigatório para atualização."),
    title: z
      .string("O título da tarefa deve ser um texto.")
      .trim()
      .min(1, "O título da tarefa não pode ser vazio.")
      .max(200, "O título deve ter no máximo 200 caracteres.")
      .optional(),
    description: z
      .string("A descrição deve ser um texto.")
      .trim()
      .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
      .optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    {
      message:
        "Informe pelo menos um campo (título ou descrição) para atualizar a tarefa.",
    }
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
