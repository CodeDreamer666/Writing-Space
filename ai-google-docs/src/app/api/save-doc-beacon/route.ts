import { db } from "~/server/db";
import { auth } from "~/server/better-auth";

export async function POST(req: Request) {
    const body = await req.json();

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
        return new Response(null, { status: 401 });
    }

    if (!body.docId || typeof body.title !== "string") {
        return new Response(null, { status: 400 });
    }

    await db.document.update({
        where: {
            id: body.docId,
            userId: session.user.id,
        },
        data: {
            title: body.title,
            content: body.content,
        },
    });

    return new Response(null, { status: 204 });
}