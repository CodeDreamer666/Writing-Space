import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "~/env";
import db from "~/server/db";

const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  account: {
    encryptOAuthTokens: true,
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});

export default auth;
