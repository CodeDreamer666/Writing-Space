import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import RouteLoader from "./components/LoadingRouter";

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html>
            <body>
                <RouteLoader>
                    <TRPCReactProvider>
                        {children}
                    </TRPCReactProvider>
                </RouteLoader>
            </body>
        </html>
    );
}
