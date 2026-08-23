const unsupportedPictographPattern =
    /[\p{Extended_Pictographic}\uFE0F\u200D]/gu;

export default function containsUnsupportedPictographs(value: string): boolean {
    return (value.match(unsupportedPictographPattern)?.length ?? 0) > 0
}
