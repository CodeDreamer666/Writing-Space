# Writely

Writely is a calm, private writing workspace for drafting, formatting, refining, and exporting documents. It combines automatic saving and browser recovery with optional AI assistance that works only on text the writer selects.

Writely is currently a desktop beta. The application is available at viewport widths of 1024px and above; narrower screens show a desktop-only notice instead of a mobile interface.

## Current functionality

### Authentication

- Google sign-in through Better Auth
- Direct return to the writing workspace after authentication
- Account-aware landing navigation: **Sign in** when signed out and **Open app** when authenticated
- Sign out from Settings & Help
- The Account section is hidden when no authenticated session exists

### Documents

- Create documents from the drafts page or with a keyboard shortcut
- Open and switch between recent documents
- Edit document titles
- Use direct document URLs, browser navigation, and refresh safely
- Delete documents through a confirmation step
- Friendly unavailable state for missing, deleted, or inaccessible documents
- Maximum of 20 active documents per account
- Maximum of 50,000 text characters per document
- Maximum title length of 200 characters

### Editor

- Paragraphs
- Heading 2
- Bold
- Italic
- Bullet lists
- Blockquotes
- Floating selection toolbar
- Word count, character count, and estimated reading time
- Writing modes: Clear, Natural, Persuasive, Reflective, Story, Professional, and Argumentative
- Tested writing support for English, Chinese, Malay, and Tamil
- Normal punctuation, numbers, and useful symbols are supported
- Emoji and decorative pictographs are blocked with a visible validation message

### Autosave and recovery

- Automatic saving while writing
- Visible unsaved, saving, saved, failed, recovery, and conflict states outside Focus Mode
- Temporary browser recovery copy for recent unsaved writing
- Explicit restore-or-discard decisions when a recovery copy is found
- Version-conflict handling for documents edited in multiple tabs
- A stale tab cannot silently overwrite a newer saved version

Focus Mode intentionally hides save-status text. Autosave continues working while Focus Mode is active.

### Focus Mode

- Enter or exit with the Focus/Exit focus button
- Toggle with `Ctrl/Cmd + Alt + F`
- Keeps the title, editor, formatting toolbar, and writing behavior available
- Hides non-essential navigation and utility UI

`Esc` does not exit Focus Mode. It closes active menus, dialogs, the export panel, the AI panel, and the floating selection toolbar where applicable.

### Writely AI

AI is optional and can be disabled globally with `AI_ENABLED="false"`.

Available rewrite actions:

- Improve clarity
- Fix grammar
- Make natural
- Make stronger
- Make more concise
- Improve flow

AI behavior and limits:

- AI runs only after the writer selects text and chooses an action
- Only the selected text and its supported formatting are sent to the AI provider
- Responses follow the language and language variety of the selected writing
- The writer compares the original and improved versions before replacing anything
- Supported formatting is preserved through rewrite replacement
- Maximum selection size: 1,000 characters
- Daily allowance: 5,000 provider tokens per account
- One AI request can run at a time per account
- Failed, invalid, or rejected responses do not reduce the visible allowance
- The remaining-allowance meter updates after successful requests

Writely currently uses Groq with `llama-3.3-70b-versatile`.

### Export

Supported formats:

- TXT (`.txt`)
- Markdown (`.md`)
- Word (`.docx`)

Empty documents can be exported as valid empty files. Markdown and Word preserve headings, lists, bold, italic, blockquotes, and line breaks where the format supports them. PDF export is not part of the current product.

### Preferences and public pages

- Light, Dark, and System themes
- Interface languages: English, Chinese, Malay, and Tamil
- Interface-language selection changes the interface only; it does not set the AI response language
- Public landing page with local, non-persistent product demonstrations
- Settings & Help page
- Plain-language Privacy page
- Beta-feedback dialog; submitting feedback requires authentication

## Keyboard shortcuts

| Action                           | Shortcut             |
| -------------------------------- | -------------------- |
| Create document                  | `Ctrl/Cmd + Alt + N` |
| Toggle Focus Mode                | `Ctrl/Cmd + Alt + F` |
| Open export                      | `Ctrl/Cmd + Alt + E` |
| Close the active panel or dialog | `Esc`                |

The shortcuts use `Ctrl` on Windows/Linux and `Cmd` on macOS. They are not triggered while typing in unrelated form fields.

## Main routes

| Route                | Purpose                            |
| -------------------- | ---------------------------------- |
| `/landing`           | Public product landing page        |
| `/`                  | Draft list and document creation   |
| `/[docId]`           | Writing editor                     |
| `/setting`           | Settings & Help                    |
| `/privacy`           | Plain-language privacy information |
| `/api/auth/[...all]` | Better Auth endpoints              |
| `/api/trpc/[trpc]`   | tRPC API                           |

## Technology

- Next.js 16 and React 19
- TypeScript
- Tailwind CSS
- T3-style tRPC client and server APIs
- Prisma with PostgreSQL
- Better Auth with Google OAuth
- Tiptap
- Groq SDK
- `docx` for Word exports
- Vitest and jsdom

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

In production, `BETTER_AUTH_SECRET` must contain at least 32 characters. Configure the Google OAuth application for the local and deployed Better Auth URLs.

If AI should be unavailable while the rest of Writely remains usable, set:

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
| `npm run db:studio`    | Open Prisma Studio                                                |
| `npm run build`        | Apply production migrations and create a Next.js production build |
| `npm run start`        | Start an existing production build                                |

`npm run build` executes `prisma migrate deploy` before `next build`. Run it only with the intended database configured.

## Project structure

```text
src/
  app/                         Next.js routes and public pages
  components/                  Shared layout and UI
  features/docs/               Draft-list behavior
  features/editor/             Editor, autosave, recovery, AI, and export UI
  hooks/                       Shared browser behavior and shortcuts
  lib/                         Limits, translations, validation, and utilities
  server/api/routers/          tRPC routers
  server/better-auth/          Authentication configuration
  server/documents/            TXT, Markdown, and Word export generation
prisma/
  migrations/                  Database migrations
  schema.prisma                PostgreSQL data model
```

## Verification

Before handing off or deploying a change, run:

```bash
npm test
npm run check
npm run format:check
```

For release verification, also test the deployed authenticated flow: Google sign-in, document creation, autosave/recovery, Focus Mode, a minimal AI request, all three export formats, Settings sign out, and signed-out Settings.

## Current product boundaries

- Desktop only at 1024px and wider
- No mobile or tablet layout below 1024px
- No PDF export
- No collaborative or social writing features
- No AI request without an explicit text selection and action
- Focus Mode exits only through Exit focus or `Ctrl/Cmd + Alt + F`
