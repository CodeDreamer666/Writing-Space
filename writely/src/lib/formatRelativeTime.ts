export default function formatRelativeTime(date: Date | string) {
  const now = new Date();
  const then = new Date(date);
  const minutes = Math.floor((now.getTime() - then.getTime()) / 60_000);

  if (minutes <= 0) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "Yesterday";

  return then.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: then.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
