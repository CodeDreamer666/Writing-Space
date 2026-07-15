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

## Product Complexity Rules

- Prefer the simplest reliable user experience over the smoothest technically possible experience.
- Do not add hidden lifecycle complexity for a small convenience without explaining the tradeoff first.
- Before implementing a UX behaviour, identify:
  1. the user problem,
  2. how frequently it occurs,
  3. the simplest reliable solution,
  4. the implementation and maintenance cost.
- When a small UX feature requires several refs, effects, browser lifecycle events, manual cache manipulation, or custom networking, stop and propose a simpler alternative.
- Do not implement speculative polish unless it is explicitly requested.
- Preserving a small amount of acceptable friction when removing it would create fragile or difficult-to-maintain code.
- Do not treat every possible edge case as a required product feature.
- Core reliability, data protection, security, and understandable feedback take priority over invisible convenience.

## Task Scope Rules

- Work on one clearly defined user outcome at a time.
- Before changing code, inspect the relevant flow and state which files are likely to change.
- Do not modify unrelated UI, behaviour, architecture, or naming.
- Do not add additional features while implementing the requested task.
- When noticing an unrelated problem, report it separately instead of fixing it automatically.
- For small tasks, prefer a small diff.
- If the planned solution expands significantly beyond the original request, stop and explain why before continuing.
- Define the completion conditions before implementation.
  
## React Complexity Rules

- Effects should synchronize with external systems, not coordinate ordinary event-driven logic when a direct handler would be clearer.
- Avoid chains where one effect updates state that triggers another effect.
- Do not use `useCallback` or `useMemo` automatically; use them only for a clear correctness or performance reason.
- Use refs only when a value must persist without causing a render, or when an external callback requires the latest value.
- If one component coordinates multiple independent systems, separate them by responsibility.
- Prefer a named custom hook when several states, refs, effects, and handlers belong to one lifecycle such as document saving.
- Do not hide a simple operation behind a generic abstraction.
- When refactoring, improve readability without changing user behaviour unless behaviour changes are explicitly approved.
  
## Verification Rules

After implementation:
- Run the relevant formatter, linter, type checker, and tests available in the project.
- Test the primary successful path.
- Test loading, empty, error, and repeated-action states when relevant.
- For mutations, verify authentication, ownership, server validation, size limits, and safe errors.
- For responsive UI changes, check mobile, tablet, and desktop layouts.
- Summarize:
  - what changed,
  - which files changed,
  - what was tested,
  - remaining risks or limitations.

## Aditional Rules

Current:
- If a file is under 150 lines and easy to read, it can stay together.
- If a file is 200-300+ lines, consider splitting it.
Improved:
- File length is a warning signal, not `the main reason to split code.
- Keep a file together when it has one understandable responsibility.
- Split a file when it coordinates multiple independent concerns, contains difficult lifecycle logic, or cannot be explained clearly.
- A readable 250-line component may remain together.
- A confusing 120-line component may need separation.


