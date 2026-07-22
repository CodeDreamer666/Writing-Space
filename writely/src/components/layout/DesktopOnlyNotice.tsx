export default function DesktopOnlyNotice() {
  return (
    <main
      className="desktop-beta-notice fixed inset-0 z-[100] items-center justify-center bg-[var(--w-background)] px-6 text-center text-[var(--w-foreground)]"
      aria-labelledby="desktop-only-title"
    >
      <section className="w-full max-w-sm">
        <div
          className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[var(--w-border)] bg-[var(--w-surface)] text-[var(--w-strong)]"
          aria-hidden="true"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="4" width="16" height="11" rx="1.5" />
            <path d="M2.5 19h19" />
            <path d="M9 19h6" />
          </svg>
        </div>
        <p className="mt-6 text-xs font-medium tracking-[0.16em] text-[var(--w-subtle)] uppercase">
          Writely beta
        </p>
        <h1
          id="desktop-only-title"
          className="mt-3 text-2xl font-medium tracking-[-0.03em]"
        >
          Designed for wider screens.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--w-muted)]">
          Writely is currently designed for laptops and desktops. Please open it
          on a wider screen.
        </p>
      </section>
    </main>
  );
}
