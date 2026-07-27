import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const accountRouter = createTRPCRouter({
  exportData: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        leaveReminderDisabled: true,
        createdAt: true,
        updatedAt: true,
        documents: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            title: true,
            content: true,
            writingMode: true,
            version: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        aiDailyUsage: {
          orderBy: {
            usageDate: "asc",
          },
          select: {
            usageDate: true,
            tokensUsed: true,
          },
        },
        feedback: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            message: true,
            createdAt: true,
          },
        },
        sessions: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
            ipAddress: true,
            userAgent: true,
          },
        },
        accounts: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            accountId: true,
            providerId: true,
            scope: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Your Writely account could not be found.",
      });
    }

    const {
      documents,
      aiDailyUsage,
      feedback,
      sessions,
      accounts,
      ...account
    } = user;

    return {
      exportVersion: 1,
      exportedAt: new Date(),
      account,
      documents,
      aiUsage: aiDailyUsage,
      feedback,
      sessions,
      connectedAccounts: accounts.map(
        ({ accountId, providerId, ...connectedAccount }) => ({
          providerAccountId: accountId,
          provider: providerId,
          ...connectedAccount,
        }),
      ),
    };
  }),
});
