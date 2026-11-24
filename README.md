# Gerenciador de Tarefas (Next.js + tRPC)

Este projeto simula um sistema de gerenciamento de tarefas desenvolvido com foco em Next.js 15, tRPC, React e TypeScript. O backend mantém a lista de tarefas em memória (sem necessidade de persistência em banco de dados externo) e expõe operações completas de CRUD via tRPC, com suporte a Server-Side Rendering (SSR), carregamento incremental e feedback visual.

## Tecnologias Utilizadas

- Next.js 15 (App Router)
- React 19
- TypeScript
- tRPC v11
- TanStack React Query v5
- Tailwind CSS v4
- Zod v4

## Como Rodar o Projeto

### Requisitos

- Node.js (versão 18.x ou superior, recomendado v20+)
- npm

### Passos para executar:

1. Clone o repositório:
```bash
git clone https://github.com/burningbuffer/task-management.git
cd task-management
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto localmente:
```bash
npm run dev
```

4. Acesse no navegador:
```bash
http://localhost:3000
```

## Funcionalidades

- Listagem de tarefas com Server-Side Rendering (SSR) via force-dynamic
- Criação de nova tarefa com validação de formulário (título obrigatório)
- Edição de tarefas existentes via modal interativo
- Exclusão de tarefas com caixa de diálogo de confirmação (Confirmar / Cancelar)
- Feedback visual no topo da página para ações de sucesso e erro
- Carregamento incremental das tarefas ao rolar a página (5 tarefas por vez, sem remover as anteriores)
- Filtro de busca textual em tempo real por título, descrição ou ID
- Ordenação por mais recentes, mais antigas ou ordem alfabética
- Tratamento semântico de erros no backend via tRPC e mensagens amigáveis

## Estrutura da Tarefa

Cada tarefa é representada por um objeto com os seguintes campos:

```typescript
type Task = {
  id: string;           // Identificador único gerado automaticamente (UUID)
  title: string;        // Título da tarefa (obrigatório, não vazio)
  description?: string; // Descrição detalhada da tarefa (opcional)
  dateCreation: number; // Timestamp Unix em milissegundos (Date.now())
};
```

## Backend com tRPC

A camada de API foi implementada com tRPC e mantém os dados em memória através de um repositório singleton (`taskStore`), preservado no escopo global para manter o estado durante recarregamentos no ambiente de desenvolvimento. O roteador expõe os seguintes procedimentos:

### Operações CRUD

- `getAll`: Retorna a lista completa de tarefas armazenadas em memória.
- `getById`: Busca os detalhes de uma tarefa específica pelo ID. Retorna erro NOT_FOUND caso a tarefa não exista.
- `create`: Cadastra uma nova tarefa. Valida a obrigatoriedade do título com Zod e gera automaticamente o ID e o timestamp dateCreation.
- `update`: Atualiza os dados de uma tarefa existente (título e/ou descrição). Retorna erro NOT_FOUND se o ID não for localizado.
- `delete`: Remove a tarefa correspondente ao ID informado. Retorna erro NOT_FOUND se a tarefa não existir.

### Paginação com Cursor (Carregamento Incremental)

- `getInfinite`: Procedimento com paginação baseada em limite e cursor (offset), preparado para suporte a scroll infinito.
  - Parâmetros:
    - `limit`: Quantidade de tarefas por página (padrão: 5).
    - `cursor`: Índice/offset de início para a próxima fatia (opcional).
  - Retorno:
    - `items`: Lista de tarefas da página atual.
    - `nextCursor`: Próximo cursor a ser utilizado para carregar a fatia seguinte.
    - `totalCount`: Quantidade total de tarefas existentes em memória.

Todos os procedimentos utilizam esquemas Zod para validação rigorosa de entradas e lançam instâncias de `TRPCError` com códigos HTTP semânticos (BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR).

## Experiência do Usuário e Feedback

- Server-Side Rendering (SSR): A página inicial pré-carrega os dados diretamente no servidor antes da entrega do HTML, eliminando telas em branco e layout shifts no carregamento inicial.
- Estados de Carregamento: Indicadores visuais e spinners em todas as ações assíncronas (criação, edição, exclusão e carregamento incremental).
- Confirmação de Exclusão: Caixa de diálogo dedicada com opções de confirmar ou cancelar, evitando remoções acidentais.
- Notificações no Topo da Página: Mensagens em destaque visual para confirmar o sucesso ou relatar falhas após cada operação de mutação.
- Scroll Infinito Fluido: Carrega 5 tarefas por vez conforme o usuário rola a tela para baixo, mantendo todas as tarefas anteriores visíveis.

## Estrutura do Projeto

```bash
src/
│
├── app/                             # Rotas do Next.js App Router
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts         # Endpoint HTTP com fetchRequestHandler do tRPC
│   ├── globals.css                  # Estilos globais e Tailwind CSS
│   ├── layout.tsx                   # Layout raiz com provedores e banner de notificação
│   └── page.tsx                     # Página principal com SSR (force-dynamic)
│
├── components/                      # Componentes de interface React
│   ├── providers/
│   │   ├── NotificationProvider.tsx # Contexto para notificações visuais globais
│   │   └── TRPCProvider.tsx         # Provedor do cliente tRPC e React Query
│   ├── TaskDeleteModal.tsx          # Caixa de diálogo para confirmação de exclusão
│   ├── TaskEditModal.tsx            # Modal de edição de tarefas
│   ├── TaskForm.tsx                 # Formulário de criação de novas tarefas
│   ├── TaskItem.tsx                 # Card de exibição da tarefa com ações
│   ├── TaskList.tsx                 # Listagem com busca, ordenação e scroll infinito
│   └── TopNotificationBanner.tsx    # Banner de feedback visual no topo da página
│
├── server/                          # Lógica do backend e armazenamento em memória
│   ├── db/
│   │   └── taskStore.ts             # Repositório em memória (singleton)
│   ├── routers/
│   │   ├── _app.ts                  # Roteador principal do tRPC
│   │   └── taskRouter.ts            # Procedimentos da entidade Task
│   ├── types/
│   │   └── task.ts                  # Tipos TypeScript e esquemas de validação Zod
│   ├── caller.ts                    # Chamador tRPC server-side para SSR
│   └── trpc.ts                      # Inicialização do tRPC e formatador de erros
│
└── utils/
    └── trpc.ts                      # Instância do cliente React do tRPC (createTRPCReact)
```
