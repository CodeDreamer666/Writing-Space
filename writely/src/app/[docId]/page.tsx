import { redirect } from "next/navigation";

export default async function LegacyDocumentPage({
    params,
}: {
    params: Promise<{ docId: string }>;
}) {
    const { docId } = await params;
    redirect(`/app/${docId}`);
}
