const FILLER_WORDS = ["um", "uh", "like", "you know", "sort of", "kind of", "basically", "actually", "literally"];

export function countFillerWords(transcript) {
  if (!transcript) return 0;
  const lower = transcript.toLowerCase();
  return FILLER_WORDS.reduce((count, word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "g");
    const matches = lower.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
}

export function getDominantMood(moods) {
  if (!moods.length) return "Neutral";

  const counts = moods.reduce((acc, mood) => {
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(counts));
  const topMoods = Object.keys(counts).filter((mood) => counts[mood] === maxCount);

  if (topMoods.length === 1) {
    return topMoods[0];
  }
  return topMoods.join(" & ");
}