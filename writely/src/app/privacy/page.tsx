import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Writely handles account, document, AI, and usage data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0B0D10] px-5 py-16 text-[#F5F5F7] sm:px-8">
      <article className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-[#AEB4BE] transition-colors hover:text-[#F5F5F7]"
        >
          ← Back to Writely
        </Link>

        <p className="mt-12 text-xs font-medium tracking-[0.12em] text-[#6B7280] uppercase">
          Writely beta
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">
          Privacy, in plain language
        </h1>
        <p className="mt-4 text-base leading-8 text-[#AEB4BE]">
          Writely stores the information needed to provide your account and
          writing workspace. We aim to collect only what the product needs to
          work, stay secure, and improve during beta testing.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-[#AEB4BE]">
          <section>
            <h2 className="text-lg font-medium text-[#F5F5F7]">
              Account and documents
            </h2>
            <p className="mt-2">
              We store account information provided through sign-in, such as
              your name, email address, profile image, session information, and
              authentication account details.
            </p>
            <p className="mt-4">
              We also store the information needed to provide your writing
              workspace, including:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Document titles</li>
              <li>Document text</li>
              <li>Supported formatting</li>
              <li>Writing mode or editor settings</li>
              <li>
                Save and update information needed for autosave and recovery
              </li>
            </ul>
            <p className="mt-4">
              This information is stored because it is required for Writely to
              save, open, recover, and manage your documents.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[#F5F5F7]">
              AI requests and usage
            </h2>
            <p className="mt-2">
              Writely’s AI features work only on text you select.
            </p>
            <p className="mt-4">
              When you use an AI action, the selected text and the requested AI
              instruction are sent temporarily to the AI provider so a response
              can be generated.
            </p>
            <p className="mt-4">Writely does not intentionally store:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Your AI prompts</li>
              <li>The selected text sent to AI</li>
              <li>AI-generated responses</li>
            </ul>
            <p className="mt-4">For daily AI limits, Writely stores only:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Your user ID</li>
              <li>The usage date</li>
              <li>The number of AI tokens used</li>
            </ul>
            <p className="mt-4">
              This information is used to enforce the daily AI allowance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[#F5F5F7]">
              Recovery data
            </h2>
            <p className="mt-2">
              Writely may keep a recent unsaved recovery copy of your document
              in your browser.
            </p>
            <p className="mt-4">
              This helps protect your writing if the page is refreshed, the tab
              is closed unexpectedly, or a save request fails.
            </p>
            <p className="mt-4">
              Recovery data stored in your browser remains on that device and
              may be removed if you clear your browser data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[#F5F5F7]">Feedback</h2>
            <p className="mt-2">
              When you choose to submit feedback, Writely may store:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>The feedback you submit</li>
              <li>Your user ID</li>
              <li>The time the feedback was submitted</li>
            </ul>
            <p className="mt-4">
              This information is used to understand problems, improve the beta,
              and respond to issues where necessary.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[#F5F5F7]">
              Operational and security data
            </h2>
            <p className="mt-2">
              Writely and the services it relies on may process ordinary
              technical information required to operate and secure the service.
            </p>
            <p className="mt-4">This can include information such as:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Requests made to the service</li>
              <li>Session information</li>
              <li>Error information</li>
              <li>Basic technical or security logs</li>
            </ul>
            <p className="mt-4">
              Writely may rely on third-party services for areas such as
              hosting, databases, authentication, and AI processing. These
              providers may process information as necessary to provide their
              services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[#F5F5F7]">
              What Writely does not aim to collect
            </h2>
            <p className="mt-2">
              Writely is not designed to collect more personal information than
              necessary for the writing service.
            </p>
            <p className="mt-4">
              You should avoid entering highly sensitive information such as
              passwords, payment details, confidential personal records, or
              other information you would not want processed by an online
              service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-[#F5F5F7]">Beta notice</h2>
            <p className="mt-2">Writely is currently in beta.</p>
            <p className="mt-4">
              Features, data practices, and supporting services may change as
              the product develops. This privacy information may be updated when
              those changes affect how data is handled.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
