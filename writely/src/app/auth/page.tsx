import { Suspense } from "react";
import SignInClient from "~/features/auth/components/SignInClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
