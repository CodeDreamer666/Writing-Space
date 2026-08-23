import { redirect } from "next/navigation";
import WritingSpace from "~/components/editor/WritingSpace";
import getSession from "~/server/better-auth/server";

export default async function DocumentPage() {
  const session = await getSession();

  if (!session) {
    redirect("/app");
  }

  return <WritingSpace />;
}
