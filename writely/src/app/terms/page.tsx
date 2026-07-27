import type { Metadata } from "next";
import { LegalPage } from "~/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Plain-language terms for using the Writely public beta.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      summary="The basic rules for using Writely and what to expect from a free public beta."
    >
      <section>
        <h2>About Writely</h2>
        <p>
          Writely is an independent, free, non-commercial beta writing project
          based in Singapore. It is not currently operated by a registered
          company. By creating an account or using Writely, you agree to these
          Terms of Use and the Acceptable Use Policy and acknowledge the Privacy
          Notice.
        </p>
      </section>

      <section>
        <h2>Age</h2>
        <p>
          Writely is intended for users aged 13 and above. Users below 18 should
          use Writely with the permission and supervision of a parent or legal
          guardian.
        </p>
      </section>

      <section>
        <h2>A changing beta service</h2>
        <p>
          Writely is still being tested. Features, limits, providers, and
          supported formats may change. The service may be interrupted,
          restricted, or discontinued. Writely does not guarantee uptime,
          uninterrupted access, error-free operation, or that a beta feature
          will remain available.
        </p>
        <p>
          Keep your own copies of important writing. Browser recovery is a
          convenience for recent unsaved changes, not a complete backup system.
        </p>
      </section>

      <section>
        <h2>Your writing stays yours</h2>
        <p>
          You retain ownership of the writing and other content you submit.
          Writely does not claim ownership of your documents.
        </p>
        <p>
          You give Writely only the limited permission needed to host, store,
          process, synchronize, back up, display, export, protect, and—when you
          explicitly request an AI action—send the selected passage and
          instruction to the AI provider. This permission lasts only while the
          content is needed to provide Writely, subject to provider backup
          handling and legal requirements described in the Privacy Notice.
        </p>
      </section>

      <section>
        <h2>Your responsibilities</h2>
        <p>
          You are responsible for content you submit, instructions you give, and
          how you use or publish the result. You must have the right to use the
          content and must follow applicable law, these Terms, and the
          Acceptable Use Policy. Keep your Google account secure and do not let
          another person misuse your Writely session.
        </p>
      </section>

      <section>
        <h2>AI features</h2>
        <p>
          AI-generated text can be inaccurate, incomplete, biased,
          inappropriate, or similar to content generated for other users. Review
          every result before accepting, relying on, or publishing it.
        </p>
        <p>
          AI output is not professional legal, medical, financial, or other
          specialist advice. Do not use it as a substitute for a qualified
          professional or as the sole basis for an important decision.
        </p>
      </section>

      <section>
        <h2>Misuse, suspension, and termination</h2>
        <p>
          Writely may restrict, suspend, or end access when reasonably necessary
          to investigate abuse, protect users or the service, comply with law,
          or respond to a serious violation of these Terms or the Acceptable Use
          Policy. Where practical and safe, Writely will try to provide a clear
          explanation.
        </p>
      </section>

      <section>
        <h2>Deleting your account</h2>
        <p>
          You can delete your account from Settings &amp; Help. Account deletion
          removes live linked account data as described in the Privacy Notice
          and Data Deletion page. Export important writing before deleting your
          account because deletion cannot be undone.
        </p>
      </section>

      <section>
        <h2>Intellectual-property concerns</h2>
        <p>
          If you believe content or use of Writely infringes your intellectual
          property rights, email{" "}
          <a href="mailto:code.dreamer666@gmail.com">
            code.dreamer666@gmail.com
          </a>{" "}
          with enough detail to identify the material, the right you believe is
          affected, and how to contact you. Writely may ask for further
          information before acting.
        </p>
      </section>

      <section>
        <h2>Reasonable limits for a free beta</h2>
        <p>
          Writely is provided on an “as available” basis. To the extent
          permitted by Singapore law, Writely is not responsible for indirect,
          consequential, or unexpected loss caused by beta interruptions,
          provider failures, loss of browser recovery data, or reliance on AI
          output. Nothing in these Terms excludes responsibility that cannot
          legally be excluded.
        </p>
        <p>
          These plain-language limits are not a promise that Writely is free of
          defects, and they do not remove rights you may have under applicable
          law.
        </p>
      </section>

      <section>
        <h2>Singapore and changes</h2>
        <p>
          Writely is provided from Singapore. These Terms are intended to be
          understood under Singapore law, subject to any rights that applicable
          law gives you. Material changes will be dated and, where reasonably
          possible, shown through a prominent Writely notice.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:code.dreamer666@gmail.com">
            code.dreamer666@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
