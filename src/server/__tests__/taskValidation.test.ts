import { appRouter } from "../routers/_app";
import { taskStore } from "../db/taskStore";
import { TRPCError } from "@trpc/server";

async function runTests() {
  console.log("=== INICIANDO SUÍTE DE TESTES DE VALIDAÇÃO E ERROS ===");
  const caller = appRouter.createCaller({});

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `- ${detail}` : ""}`);
      process.exitCode = 1;
    }
  }

  // 1. Teste: Criar tarefa sem título (campo ausente/vazio)
  try {
    // @ts-expect-error - Testando input inválido propositalmente
    await caller.task.create({});
    assert(false, "Deve falhar ao criar tarefa sem título");
  } catch (err: any) {
    const isExpected =
      err instanceof TRPCError || err?.message?.includes("título");
    assert(
      isExpected,
      "Validação: Impede criação de tarefa sem título",
      `Mensagem recebida: ${err.message}`
    );
  }

  // 2. Teste: Criar tarefa com título vazio ou apenas espaços em branco
  try {
    await caller.task.create({ title: "   " });
    assert(false, "Deve falhar ao criar tarefa com título apenas de espaços");
  } catch (err: any) {
    const isExpected =
      err instanceof TRPCError &&
      (err.message.includes("obrigatório") || err.message.includes("vazio"));
    assert(
      isExpected,
      "Validação: Impede criação com título apenas de espaços",
      `Mensagem: ${err.message}`
    );
  }

  // 3. Teste: Criar tarefa válida com sucesso
  const created = await caller.task.create({
    title: "Tarefa de Teste Válida",
    description: "Descrição opcional",
  });
  assert(
    Boolean(created.id && created.title === "Tarefa de Teste Válida" && created.dateCreation),
    "Sucesso: Criação de tarefa válida gera id único, dateCreation e persiste dados"
  );

  // 4. Teste: Buscar tarefa por ID inexistente retorna erro NOT_FOUND significativo
  try {
    await caller.task.getById({ id: "id-totalmente-inexistente-12345" });
    assert(false, "Deve falhar ao buscar tarefa inexistente");
  } catch (err: any) {
    const isNotFound = err instanceof TRPCError && err.code === "NOT_FOUND";
    const hasMeaningfulMsg = err.message.includes("não foi encontrada");
    assert(
      isNotFound && hasMeaningfulMsg,
      "Tratamento de Erro: getById retorna NOT_FOUND com mensagem significativa",
      `Mensagem: ${err.message}`
    );
  }

  // 5. Teste: Atualizar tarefa inexistente retorna erro NOT_FOUND significativo
  try {
    await caller.task.update({
      id: "id-fantasma-99999",
      title: "Tentativa de atualizar fantasma",
    });
    assert(false, "Deve falhar ao tentar atualizar tarefa inexistente");
  } catch (err: any) {
    const isNotFound = err instanceof TRPCError && err.code === "NOT_FOUND";
    const hasMeaningfulMsg =
      err.message.includes("não existe") || err.message.includes("não foi encontrada");
    assert(
      isNotFound && hasMeaningfulMsg,
      "Tratamento de Erro: update em tarefa inexistente retorna NOT_FOUND com mensagem explicativa",
      `Mensagem: ${err.message}`
    );
  }

  // 6. Teste: Excluir tarefa inexistente retorna erro NOT_FOUND significativo
  try {
    await caller.task.delete({ id: "id-fantasma-88888" });
    assert(false, "Deve falhar ao tentar excluir tarefa inexistente");
  } catch (err: any) {
    const isNotFound = err instanceof TRPCError && err.code === "NOT_FOUND";
    const hasMeaningfulMsg =
      err.message.includes("não existe") || err.message.includes("não foi encontrada");
    assert(
      isNotFound && hasMeaningfulMsg,
      "Tratamento de Erro: delete em tarefa inexistente retorna NOT_FOUND com mensagem explicativa",
      `Mensagem: ${err.message}`
    );
  }

  // 7. Teste: Atualizar com sucesso uma tarefa existente
  const updated = await caller.task.update({
    id: created.id,
    title: "Título Alterado com Sucesso",
    description: "Nova descrição",
  });
  assert(
    updated.title === "Título Alterado com Sucesso" &&
      updated.description === "Nova descrição" &&
      updated.id === created.id,
    "Sucesso: Atualização de tarefa existente reflete alterações"
  );

  // 8. Teste: Excluir tarefa existente com sucesso
  const deletedResult = await caller.task.delete({ id: created.id });
  assert(
    deletedResult.success === true && deletedResult.id === created.id,
    "Sucesso: Exclusão de tarefa existente remove do banco em memória"
  );

  // 9. Confirmação que a tarefa excluída não existe mais
  try {
    await caller.task.getById({ id: created.id });
    assert(false, "Tarefa excluída não deveria ser encontrada");
  } catch (err: any) {
    assert(
      err instanceof TRPCError && err.code === "NOT_FOUND",
      "Confirmação: Tarefa deletada agora retorna NOT_FOUND"
    );
  }

  console.log("\n=======================================================");
  console.log(`TOTAL: ${passedTests}/${totalTests} testes passaram com sucesso!`);
  console.log("=======================================================");
}

runTests().catch((err) => {
  console.error("Erro fatal nos testes:", err);
  process.exit(1);
});
