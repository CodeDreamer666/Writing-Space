import { redirect } from "next/navigation";
import WritingSpace from "~/features/editor/components/WritingSpace";
import { getSession } from "~/server/better-auth/server";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <WritingSpace />;
}
