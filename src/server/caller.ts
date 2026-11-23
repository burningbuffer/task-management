import { appRouter } from "./routers/_app";
import { createTRPCContext } from "./trpc";

/**
 * Cria um caller tRPC no servidor para permitir chamadas diretas
 * em Server Components (SSR) sem a sobrecarga de requisições HTTP adicionais.
 */
export async function getServerCaller() {
  const ctx = await createTRPCContext();
  return appRouter.createCaller(ctx);
}
