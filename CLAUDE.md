# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, Claude generates them, and a live preview renders the result in-browser using a virtual file system (no files written to disk).

## Commands

- `npm run setup` — Install deps, generate Prisma client, run migrations
- `npm run dev` — Start dev server with Turbopack (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test` — Run all tests with vitest
- `npx vitest run src/lib/__tests__/file-system.test.ts` — Run a single test file
- `npx prisma migrate dev` — Run database migrations
- `npx prisma generate` — Regenerate Prisma client

## Architecture

### AI Chat Flow
1. User sends a message via the chat UI
2. `POST /api/chat` (`src/app/api/chat/route.ts`) receives messages + serialized virtual file system
3. The route reconstructs a `VirtualFileSystem`, calls `streamText` (Vercel AI SDK) with Claude and two tools: `str_replace_editor` and `file_manager`
4. Claude uses tools to create/edit/delete files in the virtual FS
5. Tool calls stream back to the client where `ChatContext` dispatches them to `FileSystemContext`
6. `FileSystemContext` applies changes to the client-side `VirtualFileSystem` and triggers re-renders
7. The preview panel transforms files via `jsx-transformer.ts` (Babel in-browser), creates blob URLs and an import map, then renders in an iframe

### Key Abstractions

- **VirtualFileSystem** (`src/lib/file-system.ts`): In-memory file tree with create/read/update/delete/rename operations. Serializable for sending between client and server. Used on both sides.
- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Client-side Babel transform that converts JSX/TSX to browser-runnable JS. Creates import maps with blob URLs, handles `@/` path aliases, resolves third-party packages via esm.sh, and generates preview HTML.
- **Provider** (`src/lib/provider.ts`): Returns either the real Anthropic model (`claude-haiku-4-5`) or a `MockLanguageModel` when no API key is set. The mock returns static component code for development without an API key.

### Context Providers (client-side state)
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`): Wraps VirtualFileSystem with React state, handles tool call dispatch
- `ChatContext` (`src/lib/contexts/chat-context.tsx`): Wraps Vercel AI SDK's `useChat`, wires tool calls to FileSystemContext

### AI Tools (server-side)
- `str_replace_editor` (`src/lib/tools/str-replace.ts`): view/create/str_replace/insert commands on the virtual FS
- `file_manager` (`src/lib/tools/file-manager.ts`): rename/delete operations

### Auth & Data
- JWT-based auth with `jose` library (`src/lib/auth.ts`), cookie-based sessions
- Middleware (`src/middleware.ts`) protects `/api/projects` and `/api/filesystem`
- Prisma + SQLite for persistence. Projects store messages and file system data as JSON strings
- Anonymous users can use the app; registered users get project persistence
- The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of data stored in the database.

### Path Alias
`@/*` maps to `./src/*` (tsconfig paths). In the virtual FS used by generated components, `@/` maps to the virtual root `/`.

## CI / GitHub Actions — Playwright MCP

When running in CI (GitHub Actions), you have access to Playwright MCP tools for browser interaction. These are tool calls you make directly — NOT the `@playwright/test` npm package.

**DO NOT** install `@playwright/test` or write `.spec.ts` test files. Instead, call the MCP tools directly:
- `mcp__playwright__browser_navigate` — open a URL (start with `http://localhost:3000`)
- `mcp__playwright__browser_snapshot` — get the page's accessibility tree
- `mcp__playwright__browser_click` — click an element
- `mcp__playwright__browser_take_screenshot` — capture a screenshot
- `mcp__playwright__browser_fill_form`, `mcp__playwright__browser_type`, etc.

When asked to verify, test, or check UI behavior, you MUST use these MCP tool calls to interact with the running app at localhost:3000. Do not substitute with code analysis or writing test files.

## Code Style

- Use comments sparingly. Only comment complex code.

## Tech Stack
- Next.js 15 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (new-york style)
- Prisma + SQLite, Vercel AI SDK, `@ai-sdk/anthropic`
- Vitest + jsdom + React Testing Library for tests
