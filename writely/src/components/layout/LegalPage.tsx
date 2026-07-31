import Link from "next/link";
import type { ReactNode } from "react";
import { LegalLinks } from "./LegalLinks";

export function LegalPage({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-(--w-background) px-5 py-16 text-(--w-foreground) sm:px-8">
      <article className="mx-auto max-w-3xl pb-8">
        <header className="mt-4 border-b border-(--w-border-soft) pb-10">
          <div className="flex w-full items-center justify-between gap-4">
            <p className="text-xs font-medium tracking-[0.14em] text-(--w-subtle) uppercase">
              Writely beta
            </p>
            <Link
              href="/"
              className="text-sm text-(--w-muted) transition-colors hover:text-(--w-foreground)"
            >
              Back to Writely
            </Link>
          </div>
          <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-(--w-muted)">
            {summary}
          </p>
          <p className="mt-4 text-xs text-(--w-subtle)">
            Last updated: 27 July 2026
          </p>
        </header>

        <div className="legal-copy mt-10 space-y-9 text-sm leading-7 text-(--w-muted) [&_a]:font-medium [&_a]:text-(--w-strong) [&_a]:underline [&_a]:decoration-(--w-border) [&_a]:underline-offset-4 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-(--w-foreground) [&_h3]:mt-5 [&_h3]:font-medium [&_h3]:text-(--w-strong) [&_li]:pl-1 [&_p+p]:mt-4 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>

        <footer className="mt-12 border-t border-(--w-border-soft) pt-8 text-xs text-(--w-subtle)">
          <LegalLinks />
        </footer>
      </article>
    </main>
  );
}
