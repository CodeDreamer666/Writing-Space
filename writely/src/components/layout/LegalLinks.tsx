import Link from "next/link";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/acceptable-use", label: "Acceptable Use" },
  { href: "/subprocessors", label: "Subprocessors" },
  { href: "/data-deletion", label: "Data Deletion" },
] as const;

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Legal and privacy"
      className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}
    >
      {legalLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="transition-colors hover:text-[var(--w-foreground)]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function SignInLegalNotice() {
  return (
    <div
      data-sign-in-legal-notice
      className="mt-6 text-xs leading-6 text-[var(--w-subtle)]"
    >
      <p>
        By continuing, you agree to the{" "}
        <Link
          href="/terms"
          className="underline decoration-[var(--w-border)] underline-offset-4 hover:text-[var(--w-foreground)]"
        >
          Terms of Use
        </Link>{" "}
        and acknowledge the{" "}
        <Link
          href="/privacy"
          className="underline decoration-[var(--w-border)] underline-offset-4 hover:text-[var(--w-foreground)]"
        >
          Privacy Notice
        </Link>
        .
      </p>
      <LegalLinks className="mt-3" />
    </div>
  );
}
