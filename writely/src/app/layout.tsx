import "~/styles/globals.css";
import type { Metadata } from "next";
import StatusMessageProvider from "~/components/layout/StatusMessageProvider";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Writely",
    template: "%s · Writely",
  },
  description: "A calm, private space for deep thinking and writing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StatusMessageProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </StatusMessageProvider>
      </body>
    </html>
  );
}
