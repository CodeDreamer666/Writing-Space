import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "~/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Data Deletion",
  description:
    "How to delete Writely documents, recovery copies, and accounts.",
};

export default function DataDeletionPage() {
  return (
    <LegalPage
      title="Data Deletion"
      summary="Self-service steps for removing a document, browser recovery copies, or your Writely account."
    >
      <section>
        <h2>Delete one document</h2>
        <ul>
          <li>Open the Writely drafts page.</li>
          <li>Open the options button beside the document.</li>
          <li>Choose Delete and confirm.</li>
        </ul>
        <p>
          The server verifies that the document belongs to your signed-in
          account. A successful deletion permanently removes the document from
          the live database and clears that document&apos;s recovery copy in the
          current browser. The action cannot be undone.
        </p>
      </section>

      <section>
        <h2>Clear browser recovery copies</h2>
        <p>
          Go to Settings &amp; Help and choose “Clear browser recovery copies.”
          This removes Writely recovery drafts from the current browser profile
          without removing theme or interface-language preferences.
        </p>
        <p>
          Repeat this step on every browser, device, and browser profile you
          used. You can also clear site data for Writely through your browser
          settings. Recovery copies older than 30 days are removed during
          Writely&apos;s automatic cleanup.
        </p>
      </section>

      <section>
        <h2>Download your data first</h2>
        <p>
          In Settings &amp; Help, choose “Download my data” to receive a
          readable JSON file containing your account details, active documents,
          preferences, AI usage totals, feedback, session details, and connected
          account information. Authentication tokens are excluded.
        </p>
      </section>

      <section>
        <h2>Delete your account</h2>
        <ul>
          <li>Sign in and open Settings &amp; Help.</li>
          <li>Choose Delete account.</li>
          <li>Read the warning and confirm permanent deletion.</li>
        </ul>
        <p>
          For security, Better Auth requires a recent authenticated session. If
          deletion is refused because the session is no longer fresh, sign out,
          sign in again with Google, and retry.
        </p>
        <p>
          Account deletion removes the live user record and linked documents,
          account preferences, Writely sessions, connected Google-account
          records and stored OAuth tokens, AI usage records, and feedback. It
          invalidates the stored Writely sessions and clears Writely recovery
          copies in the browser used for deletion.
        </p>
      </section>

      <section>
        <h2>Inserted AI responses</h2>
        <p>
          An AI response that you accepted or inserted is part of the document.
          It is deleted when you delete that document or your account. A
          response you did not insert is not stored by Writely as a separate
          database record.
        </p>
      </section>

      <section>
        <h2>Provider backups</h2>
        <p>
          The repository does not confirm the production backup schedules or
          expiry periods for the database or hosting provider. Deleted data may
          remain in protected provider backups until the provider&apos;s normal
          backup cycle expires. Writely will not publish a specific backup
          deletion promise until the relevant provider settings and terms are
          confirmed.
        </p>
      </section>

      <section>
        <h2>If self-service deletion fails</h2>
        <p>
          Email{" "}
          <a href="mailto:code.dreamer666@gmail.com">
            code.dreamer666@gmail.com
          </a>{" "}
          from the email address connected to your Writely account. Do not send
          your Google password, session cookie, OAuth token, or full document
          contents. Writely may ask you to complete a fresh sign-in or provide
          limited information needed to verify identity before deleting or
          disclosing account data.
        </p>
        <p>
          More information about what Writely stores is in the{" "}
          <Link href="/privacy">Privacy Notice</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
