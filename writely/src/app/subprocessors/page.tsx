import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "~/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Subprocessors",
  description: "Service providers used to operate Writely.",
};

const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export default function SubprocessorsPage() {
  return (
    <LegalPage
      title="Subprocessors"
      summary="The external services confirmed by Writely’s current code and the data each service handles."
    >
      <section>
        <h2>Google</h2>
        <p>
          <strong>Purpose:</strong> Google Sign-In and identity verification.
        </p>
        <p>
          <strong>Data involved:</strong> Google account identifier, name, email
          address, email-verification status, profile-image URL, granted OAuth
          scopes, authentication tokens, and ordinary request metadata. The
          verified production OAuth request asks only for <code>openid</code>,{" "}
          <code>email</code>, and <code>profile</code>.
        </p>
        <p>
          <strong>Location:</strong> The exact processing locations used for
          Writely have not been confirmed and processing may occur outside
          Singapore.
        </p>
        <p>
          <Link
            href="https://policies.google.com/privacy"
            {...externalLinkProps}
          >
            Google Privacy Policy
          </Link>
          {" · "}
          <Link
            href="https://developers.google.com/identity/openid-connect/openid-connect"
            {...externalLinkProps}
          >
            Google OpenID Connect information
          </Link>
          {" · "}
          <Link
            href="https://cloud.google.com/privacy/common-privacy-principles"
            {...externalLinkProps}
          >
            Google privacy and subprocessor information
          </Link>
        </p>
      </section>

      <section>
        <h2>Vercel</h2>
        <p>
          <strong>Purpose:</strong> Hosting Writely&apos;s website, server-side
          application routes, and supporting production infrastructure.
        </p>
        <p>
          <strong>Data involved:</strong> Application requests and ordinary
          technical information such as IP address, browser information, request
          path, timestamps, response status, and application logs. Depending on
          the request, Vercel infrastructure may temporarily process account or
          document information while serving Writely.
        </p>
        <p>
          <strong>Location:</strong> The exact infrastructure region used for
          every Writely request has not been confirmed and processing may occur
          outside Singapore.
        </p>
        <p>
          <Link
            href="https://vercel.com/legal/privacy-notice"
            {...externalLinkProps}
          >
            Vercel Privacy Notice
          </Link>
          {" · "}
          <Link href="https://vercel.com/security" {...externalLinkProps}>
            Vercel security information
          </Link>
          {" · "}
          <Link href="https://vercel.com/legal/dpa" {...externalLinkProps}>
            Vercel Data Processing Addendum
          </Link>
          {" · "}
          <Link href="https://security.vercel.com/" {...externalLinkProps}>
            Vercel subprocessors
          </Link>
        </p>
      </section>

      <section>
        <h2>Neon</h2>
        <p>
          <strong>Purpose:</strong> Managed PostgreSQL database hosting.
        </p>
        <p>
          <strong>Data involved:</strong> Writely account, document, preference,
          session, connected-account, AI usage, and feedback records.
        </p>
        <p>
          <strong>Location:</strong> The region selected for Writely&apos;s
          production Neon project has not been confirmed and processing may
          occur outside Singapore.
        </p>
        <p>
          <Link href="https://neon.com/privacy-policy" {...externalLinkProps}>
            Neon privacy information
          </Link>
          {" · "}
          <Link href="https://neon.com/security" {...externalLinkProps}>
            Neon security information
          </Link>
          {" · "}
          <Link href="https://neon.com/pdf/DPA.pdf" {...externalLinkProps}>
            Neon Data Processing Agreement
          </Link>
          {" · "}
          <Link href="https://neon.com/subprocessors" {...externalLinkProps}>
            Neon subprocessors
          </Link>
        </p>
      </section>

      <section>
        <h2>Groq</h2>
        <p>
          <strong>Purpose:</strong> AI processing for a passage deliberately
          selected by the user.
        </p>
        <p>
          <strong>Data involved:</strong> Selected text and supported
          formatting, the requested action or custom instruction, writing mode,
          Writely system instructions, generated output, token-usage totals, and
          ordinary API metadata. The remainder of the document, document title,
          and account email are not sent by the application code.
        </p>
        <p>
          <strong>Location:</strong> Groq states that retained customer data is
          stored in Google Cloud Platform buckets in the United States.
          Writely&apos;s Global ZDR setting and Inference API ZDR coverage were
          not supplied for this update, so Writely does not claim that ZDR is
          enabled. Until both settings are confirmed, Groq&apos;s standard
          inference retention rules may apply.
        </p>
        <p>
          <Link
            href="https://console.groq.com/docs/your-data"
            {...externalLinkProps}
          >
            Groq data controls
          </Link>
          {" · "}
          <Link href="https://groq.com/privacy-policy" {...externalLinkProps}>
            Groq Privacy Policy
          </Link>
          {" · "}
          <Link
            href="https://console.groq.com/docs/legal/customer-data-processing-addendum"
            {...externalLinkProps}
          >
            Groq Data Processing Addendum
          </Link>
          {" · "}
          <Link
            href="https://trust.groq.com/subprocessors"
            {...externalLinkProps}
          >
            Groq subprocessors
          </Link>
        </p>
      </section>

      <section>
        <h2>Services Writely does not currently use</h2>
        <p>
          Based on the repository and the production deployment configuration
          reviewed for this update, Writely does not currently use an analytics
          provider, advertising network, email-delivery provider, or external
          error-monitoring SDK. This page and the Privacy Notice must be updated
          before any such service is introduced.
        </p>
      </section>
    </LegalPage>
  );
}
