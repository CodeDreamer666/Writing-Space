import type { Metadata } from "next";
import PrivacyPageContent from "./PrivacyPageContent";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Writely handles account, document, AI, and usage data.",
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
