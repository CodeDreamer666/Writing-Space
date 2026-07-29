import Link from "next/link";
import { LegalPage } from "~/components/layout/LegalPage";

const privacyEmail = "code.dreamer666@gmail.com";

export default function PrivacyPageContent() {
  return (
    <LegalPage
      title="Privacy Notice"
      summary="How the Writely beta collects, uses, stores, shares, and deletes personal data, in plain language."
    >
      <section>
        <h2>Who this notice is for</h2>
        <p>
          Writely is an independent, free, non-commercial beta writing project
          based in Singapore. It is not currently operated by a registered
          company or ACRA-registered business. This notice uses Singapore&apos;s
          Personal Data Protection Act (PDPA) as its primary privacy framework.
        </p>
        <p>
          Writely does not currently charge users, display advertising, accept
          donations, or sell personal data.
        </p>
      </section>

      <section>
        <h2>Information Writely handles</h2>
        <h3>Google account and authentication information</h3>
        <p>
          Google Sign-In is configured with the standard <code>openid</code>,{" "}
          <code>email</code>, and <code>profile</code> scopes. Writely receives
          and stores your Google account identifier, name, email address, email
          verification status, and profile-image URL. Better Auth also stores
          the OAuth tokens and scope information needed to establish and manage
          your account. New or refreshed OAuth tokens are encrypted before they
          are stored.
        </p>

        <h3>Documents and preferences</h3>
        <p>
          Writely stores document titles, writing and supported formatting,
          writing mode, document version, creation and update times, and save
          information. It also stores account preferences such as whether the
          leave-editor reminder is disabled. Your theme and writing-appearance
          preferences are kept in your browser.
        </p>

        <h3>AI usage</h3>
        <p>
          Writely stores daily AI token totals and short-lived request-lock
          information used to enforce the daily allowance and prevent duplicate
          AI requests. Writely does not store selected AI text, instructions, or
          AI responses in its own database as separate AI records.
        </p>

        <h3>Feedback</h3>
        <p>
          If you submit beta feedback, Writely stores the message, your account
          identifier, and the submission time. Feedback is optional.
        </p>

        <h3>Sessions and technical information</h3>
        <p>
          Better Auth stores session identifiers, expiry and update times, and
          may store the IP address and browser user-agent associated with a
          session. Service providers may also generate necessary request,
          security, reliability, and error logs containing information such as
          IP address, browser details, request path, and timestamps. Writely has
          not found analytics, advertising trackers, an email provider, or an
          error-monitoring SDK in the repository.
        </p>
      </section>

      <section>
        <h2>Why Writely uses this information</h2>
        <ul>
          <li>To sign you in and keep your account and sessions secure.</li>
          <li>
            To create, save, synchronize, display, export, and delete writing.
          </li>
          <li>
            To recover recent unsaved changes after a failed save or
            interruption.
          </li>
          <li>
            To provide an AI action only when you deliberately request it.
          </li>
          <li>
            To enforce product limits and reduce automated or repeated abuse.
          </li>
          <li>
            To receive beta feedback, investigate problems, and protect Writely.
          </li>
          <li>
            To respond to privacy, correction, deletion, or legal requests.
          </li>
        </ul>
      </section>

      <section>
        <h2>Browser recovery copies</h2>
        <p>
          While you edit, Writely may keep a temporary recovery copy in this
          browser&apos;s local storage. It contains the document identifier,
          title, writing and formatting, the saved document version, and a
          timestamp. It stays on the device and browser profile where it was
          created; it is not a server backup.
        </p>
        <p>
          A recovery copy is cleared after a confirmed save or deliberate
          discard. Copies older than 30 days are removed automatically when
          Writely next performs recovery cleanup. You can clear all Writely
          recovery copies from Settings &amp; Help, or remove Writely site data
          through your browser settings.
        </p>
      </section>

      <section>
        <h2>Selected-text AI and Groq</h2>
        <p>
          AI runs only after you deliberately select text and choose an AI
          action. The server verifies that you own the document before it calls
          Groq. Writely sends Groq:
        </p>
        <ul>
          <li>the selected text and its supported formatting;</li>
          <li>the built-in action or custom instruction for that request;</li>
          <li>the selected writing mode;</li>
          <li>
            system instructions needed to produce and safely format the result;
            and
          </li>
          <li>ordinary API metadata generated by the request.</li>
        </ul>
        <p>
          The code does not retrieve or send the rest of the document. It sends
          only the selected passage, not the document title or account email.
          Groq returns the generated text and token-usage totals.
        </p>
        <p>
          Groq states that it always retains usage metadata that does not
          contain customer inputs or outputs. Groq may temporarily retain inputs
          and outputs for reliability or abuse investigation under its standard
          data controls. Groq&apos;s documentation says retained customer data
          is stored in the United States.
        </p>
        <p>
          Writely intends to use Groq Zero Data Retention, but the repository
          cannot confirm whether Global ZDR and the Inference API setting are
          enabled for the production Groq account. Until that setting is
          manually confirmed, users should assume Groq&apos;s standard inference
          retention rules may apply. See{" "}
          <Link href="https://console.groq.com/docs/your-data">
            Groq&apos;s current data documentation
          </Link>
          .
        </p>
        <p>
          An AI response remains temporary unless you choose to insert or accept
          it. Once inserted, it becomes part of your stored document and is
          handled like the rest of that document.
        </p>
      </section>

      <section>
        <h2>Service providers and overseas processing</h2>
        <p>Writely currently relies on these confirmed providers:</p>
        <ul>
          <li>Google for identity and Google Sign-In.</li>
          <li>
            Neon for the PostgreSQL database that stores account and document
            data.
          </li>
          <li>Groq for selected-text AI processing.</li>
        </ul>
        <p>
          These providers may process personal data outside Singapore. Groq
          documents United States storage for retained customer data. The
          production Neon region and the application-hosting provider and region
          are not confirmed in the repository. They must be confirmed before
          public beta. More detail is available on the{" "}
          <Link href="/subprocessors">Subprocessors page</Link>.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Writely uses essential authentication and security cookies so Google
          Sign-In and account sessions work. Better Auth configures session
          cookies as HttpOnly and SameSite=Lax, and uses Secure cookies in
          production. Writely does not currently use advertising or analytics
          cookies in the repository, so it does not show a non-essential cookie
          banner or maintain a separate Cookies page.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          Writely uses server-side authentication and ownership checks, document
          and request size limits, AI usage limits, structured-content
          validation, unsafe-link checks, sanitized AI HTML, encrypted OAuth
          tokens, restricted authentication cookies, same-origin checks on
          authenticated API posts, production-safe errors, and browser security
          headers. Sensitive document and AI request bodies are excluded from
          application logging.
        </p>
        <p>
          No online service can promise complete security. If you believe your
          Writely account or personal data is at risk, contact the privacy email
          below promptly.
        </p>
      </section>

      <section>
        <h2>Retention and deletion</h2>
        <p>
          Active account information, documents, preferences, feedback, session
          records, and AI usage totals remain in the live database while needed
          to operate your account, unless you delete them or ask Writely to do
          so. There is not currently a separate automatic deletion schedule for
          feedback or historical daily AI totals.
        </p>
        <p>
          Deleting a document permanently removes it from the live application
          database and clears its recovery copy in the current browser. Deleting
          your account removes the live user record and linked documents,
          preferences, sessions, connected OAuth-account records, AI usage
          totals, and feedback through database cascade deletion. It also clears
          Writely recovery copies in the browser used for deletion.
        </p>
        <p>
          Provider backup retention and deletion timing are not controlled by
          this repository and remain to be confirmed. Copies may remain in
          protected provider backups until those backups expire. See the{" "}
          <Link href="/data-deletion">Data Deletion page</Link> for steps and
          limitations.
        </p>
      </section>

      <section>
        <h2>Your choices and requests</h2>
        <p>
          You can download a JSON copy of your Writely data, delete documents,
          clear browser recovery copies, and delete your account from Settings
          &amp; Help. You may also ask to access or correct personal data, or
          withdraw consent, by emailing{" "}
          <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. Writely may ask
          for reasonable identity verification before disclosing or changing
          account data.
        </p>
        <p>
          Withdrawing consent does not affect processing that occurred before
          the withdrawal. If Writely can no longer use information necessary to
          authenticate you or store your documents, the practical result may be
          account deletion or loss of access to those features.
        </p>
      </section>

      <section>
        <h2>Personal-data incidents</h2>
        <p>
          Writely will investigate suspected personal-data incidents, contain
          the issue, assess affected data and users, and consider whether
          notification to Singapore&apos;s Personal Data Protection Commission
          and affected individuals is required. Writely will provide notices as
          soon as practicable when the PDPA requires them.
        </p>
      </section>

      <section>
        <h2>Privacy contact</h2>
        <p>
          Privacy questions, requests, and complaints can be sent to{" "}
          <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. The public
          title “Privacy Contact” is used until the appropriate DPO designation
          and registration approach are manually confirmed.
        </p>
      </section>

      <section>
        <h2>Changes to this notice</h2>
        <p>
          Writely may update this notice as the beta changes. The updated date
          will be shown here. Material changes will also be communicated through
          a prominent notice in Writely before or when they take effect where
          reasonably possible.
        </p>
      </section>
    </LegalPage>
  );
}
