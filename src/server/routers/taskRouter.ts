import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { taskStore } from "../db/taskStore";
import { createTaskSchema, updateTaskSchema } from "../types/task";

export const taskRouter = router({
  // Listar Tarefas: Endpoint para retornar a lista de tarefas. 
  getAll: publicProcedure.query(() => {
    return taskStore.getAll();
  }),

  // Obter uma tarefa por ID
  getById: publicProcedure
    .input(
      z.object({
        id: z
          .string("O ID da tarefa é obrigatório.")
          .trim()
          .min(1, "O ID da tarefa não pode ser vazio."),
      })
    )
    .query(({ input }) => {
      const task = taskStore.getById(input.id);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Tarefa com ID "${input.id}" não foi encontrada.`,
        });
      }
      return task;
    }),

  // Criar Tarefa: Endpoint para adicionar uma nova tarefa. 
  create: publicProcedure
    .input(createTaskSchema)
    .mutation(({ input }) => {
      const cleanTitle = input.title.trim();
      if (!cleanTitle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "O título da tarefa é obrigatório e não pode ser composto apenas por espaços.",
        });
      }

      return taskStore.create({
        title: cleanTitle,
        description: input.description,
      });
    }),

  // Atualizar Tarefa: Endpoint para editar os dados de uma tarefa existente.
  update: publicProcedure
    .input(updateTaskSchema)
    .mutation(({ input }) => {
      const existing = taskStore.getById(input.id);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Não foi possível atualizar: tarefa com ID "${input.id}" não existe no sistema.`,
        });
      }

      const updated = taskStore.update(input.id, {
        title: input.title,
        description: input.description,
      });

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao tentar atualizar os dados da tarefa com ID "${input.id}".`,
        });
      }

      return updated;
    }),

  // Deletar Tarefa: Endpoint para remover uma tarefa.
  delete: publicProcedure
    .input(
      z.object({
        id: z
          .string("O ID da tarefa é obrigatório para exclusão.")
          .trim()
          .min(1, "O ID da tarefa não pode ser vazio."),
      })
    )
    .mutation(({ input }) => {
      const existing = taskStore.getById(input.id);
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Não foi possível excluir: tarefa com ID "${input.id}" não existe no sistema.`,
        });
      }

      const success = taskStore.delete(input.id);
      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro interno ao tentar remover a tarefa com ID "${input.id}".`,
        });
      }

      return {
        success: true,
        message: `Tarefa "${existing.title}" excluída com sucesso.`,
        id: input.id,
      };
    }),
});
