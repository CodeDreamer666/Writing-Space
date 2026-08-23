export default function hasThreeOrFourSentences(value: string) {
  const sentences = value.trim().match(/[^.!?。！？]+[.!?。！？]+/gu);

  return sentences !== null && sentences.length >= 3 && sentences.length <= 4;
}
