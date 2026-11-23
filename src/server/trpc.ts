import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

export const createTRPCContext = async () => {
  return {};
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    let formattedMessage = shape.message;

    // Extrair mensagens amigáveis dos erros do Zod
    if (error.cause instanceof ZodError) {
      formattedMessage = error.cause.issues.map((i) => i.message).join("; ");
    }

    return {
      ...shape,
      message: formattedMessage,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
