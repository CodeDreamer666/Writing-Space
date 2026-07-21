import type { SaveStatus } from "../hooks/useDocumentAutosave";

type Props = {
  saveStatus: SaveStatus;
};

function saveStatusLabel(status: SaveStatus) {
  if (status === "error") {
    return "Save failed";
  }

  if (status === "saved") {
    return "Saved";
  }

  if (status === "conflict") {
    return "Resolve conflict";
  }

  if (status === "recovery") {
    return "Recovery available";
  }

  return "Saving…";
}

export default function EditorTopBar({
  saveStatus,
}: Props) {

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--w-border-soft)] bg-[var(--w-background)]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5">
          <span
            role="status"
            className={`mr-1 text-xs ${
              saveStatus === "error"
                ? "text-[#C96F5B]"
                : "text-[var(--w-subtle)]"
            }`}
          >
            {saveStatusLabel(saveStatus)}
          </span>
        </div>
      </div>
    </header>
  );
}
