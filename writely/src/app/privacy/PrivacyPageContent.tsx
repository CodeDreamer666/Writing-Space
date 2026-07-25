"use client";

import Link from "next/link";
import { useUiLanguage } from "~/hooks/useUiLanguage";
import { PUBLIC_COPY } from "~/lib/publicTranslations";

export default function PrivacyPageContent() {
  const { language, t } = useUiLanguage();
  const copy = PUBLIC_COPY[language].privacy;

  return (
    <main className="min-h-screen bg-[var(--w-background)] px-5 py-16 text-[var(--w-foreground)] sm:px-8">
      <article className="mx-auto max-w-2xl">
        <div className="flex flex-col">
          <div className="flex w-full justify-between">
            <p className="text-xs font-medium tracking-[0.12em] text-[var(--w-subtle)] uppercase">
              {t("common.writelyBeta")}
            </p>
            <Link
              href="/"
              className="text-sm text-[var(--w-muted)] transition-colors hover:text-[var(--w-foreground)]"
            >
              {t("common.backToWritely")}
            </Link>
          </div>
          <div>
            <h1 className="mt-3 text-4xl font-medium tracking-tight">
              {copy.title}
            </h1>
            <p className="mt-4 text-base leading-8 text-[var(--w-muted)]">
              {copy.intro}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-[var(--w-muted)]">
          <section>
            <h2 className="text-lg font-medium text-[var(--w-foreground)]">
              {copy.storesTitle}
            </h2>
            <p className="mt-2">{copy.storesAccount}</p>
            <p className="mt-4">{copy.storesDocuments}</p>
            <p className="mt-4">{copy.storesUsage}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[var(--w-foreground)]">
              {copy.aiTitle}
            </h2>
            <p className="mt-2">{copy.aiSelected}</p>
            <p className="mt-4">{copy.aiProvider}</p>
            <p className="mt-4">{copy.aiRetention}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[var(--w-foreground)]">
              {copy.recoveryTitle}
            </h2>
            <p className="mt-2">{copy.recoveryDescription}</p>
            <p className="mt-4">{copy.recoveryRemoval}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[var(--w-foreground)]">
              {copy.providersTitle}
            </h2>
            <p className="mt-2">{copy.providersIntro}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {copy.providers.map((provider) => (
                <li key={provider}>{provider}</li>
              ))}
            </ul>
            <p className="mt-4">{copy.providersRole}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[var(--w-foreground)]">
              {copy.choicesTitle}
            </h2>
            <p className="mt-2">{copy.choicesDescription}</p>
            <p className="mt-4">{copy.contact}</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[var(--w-foreground)]">
              {copy.betaTitle}
            </h2>
            <p className="mt-2">{copy.betaDescription}</p>
            <p className="mt-4">{copy.updated}</p>
          </section>
        </div>
      </article>
    </main>
  );
}
