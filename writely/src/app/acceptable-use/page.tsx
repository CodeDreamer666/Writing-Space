import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "~/components/layout/LegalPage";

export const metadata: Metadata = {
    title: "Acceptable Use Policy",
    description: "Rules that protect Writely, its users, and its providers.",
};

export default function AcceptableUsePage() {
    return (
        <LegalPage
            title="Acceptable Use Policy"
            summary="Use Writely for lawful writing. Do not use it to harm people, access data without permission, or disrupt the service."
        >
            <section>
                <h2>Do not use Writely for</h2>
                <ul>
                    <li>illegal activity or content that promotes illegal activity;</li>
                    <li>
                        harassment, hate, exploitation, sexual abuse, non-consensual
                        intimate content, or credible threats of harm;
                    </li>
                    <li>
                        accessing, attempting to access, or exposing another user&apos;s
                        account, document, session, or personal data;
                    </li>
                    <li>
                        malware, phishing, credential theft, destructive code, or deceptive
                        security instructions;
                    </li>
                    <li>
                        automated abuse, excessive requests, account farming, or attempts to
                        avoid quotas, rate limits, or safety controls;
                    </li>
                    <li>
                        extracting secrets, API keys, system instructions, authentication
                        tokens, or private infrastructure details;
                    </li>
                    <li>
                        interfering with, overloading, reverse engineering for abuse, or
                        disrupting Writely or its providers;
                    </li>
                    <li>
                        submitting writing, personal data, or other material you do not have
                        the right or permission to use;
                    </li>
                    <li>
                        presenting AI output as deceptive professional legal, medical,
                        financial, or other expert advice; or
                    </li>
                    <li>
                        activity that violates Groq&apos;s applicable{" "}
                        <Link href="https://console.groq.com/docs/legal/ai-policy">
                            Acceptable Use &amp; Responsible AI Policy
                        </Link>
                        .
                    </li>
                </ul>
            </section>

            <section>
                <h2>Human review is required</h2>
                <p>
                    Do not use Writely AI as the sole decision-maker for employment,
                    healthcare, credit, insurance, legal rights, education, housing, or
                    another decision that can materially affect a person. Review AI output
                    for accuracy, context, bias, and harm.
                </p>
            </section>

            <section>
                <h2>Enforcement</h2>
                <p>
                    Writely may limit or suspend access, preserve necessary evidence, and
                    contact a provider or relevant authority when reasonably necessary to
                    investigate serious misuse or protect people and systems. A response
                    will be proportionate to the apparent risk and available evidence.
                </p>
            </section>

            <section>
                <h2>Report misuse</h2>
                <p>
                    Report suspected misuse to{" "}
                    <a href="mailto:code.dreamer666@gmail.com">
                        code.dreamer666@gmail.com
                    </a>
                    . Do not include unnecessary personal data or copies of private
                    documents in the report.
                </p>
            </section>
        </LegalPage>
    );
}
