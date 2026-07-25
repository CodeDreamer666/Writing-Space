import type { Metadata } from "next";
import SettingsPageContent from "./SettingsPageContent";

export const metadata: Metadata = {
  title: "Settings & Help",
  description: "Writely preferences, shortcuts, limits, and help.",
};

export default function SettingsPage() {
  return <SettingsPageContent />;
}
