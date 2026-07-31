import type { Metadata } from "next";
import LandingPageContent from "./landing/LandingPageContent";

export const metadata: Metadata = {
  title: "A quieter place to write",
  description:
    "Writely is a calm, private writing space with autosave, recovery, focused editing, and optional AI help for selected text.",
};

export default function HomePage() {
  return <LandingPageContent />;
}
