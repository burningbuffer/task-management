
## Task Manager

Simple Task Management System with Next.js and tRPC     

### Tech Stack

- Next.js 15
- tRPC
- TypeScript
- Tailwind CSS

### Requirements

- Next.js version 15
- tRPC version 10
- TypeScript version 5.x
- Tailwind CSS version 4.x

------------------------------------

# Getting Started

First Clone the repo

```bash
git clone https://github.com/burningbuffer/task-management.git
```

Install dependencies

```bash
npm install
```

Start the application

```bash
npm run dev
```

At last open the development app in your browser with the URL below

```bash
http://localhost:3000
```   

------------------------------------

# Project Structure

```bash
src/
│
├── app/                             # Next.js App Router
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts         # tRPC fetchRequestHandler endpoint
│   ├── globals.css                  # Global Tailwind CSS styling
│   ├── layout.tsx                   # Root layout with TRPCProvider
│   └── page.tsx                     # Main page (SSR Server Component with force-dynamic)
│
├── components/                      # React UI Components
│   ├── providers/
│   │   └── TRPCProvider.tsx         # tRPC & React Query client provider
│   ├── TaskEditModal.tsx            # Modal for editing existing tasks
│   ├── TaskForm.tsx                 # Form for creating new tasks with validation
│   ├── TaskItem.tsx                 # Task card with ID copy, edit, and delete actions
│   └── TaskList.tsx                 # Task listing with search, sorting & incremental scroll
│
├── server/                          # Backend logic & in-memory data store
│   ├── db/
│   │   └── taskStore.ts             # In-memory task store repository
│   ├── routers/
│   │   ├── _app.ts                  # Root tRPC router
│   │   └── taskRouter.ts            # Task procedures (getAll, getInfinite, getById, create, update, delete)
│   ├── types/
│   │   └── task.ts                  # Task model interface and Zod schemas
│   ├── caller.ts                    # Server-side tRPC caller for SSR
│   └── trpc.ts                      # tRPC initialization and custom errorFormatter
│
└── utils/
    └── trpc.ts                      # tRPC React Query client hooks setup
```