# Writely

Writely is a calm writing workspace for drafting, formatting, refining, and exporting documents. It combines deliberate manual saving and browser recovery with optional AI assistance that works only on text the writer selects.

Writely 2.0 has an English interface and officially guarantees writing and export support for English. Other languages can be entered, but are not part of the current support guarantee.

## Current functionality

### Authentication and account

- Google sign-in through Better Auth
- Auth-aware entry points that open the workspace for signed-in users and start Google sign-in for signed-out users
- Sign out from Settings & Help
- Permanent account deletion with an explicit confirmation step
- Account deletion removes the account, its documents, related server data, and browser recovery copies on the current device

### Documents

- Create a blank document from the workspace
- View recent documents with relative update times
- Open documents through direct URLs
- Edit document titles
- Delete documents through a confirmation dialog
- Friendly unavailable state for missing, deleted, or inaccessible documents
- Maximum of 20 active documents per account
- Maximum of 50,000 text characters per document
- Maximum title length of 200 characters

All document reads, updates, deletions, and exports are restricted to the authenticated owner.

### Editor

- Paragraphs
- Heading 2
- Bold and italic text
- Bullet lists
- Blockquotes
- Floating formatting toolbar for selected text
- Word count, character count, and estimated reading time at approximately 240 words per minute
- Writing modes: Clear, Natural, Persuasive, Reflective, Story, and Argumentative
- Normal punctuation, numbers, and useful symbols
- Visible validation when emoji or decorative pictographs are entered

### Writing appearance

Editor-only appearance preferences are stored in the browser and include:

- Source Serif 4, Inter, or Atkinson Hyperlegible
- 16px, 18px, 20px, or 22px text
- Compact, comfortable, or spacious line spacing
- Narrow, standard, or wide editor width
- Light, Dark, and System themes

These preferences change the writing experience without changing exported document formatting.

### Manual save and recovery

- A manual save action in the editor sidebar keeps writers in control of when a document is committed
- Visible unsaved, saving, saved, failed, recovery, and conflict states
- A temporary browser recovery copy for recent unsaved writing, refreshed on tab close, tab hide, and mobile backgrounding
- Explicit restore-or-discard choices when a recovery copy differs from the saved document
- Discarding a recovery copy archives it in the browser rather than deleting it outright
- Failed saves require an explicit retry and never silently retry when the connection returns
- A visible failure state when browser storage is unavailable, so the writer knows only the server copy is protecting them
- Version-conflict protection for documents edited in multiple tabs
- A stale tab cannot silently overwrite a newer saved version
- Conflicted writing can be kept with "Save as new document" instead of choosing between two losses

Browser recovery copies expire after 30 days. The database remains the authoritative saved copy.

Autosave was removed because unresolved reliability issues meant Writely could not honestly guarantee that every change had been persisted. Shipping autosave despite those issues would break the product promise and destroy writer trust by presenting uncertain saves as safe. Writely therefore uses explicit manual saving unless and until autosave can meet that reliability standard.

### Writely AI

AI is optional and can be disabled globally with `AI_ENABLED="false"` without disabling writing or saving.

Available rewrite actions:

- Clarify — clearer meaning with less ambiguity
- Natural — smoother, more human-sounding language
- Strengthen — sharper wording with more confidence
- Tighten — fewer words, same meaning

AI behaviour and limits:

- AI runs only after the writer selects text and chooses an action
- Only the selected text and its supported formatting are sent to the AI provider
- The selected document must belong to the authenticated user
- The writer compares the original and improved versions before accepting or keeping the original
- Supported formatting is preserved when an accepted rewrite replaces the selection
- Maximum selection size: 1,500 characters per request
- A generous daily allowance per account, reset by UTC date
- One AI request can run at a time per account
- Failed, invalid, rejected, or over-limit responses do not reduce the allowance
- The remaining-allowance meter updates after successful requests

Writely currently uses Groq with `openai/gpt-oss-120b`. Responses that arrive with a leading reasoning block are tolerated: the final JSON object is extracted before validation. The database records daily token usage and request-lock metadata, not selected text, prompts, or AI responses.

### Export

Supported formats:

- TXT (`.txt`)
- Markdown (`.md`)
- Word (`.docx`)
- PDF (`.pdf`)

Empty documents can be exported as valid files. Rich exports preserve headings, lists, bold, italic, blockquotes, and line breaks where the format supports them. PDF files use embedded Unicode-compatible fonts, but Writely 2.0 guarantees reliable PDF export only for English.

### Settings and feedback

The authenticated Settings & Help page includes theme and writing-appearance controls, current product limits, saving and language guidance, a feedback form, sign out, and account deletion. AI usage is described in plain terms (daily allowance, selected characters per request, concurrent requests, and what is sent to the AI) rather than raw token counts.

Feedback is trimmed and validated on the server:

- 10 to 2,000 characters
- Authentication required
- One submission per user every 60 seconds
- Input remains available when submission fails and clears after success

## Main routes

| Route                | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `/`                  | Public landing page                       |
| `/app`               | Auth-aware workspace and recent documents |
| `/app/[docId]`       | Authenticated document editor             |
| `/setting`           | Authenticated Settings & Help             |
| `/api/auth/[...all]` | Better Auth endpoints                     |
| `/api/trpc/[trpc]`   | tRPC API                                  |

## Technology

- Next.js 16 (Turbopack) and React 19
- TypeScript
- Tailwind CSS 4
- tRPC and TanStack Query
- Prisma 7 with PostgreSQL
- Better Auth with Google OAuth
- Tiptap
- Groq SDK
- `docx` for Word exports
- `pdfmake` for PDF exports
- Vitest and jsdom (configured; no test files are checked in yet)

## Local development

### Prerequisites

- A current LTS version of Node.js
- npm
- PostgreSQL
- Google OAuth credentials
- A Groq API key when AI is enabled

### 1. Install dependencies

```bash
npm install
```

The post-install script generates the Prisma client.

### 2. Configure environment variables

Copy `.env.example` to `.env` and provide:

```dotenv
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DATABASE_URL=""
GROQ_API_KEY=""
AI_ENABLED="true"
```

In production, `BETTER_AUTH_SECRET` must contain at least 32 characters. Configure the Google OAuth application for the local and deployed Better Auth callback URLs.

To keep Writely available without AI, set:

```dotenv
AI_ENABLED="false"
```

### 3. Apply database migrations

```bash
npm run db:migrate
```

For local schema development, use:

```bash
npm run db:generate
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

| Command                | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server with Turbopack               |
| `npm run test`         | Run the Vitest suite                                              |
| `npm run lint`         | Run ESLint                                                        |
| `npm run typecheck`    | Run TypeScript without emitting files                             |
| `npm run check`        | Run ESLint and TypeScript                                         |
| `npm run format:check` | Check supported source files with Prettier                        |
| `npm run format:write` | Format supported source files with Prettier                       |
| `npm run db:migrate`   | Apply pending Prisma migrations                                   |
| `npm run db:generate`  | Create/apply a development migration and regenerate Prisma        |
| `npm run db:push`      | Push the Prisma schema without creating a migration               |
| `npm run db:studio`    | Open Prisma Studio                                                |
| `npm run build`        | Apply production migrations and create a Next.js production build |
| `npm run start`        | Start an existing production build                                |

`npm run build` executes `prisma migrate deploy` before `next build`. Run it only with the intended database configured.

## Project structure

```text
src/
  app/                         Landing, workspace, editor, settings, and API routes
  components/documents/        Document list, creation, and deletion UI
  components/editor/           Editor shell, toolbar, AI panel, and save notices
  components/landing/          Public landing page sections
  components/providers/        Theme and status-message providers
  components/settings/         Settings & Help page UI
  components/shared/           Loading and error UI
  contexts/                    Theme and status-message contexts
  features/documents/          Pre-authentication draft handoff
  features/editor/             Manual saving, local drafts, AI context, and export helpers
  hooks/                       Theme and writing-appearance browser behaviour
  lib/                         Limits, validation, themes, and utilities
  types/                       Shared AI and writing-mode types
  server/ai/                   AI prompts, response parsing, and sanitisation
  server/procedures/           Authenticated tRPC procedures, one file each
  server/routers/              Router composition (account, docs, ai, feedback)
  server/better-auth/          Authentication configuration
  server/documents/            TXT, Markdown, Word, and PDF generation
  trpc/                        Client, query client, and error handling
prisma/
  migrations/                  Database migrations
  schema.prisma                PostgreSQL data model
```

## Verification

Before handing off or deploying a change, run:

```bash
npm run check
npm run format:check
npm run build
```

`npm test` is wired up but the repository currently ships no test files, so it passes trivially.

The production build applies database migrations, so use a deliberate test or deployment database. For release verification, also test the real authenticated journey: Google sign-in, document creation, manual saving and recovery, multi-tab conflict handling, all four AI actions, all four export formats, feedback submission, sign out, and account deletion in a disposable account.

## Current product boundaries

- The interface and official writing-support guarantee are English only
- No collaborative, shared, or social writing features
- No AI request without an explicit text selection and action
- No automatic replacement of writing with an AI response
- PDF reliability is guaranteed only for English
