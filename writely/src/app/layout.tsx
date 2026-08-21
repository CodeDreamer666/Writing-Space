import "~/styles/globals.css";
import type { Metadata } from "next";
import {
  Archivo,
  Atkinson_Hyperlegible,
  IBM_Plex_Mono,
  Inter,
  Newsreader,
  Source_Serif_4,
} from "next/font/google";
import StatusMessageProvider from "~/components/layout/StatusMessageProvider";
import ThemeProvider from "~/components/layout/ThemeProvider";
import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const atkinsonHyperlegible = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson-hyperlegible",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

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
      className={`${inter.variable} ${sourceSerif.variable} ${atkinsonHyperlegible.variable} ${archivo.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={archivo.className}>
        <ThemeProvider>
          <StatusMessageProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </StatusMessageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
