import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import RouteLoader from "./components/LoadingRouter";
import StatusMessageRouter from "./components/StatusMessageRouter";

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html>
            <body>
                <RouteLoader>
                    <StatusMessageRouter>
                        <TRPCReactProvider>
                            {children}
                        </TRPCReactProvider>
                    </StatusMessageRouter>
                </RouteLoader>
            </body>
        </html>
    );
}
