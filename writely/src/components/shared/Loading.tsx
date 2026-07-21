export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--w-background)]">
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--w-border)] border-t-[var(--w-foreground)]" />
      </div>
    </div>
  );
}
