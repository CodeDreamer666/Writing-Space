# Coding Style Rules

- Follow the existing T3 Stack structure: `src/app`, `src/server/api/routers`, `src/trpc`, and Prisma.
- Use tRPC mutations for writes. Do not introduce Server Actions into a tRPC mutation flow.
- Keep feature code close to its route or domain; use `components/shared` only for clearly reusable UI.
- Prefer direct, controlled React forms with local state and readable submit handlers over generic form wrappers.
- Use optimistic tRPC cache updates only when useful; handle errors consistently and invalidate affected data after mutations.
- Put global app structure in `layout.tsx` unless there is a strong reason to split it.
- Follow established PascalCase component files, camelCase functions/hooks, and descriptive router procedure names.
- Before creating files or patterns, inspect nearby existing code and match it.
- Avoid generic abstractions, premature utilities, and over-engineering.
- Never modify `.env` files.

## Codebase Organization Rules

- Organize application code by feature/domain when the project grows beyond a few simple files.
- Keep route files inside `src/app`; pages should mostly compose feature components and stay thin.
- Put feature-specific UI in `src/features/[feature-name]/components`.
- Put feature-specific hooks in `src/features/[feature-name]/hooks`.
- Put feature-specific helpers in `src/features/[feature-name]/utils`.
- Put reusable UI in `src/components/shared`.
- Put layout/navigation UI such as `Navbar`, `Sidebar`, `Header`, `Footer`, and `PageShell` in `src/components/layout`.
- Put general helpers used across features in `src/lib`.
- Put shared TypeScript types in `src/types`; keep feature-only types in the feature folder as `types.ts`.
- Keep backend routers in `src/server/api/routers`.
- Keep database, auth, and server-only logic under `src/server` or clearly server-only `src/lib` files.
- Do not import frontend/app UI folders from server routers.
- Preserve `"use client"` only where client hooks, browser APIs, or client interactivity require it.
- Prefer moving repeated logic into hooks or small utilities only when it clearly improves readability.
- Do not create folders or tiny files just to look organized; every folder should have a clear purpose.
- If a file is under 150 lines and easy to read, it can stay together.
- If a file is 200-300+ lines, consider splitting it into feature components, hooks, or helpers.
- If JSX has too much condition logic, move the decision logic into a named helper function.
- If the same UI appears more than once, consider extracting a component.
- If the same logic appears more than once, consider extracting a utility or hook.

## JSX Formatting Rules

- Never write compressed JSX where children or many props are squeezed onto one line.
- Put nested elements on separate lines.
- Put multiple props on separate lines.
- Do not squeeze children into the same line as the parent.
- Do not create long `className` strings mixed with many props on one unreadable line.
- Prefer readable structure over fewer lines.
- If a component has more than 2 props, split the props across lines.
- If a JSX element has children, put children on their own lines.
- If a condition renders JSX, format it clearly.

Preferred map formatting:

```tsx
{items.map((item) => (
  <Card
    key={item.id}
    title={item.title}
    description={item.description}
    onClick={() => handleClick(item.id)}
  />
))}
```

## Function and Logic Formatting

- Do not compress logic just to reduce line count.
- Use readable steps and clear spacing.

Preferred logic formatting:

```ts
if (!user) {
  return null;
}

const note = await db.note.findFirst({
  where: {
    id,
    userId: user.id,
  },
});
```
