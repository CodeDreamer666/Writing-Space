import auth from "~/server/better-auth/config";
import db from "~/server/db";

export default async function createTRPCContext({
  headers,
}: {
  headers: Headers;
}) {
  const session = await auth.api.getSession({ headers });
  return { db, session, headers };
}
