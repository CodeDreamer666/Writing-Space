"use client";

import { useSearchParams } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

export default function SignInClient() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F7] text-lg font-semibold text-[#0B0D10]">
              W
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>

              <p className="text-sm text-[#8E96A3]">
                Continue where you left off.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={async () => {
                await authClient.signIn.social({
                  provider: "google",
                  callbackURL: redirect,
                });
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#252B36] bg-[#12161C] px-4 py-3 font-medium transition-colors hover:bg-[#181D24]"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
