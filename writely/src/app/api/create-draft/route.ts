import { type NextRequest, NextResponse } from "next/server";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();

  try {
    const context = await createTRPCContext({
      headers: request.headers,
    });
    const caller = createCaller(context);
    const document = await caller.docs.createDoc();

    redirectUrl.pathname = `/${document.id}`;
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  } catch {
    redirectUrl.pathname = "/";
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }
}
