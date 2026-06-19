# Writely

A minimalist, AI-powered writing application built for people who want to focus on writing — not on the tool.

---

## What is Writely?

Writely strips away the noise of traditional document editors. No toolbars cluttered with formatting options. No collaboration panels. No folder trees. Just a clean, dark writing surface and an AI assistant that stays out of your way until you need it.

The goal is not to compete with Notion or Google Docs. It is to offer something they don't: a calm, distraction-free space where writing comes first.

---

## Features

### Writing
- Instant document creation — one click, you're writing
- Essential formatting only: **Bold**, *Italic*, H1, H2, Bullet list, Ordered list, Blockquote
- Inline title editing directly in the header
- Manual save via the Save button in the header (or press Enter in the title input)
- Word count and estimated reading time in the status bar

### Document Management
- Homepage lists all your drafts, sorted by most recently updated
- Rename or delete any document from the document list
- Relative timestamps ("Just now", "Yesterday", "Monday")

### AI Assistant
- Slide-in overlay panel, triggered from the header
- Chat-style interface — ask questions, request rewrites, get feedback
- AI stays passive by default and only acts when you ask
- Sends plain document text for efficient, accurate responses
- Powered by Groq

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| API | tRPC |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Auth | Better Auth |
| Editor | Tiptap (ProseMirror) |
| AI | Groq API |
| Styling | Tailwind CSS |

---

## Design

Writely follows a **dark-first design system** built around a single principle: visual hierarchy without visual noise.

### Color Palette

| Role | Value |
|---|---|
| Page background | `#0B0D10` |
| Surface / card | `#0F1318` – `#161B22` |
| Border | `#1E2530` – `#262C36` |
| Muted text | `#6B7280` |
| Secondary text | `#8E96A3` – `#C8CBD0` |
| Primary text | `#E5E7EA` – `#F5F5F7` |
| Destructive | `#FF6B5E` |

### Layout

- Max content width: `max-w-3xl` (768px), centered with empty margins on wider screens
- Editor writing column: `max-w-2xl` for comfortable line length (~65–75 chars)
- AI panel: fixed overlay from the right (`w-80`), slides over the editor without shrinking it

### Typography & Interaction
- Tracking-tight headings, relaxed body leading (`leading-[1.85]`)
- Subtle press feedback (`active:scale-[0.98]`) on interactive elements
- Hover state transitions at `duration-200`
- Rounded corners throughout (`rounded-xl`, `rounded-2xl`)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage — document list
│   ├── [docId]/
│   │   └── page.tsx              # Writing space
│   ├── components/
│   │   ├── DocItem.tsx           # Document list item with rename/delete
│   │   ├── Tiptap/
│   │   │   └── TiptapMenuBar.tsx # Formatting toolbar
│   │   ├── Loading.tsx
│   │   └── ServerError.tsx
│   └── libs/
│       └── handleTRPCError.ts
├── server/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── docs.ts           # Document CRUD
│   │   │   └── ai.ts             # Groq AI integration
│   │   └── trpc.ts
│   ├── better-auth/
│   │   └── client.ts
│   └── db.ts                     # Prisma client
└── trpc/
    └── react.tsx
```

---

## Database Schema

```prisma
model Document {
    id        String   @id @default(uuid())
    user      User     @relation(fields: [userId], references: [id])
    userId    String
    content   Json?
    title     String   @default("New Draft")
    createdAt DateTime @default(now())
    updatedAt DateTime @default(now()) @updatedAt
}
```

Document content is stored as `Json` (PostgreSQL `jsonb`) — the native Tiptap/ProseMirror document format — so formatting (headings, bold, lists, etc.) is preserved exactly without any serialization layer.

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Groq API key

### Installation

```bash
git clone https://github.com/your-username/writely
cd writely
npm install
```

### Environment Variables

Create a `.env` file:

```env
BETTER_AUTH_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DATABASE_URL=""
GROQ_API_KEY=""
```

### Setup

```bash
# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Design Decisions

**Manual save by design.** Documents save when the user explicitly clicks Save or presses Enter in the title input. This is intentional — it keeps the codebase simple, avoids race conditions between the editor state and the database, and gives users clear control over when their work is committed.

**Content and title save together.** A single `saveDoc` mutation handles both, so there is never a state where title and content are out of sync on the server.

**Editor content is the source of truth.** After the initial load, the document query is not re-fetched on saves. The editor's internal state drives the UI; the database receives a copy only when the user saves.

**AI panel is an overlay, not a split.** Opening the AI assistant does not shrink the writing column. The panel slides over the right side of the editor, preserving the full writing width. Clicking anywhere on the editor closes it.

**Tiptap headings are block-level, not inline.** H1/H2 converts the entire current paragraph block to a heading node — this is standard ProseMirror behavior. You cannot apply a heading to a partial text selection because headings are structural block nodes, not inline marks like bold or italic.

---

## What Writely Intentionally Excludes

- File uploads or image embedding
- Tables
- Comments or annotations
- Real-time collaboration
- Sharing or publishing
- Folder or tag organization
- Markdown import/export
- Revision history

These are excluded by design. Every missing feature is a decision to keep the writing surface clean.

---

## License

MIT
