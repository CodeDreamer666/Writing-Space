"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import EditorRuntime from "~/components/editor/EditorRuntime";
import Loading from "~/components/shared/Loading";
import ServerError from "~/components/shared/ServerError";
import api from "~/trpc/api";
export default function WritingSpace() {
    const params = useParams<{ docId: string }>();
    const router = useRouter();
    const docId = params.docId ?? "";

    const {
        data: document,
        isLoading,
        error,
    } = api.docs.getSelectedDoc.useQuery(
        { docId },
        {
            refetchOnMount: "always",
            refetchOnWindowFocus: false,
            retry: false,
        },
    );

    useEffect(() => {
        if (error?.data?.code === "UNAUTHORIZED") {
            router.replace("/app");
        }
    }, [error, router]);

    if (isLoading) {
        return <Loading />;
    }

    if (error?.data?.code === "NOT_FOUND" || error?.data?.zodError) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-(--w-background) px-6 text-(--w-foreground)">
                <section className="w-full max-w-md text-center">
                    <p className="text-xs font-medium tracking-[0.12em] text-(--w-subtle) uppercase">
                        Draft unavailable
                    </p>
                    <h1 className="mt-4 text-3xl font-medium tracking-tight">
                        This writing could not be opened.
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-(--w-muted)">
                        It may have been deleted, or it may belong to another account.
                    </p>
                    <Link
                        href="/app"
                        className={[
                            "mt-7 inline-flex min-h-11 items-center",
                            "justify-center rounded-xl bg-(--w-foreground) px-5",
                            "text-sm font-medium text-(--w-background) focus-visible:outline-2",
                            "focus-visible:outline-offset-2 focus-visible:outline-(--w-muted)",
                        ].join(" ")}
                    >
                        Back to drafts
                    </Link>
                </section>
            </main>
        );
    }

    if (error || !document) {
        return <ServerError />;
    }

    return <EditorRuntime key={docId} docId={docId} document={document} />;
}
