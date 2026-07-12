import "~/styles/globals.css";
import RouteLoader from "~/components/layout/RouteLoader";
import StatusMessageProvider from "~/components/layout/StatusMessageProvider";
import { TRPCReactProvider } from "~/trpc/react";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body>
        <RouteLoader>
          <StatusMessageProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </StatusMessageProvider>
        </RouteLoader>
      </body>
    </html>
  );
}
