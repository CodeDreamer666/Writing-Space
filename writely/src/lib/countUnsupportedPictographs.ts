const unsupportedPictographPattern =
  /[\p{Extended_Pictographic}\uFE0F\u200D]/gu;

export default function countUnsupportedPictographs(value: string): number {
  return value.match(unsupportedPictographPattern)?.length ?? 0;
}
