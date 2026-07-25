import type { Metadata } from "next";
import LandingPageContent from "./LandingPageContent";

export const metadata: Metadata = {
  title: "Make room for the thought",
  description:
    "Writely is a calm, private writing space with autosave, recovery, focused editing, and optional AI help for selected text.",
};

export default function LandingPage() {
  return <LandingPageContent />;
}
