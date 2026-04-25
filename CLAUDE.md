# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start development server at http://localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

No test runner is configured yet.

## Architecture

**Party Memories** is an early-stage Next.js 16 app using the App Router. The stack is:
- **Next.js 16 / React 19 / TypeScript** — App Router only, no Pages Router
- **Tailwind CSS v4** — configured via `@tailwindcss/postcss`; there is no `tailwind.config.*` file; all theme tokens live in `src/app/globals.css`
- **shadcn/ui (base-luma variant)** backed by **Base UI** headless primitives — components live in `src/components/ui/`
- **Lucide React** for icons

### Key conventions

- Path alias `@/*` resolves to `src/*`
- `src/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) — use it for all `className` composition
- No backend, database, API routes, or auth exist yet
- All current components are React Server Components; mark client components explicitly with `"use client"`
