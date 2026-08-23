export default function readingTime(words: number): string {
  if (words < 240) return "Less than 1 min read";
  const minutes = Math.ceil(words / 240);
  return minutes === 1 ? "1 min read" : `${minutes} min read`;
}
