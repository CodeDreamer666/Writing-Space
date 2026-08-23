"use client";
import { useRouter } from "next/navigation";
import authClient from "~/server/better-auth/client";

export default function StartWritingButton({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "header" | "primary";
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const startWriting = async () => {
    if (!session) {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/app",
        errorCallbackURL: "/",
      });
      return;
    }

    router.push("/app");
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => void startWriting()}
      className={
        variant === "header"
          ? "font-mono-label cursor-pointer border-0 border-b border-(--w-border) bg-transparent px-0 py-1 text-[11px] tracking-[0.18em] uppercase hover:border-(--w-foreground) disabled:cursor-wait disabled:opacity-60"
          : "h-14 cursor-pointer border-0 bg-(--w-foreground) px-[34px] text-[15px] font-medium text-(--w-background) hover:opacity-80 disabled:cursor-wait disabled:opacity-60"
      }
    >
      {children}
    </button>
  );
}
