import "~/styles/globals.css";
import type { Metadata } from "next";
import DesktopOnlyNotice from "~/components/layout/DesktopOnlyNotice";
import StatusMessageProvider from "~/components/layout/StatusMessageProvider";
import BetaUtilities from "~/components/layout/BetaUtilities";
import ThemeProvider from "~/components/layout/ThemeProvider";
import { TRPCReactProvider } from "~/trpc/react";

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("writely:theme");
    const theme = stored === "light" || stored === "dark" ? stored :
      matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }
})();`;

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
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className="desktop-beta-locked"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="desktop-beta-locked">
        <div className="desktop-beta-app">
          <ThemeProvider>
            <StatusMessageProvider>
              <TRPCReactProvider>
                {children}
                <BetaUtilities />
              </TRPCReactProvider>
            </StatusMessageProvider>
          </ThemeProvider>
        </div>
        <DesktopOnlyNotice />
      </body>
    </html>
  );
}
