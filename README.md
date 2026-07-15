# Writely

Writely is a calm, focused space for thinking deeply and writing with intent.
It keeps the page quiet, gives ideas room to develop, and offers help only when
you ask for it.

The aim is simple: help writers spend less time managing a tool and more time
following a thought to its clearest form.

## What it offers

- A distraction-light writing surface with titles, word count, reading time,
  and essential rich-text formatting.
- Persistent drafts backed by PostgreSQL, with clear Save and Saving states.
- Writing modes—such as Clear, Reflective, Story, and Argumentative—that guide
  AI suggestions and are saved with each draft.
- An AI writing panel for improving clarity, fixing grammar, strengthening
  language, finding weak points, exploring directions, or asking a custom
  question about a draft or selection.
- Google sign-in with direct draft creation: signed-out users can start writing,
  choose a Google account, and arrive in a new draft after authentication.
- A compact Login / Logout control on the homepage.
- A gentle save reminder that can be dismissed for the current page visit, plus
  a leave dialog with Save document, Leave page, and a per-account “Don’t
  remind me again” preference.
- Draft renaming and deletion from the homepage.

## Writing with Writely

1. Open the homepage and choose **Start writing**.
2. If needed, select a Google account; Writely then creates and opens a draft.
3. Give the idea a title, choose a writing mode, and write without unnecessary
   controls competing for attention.
4. Select text or open **AI** when you want a specific kind of feedback—not a
   replacement for your thinking.
5. Click **Save** or use `Ctrl/Cmd + S` before leaving.

The homepage’s Login button opens Google account selection directly. After
sign-in, it returns to the writing space; Start writing creates a fresh draft
and opens it automatically.

## Tech stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- tRPC and TanStack Query
- Prisma with PostgreSQL
- Better Auth with Google OAuth
- Tiptap editor
- Groq-powered AI assistance

## Getting started

### Prerequisites

- Node.js 20 or later
- npm 11 or later
- A PostgreSQL database
- Google OAuth credentials
- A Groq API key

### Installation

```bash
git clone <your-repository-url>
cd writely
npm install
```

Copy the example environment file and provide the required values:

```bash
Copy-Item .env.example .env
```

Configure these variables in `.env`:

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="a-long-random-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GROQ_API_KEY="..."
```

In Google Cloud, configure the OAuth callback URL used by Better Auth for your
environment—for local development this is typically:

```text
http://localhost:3000/api/auth/callback/google
```

Apply migrations and start the app:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
npm run dev           # Start the development server
npm run check         # Run ESLint and TypeScript checks
npm run format:check  # Check formatting
npm run build         # Apply production migrations and build
npx prisma studio     # Browse local database data
```

## Project structure

```text
src/app/                    Next.js routes
src/features/docs/          Homepage and draft management
src/features/editor/        Editor, writing modes, AI panel, and leave safeguards
src/server/api/routers/     tRPC document and AI procedures
prisma/                     Database schema and migrations
```

## Guiding principles

Writely is intentionally not a feature-heavy document suite. It values a quiet
environment, reliable saves, clear ownership of drafts, and AI that supports
reflection rather than interrupts it. The writer remains in control of every
decision and every change.
