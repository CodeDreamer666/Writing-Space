"use client";

import Link from "next/link";
import ThemeSelector from "~/components/shared/ThemeSelector";
import { useUiLanguage } from "~/hooks/useUiLanguage";
import {
  DAILY_AI_TOKEN_LIMIT,
  MAX_AI_SELECTION_CHARACTERS,
} from "~/lib/aiLimits";
import {
  MAX_DOCUMENT_CHARACTERS,
  MAX_DOCUMENTS_PER_USER,
} from "~/lib/documentLimits";
import {
  AuthenticatedAccount,
  InterfaceLanguageSettings,
  SignOutButton,
} from "./SettingsControls";

const shortcutKeys = [
  ["Ctrl/Cmd + Alt + N", "settings.createDocument"],
  ["Ctrl/Cmd + Alt + F", "settings.toggleFocus"],
  ["Ctrl/Cmd + Alt + E", "settings.openExport"],
  ["Esc", "settings.closePanels"],
] as const;

export default function SettingsPageContent() {
  const { locale, t } = useUiLanguage();

  return (
    <main className="min-h-screen bg-[var(--w-background)] px-6 py-10 text-[var(--w-foreground)] sm:px-8 sm:py-14">
      <article className="mx-auto max-w-3xl pb-8">
        <header className="mt-4 border-b border-[var(--w-border-soft)] pb-10">
          <div className="flex w-full items-center justify-between">
            <p className="text-xs font-medium tracking-[0.14em] text-[var(--w-subtle)] uppercase">
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
            <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
              {t("settings.title")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-[var(--w-muted)]">
              {t("settings.intro")}
            </p>
          </div>
        </header>

        <div className="divide-y divide-[var(--w-border-soft)]">
          <SettingsSection title={t("settings.theme")}>
            <p>{t("settings.themeDescription")}</p>
            <div className="mt-5">
              <ThemeSelector />
            </div>
            <p className="mt-4 text-xs text-[var(--w-subtle)]">
              {t("settings.systemTheme")}
            </p>
          </SettingsSection>

          <SettingsSection title={t("settings.shortcuts")}>
            <dl className="mt-6 divide-y divide-[var(--w-border-soft)] border-y border-[var(--w-border-soft)]">
              {shortcutKeys.map(([keys, descriptionKey]) => (
                <div
                  key={keys}
                  className="flex items-center justify-between gap-6 py-3 text-sm"
                >
                  <dt className="text-[var(--w-strong)]">
                    {t(descriptionKey)}
                  </dt>
                  <dd className="shrink-0 rounded border border-[var(--w-border)] bg-[var(--w-surface)] px-2 py-1 font-mono text-xs text-[var(--w-muted)]">
                    {keys}
                  </dd>
                </div>
              ))}
            </dl>
          </SettingsSection>

          <SettingsSection title={t("settings.autosave")}>
            <p>{t("settings.autosaveDescription")}</p>
            <p className="mt-4">{t("settings.recoveryDescription")}</p>
          </SettingsSection>

          <SettingsSection title={t("settings.aiUsage")}>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                {t("settings.dailyTokens", {
                  count: DAILY_AI_TOKEN_LIMIT.toLocaleString(locale),
                })}
              </li>
              <li>
                {t("settings.selectionLimit", {
                  count: MAX_AI_SELECTION_CHARACTERS.toLocaleString(locale),
                })}
              </li>
              <li>{t("settings.oneRequest")}</li>
              <li>{t("settings.selectedOnly")}</li>
            </ul>
            <p className="mt-4">{t("settings.failedNotCharged")}</p>
          </SettingsSection>

          <SettingsSection title={t("settings.language")}>
            <p>{t("settings.languageDescription")}</p>
            <InterfaceLanguageSettings />
            <p className="mt-4">{t("settings.languageNotice")}</p>
            <p className="mt-4">{t("settings.pictographNotice")}</p>
          </SettingsSection>

          <SettingsSection title={t("settings.documentLimits")}>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                {t("settings.documentCount", {
                  count: MAX_DOCUMENTS_PER_USER.toLocaleString(locale),
                })}
              </li>
              <li>
                {t("settings.documentCharacters", {
                  count: MAX_DOCUMENT_CHARACTERS.toLocaleString(locale),
                })}
              </li>
            </ul>
          </SettingsSection>

          <SettingsSection title={t("settings.export")}>
            <p>{t("settings.exportDescription")}</p>
          </SettingsSection>

          <SettingsSection title={t("settings.privacy")}>
            <p>{t("settings.privacyDescription")}</p>
            <Link
              href="/privacy"
              className="mt-5 inline-flex font-medium text-[var(--w-strong)] underline decoration-[var(--w-subtle)] underline-offset-4 hover:text-[var(--w-foreground)]"
            >
              {t("settings.readPrivacy")}
            </Link>
          </SettingsSection>

          <SettingsSection title={t("settings.beta")}>
            <p className="mt-5">{t("settings.betaDescription")}</p>
          </SettingsSection>

          <AuthenticatedAccount>
            <SettingsSection title={t("settings.account")}>
              <p>{t("settings.accountDescription")}</p>
              <SignOutButton />
            </SettingsSection>
          </AuthenticatedAccount>
        </div>
      </article>
    </main>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10">
      <h2 className="text-xl font-medium text-[var(--w-foreground)]">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-7 text-[var(--w-muted)]">
        {children}
      </div>
    </section>
  );
}
