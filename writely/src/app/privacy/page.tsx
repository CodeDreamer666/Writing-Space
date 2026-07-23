import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy",
    description: "How Writely handles account, document, AI, and usage data.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[var(--w-background)] px-5 py-16 text-[var(--w-foreground)] sm:px-8">
            <article className="mx-auto max-w-2xl">
                <div className="flex flex-col">
                    <div className="flex justify-between w-full">
                        <p className="text-xs font-medium tracking-[0.12em] text-[var(--w-subtle)] uppercase">
                            Writely beta
                        </p>
                        <Link
                            href="/"
                            className="text-sm text-[var(--w-muted)] transition-colors hover:text-[var(--w-foreground)]"
                        >
                            ← Back to Writely
                        </Link>
                    </div>
                    <div>
                        <h1 className="mt-3 text-4xl font-medium tracking-tight">
                            Privacy, in plain language
                        </h1>
                        <p className="mt-4 text-base leading-8 text-[var(--w-muted)]">
                            Writely collects only the information needed to provide and protect
                            your writing workspace.
                        </p>
                    </div>
                </div>

                <div className="mt-10 space-y-8 text-sm leading-7 text-[var(--w-muted)]">
                    <section>
                        <h2 className="text-lg font-medium text-[var(--w-foreground)]">
                            What Writely stores
                        </h2>
                        <p className="mt-2">
                            When you sign in with Google, Writely receives basic account
                            information such as your name, email address, and profile image.
                        </p>
                        <p className="mt-4">
                            Writely also stores your document titles, writing, formatting,
                            editor settings, and save information so your documents can be
                            opened, edited, and recovered.
                        </p>
                        <p className="mt-4">
                            We may store your AI usage total and any feedback you choose to
                            submit.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-[var(--w-foreground)]">
                            How AI works
                        </h2>
                        <p className="mt-2">
                            Writely AI works only on text you select.
                        </p>
                        <p className="mt-4">
                            When you choose an AI action, the selected text and instruction
                            are sent to Groq to generate a response. The rest of your
                            document is not included in that request.
                        </p>
                        <p className="mt-4">
                            Writely does not save the selected text, instruction, or AI
                            response in its own database after the request is completed.
                            Groq may process or temporarily retain request data according to
                            its own policies and the data settings used by Writely.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-[var(--w-foreground)]">
                            Recovery copies
                        </h2>
                        <p className="mt-2">
                            Writely may keep a recent unsaved copy of your writing in your
                            browser. This helps recover your work after a refresh, closed
                            tab, connection problem, or failed save.
                        </p>
                        <p className="mt-4">
                            You can remove this local recovery data by clearing your browser
                            storage.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-[var(--w-foreground)]">
                            Service providers
                        </h2>
                        <p className="mt-2">
                            Writely uses third-party services to operate the product,
                            including:
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5">
                            <li>Google for sign-in</li>
                            <li>Groq for AI processing</li>
                            <li>
                                Hosting and database providers for storing and delivering the
                                service
                            </li>
                        </ul>
                        <p className="mt-4">
                            These services may process the information needed to perform
                            their role.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-[var(--w-foreground)]">
                            Your choices
                        </h2>
                        <p className="mt-2">
                            You may request access to, correction of, or deletion of your
                            personal information and Writely account.
                        </p>
                        <p className="mt-4">Privacy contact: code.dreamer666@gmail.com</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-[var(--w-foreground)]">
                            Beta notice
                        </h2>
                        <p className="mt-2">
                            Writely is currently in beta. This notice may be updated when the
                            product or its data practices change.
                        </p>
                        <p className="mt-4">Last updated: 27 July 2026</p>
                    </section>
                </div>
            </article>
        </main>
    );
}
