import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { taskStore } from "../db/taskStore";
import { createTaskSchema, updateTaskSchema } from "../types/task";

export const taskRouter = router({
  // Listar todas as tarefas em memória
  getAll: publicProcedure.query(() => {
    return taskStore.getAll();
  }),

  // Paginação incremental com cursor para carregamento paginado/infinito
  getInfinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(5),
        cursor: z.number().nullish(), // offset
      })
    )
    .query(({ input }) => {
      const limit = input.limit ?? 5;
      const offset = input.cursor ?? 0;
      const all = taskStore.getAll();
      const items = all.slice(offset, offset + limit);
      const nextCursor =
        offset + limit < all.length ? offset + limit : undefined;

      return {
        items,
        nextCursor,
        totalCount: all.length,
      };
    }),

  // Obter uma tarefa por ID com validação e erro significativo se não for encontrada
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

  // Criar uma nova tarefa (garante título obrigatório e não vazio)
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

  // Atualizar uma tarefa existente (retorna erro significativo se a tarefa não existir)
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

  // Deletar uma tarefa (retorna erro significativo se a tarefa não existir)
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
