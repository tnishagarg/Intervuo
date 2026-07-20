import { GoogleGenAI } from "@google/genai";
import { countFillerWords, getDominantMood } from "./fillerWordCounter.js";

export async function generateFeedback({ questions, answers }) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const totalFillerWords = answers.reduce(
    (sum, a) => sum + countFillerWords(a.transcript),
    0
  );
  const dominantMood = getDominantMood(answers.map((a) => a.mood));

  const transcriptSummary = questions
    .map((q, i) => {
      const answer = answers.find((a) => a.questionIndex === i);
      return `Q${i + 1} (${q.type}): ${q.text}\nAnswer: ${answer?.transcript || "(no answer given)"}`;
    })
    .join("\n\n");

  const answeredCount = answers.filter((a) => a.transcript && a.transcript.trim().length > 5).length;

const prompt = `You are an expert interview coach. Review this mock interview transcript and score it rigorously.

${transcriptSummary}

SCORING RUBRIC — evaluate each answered question against these 5 criteria, then combine into one overall score:
1. Clarity (0-20): Is the answer easy to follow, well-organized, free of rambling?
2. Relevance (0-20): Does it actually address what was asked, not a generic tangent?
3. Structure/STAR (0-20): For behavioral questions, does it include Situation, Task, Action, and Result? For technical questions, is there a clear logical progression?
4. Specificity (0-20): Does it reference real details, numbers, tools, or concrete examples rather than vague generalities?
5. Depth (0-20): Does it show genuine understanding/reasoning, not surface-level statements?

SCORING RULES:
- Sum the 5 criteria per answered question (max 100 per question), then average across all questions in the set to get "overallScore".
- Any unanswered question (like "(no answer given)") scores 0 across all 5 criteria.
- CRITICAL: an answer that does NOT actually address the question — including greetings, filler like "hello" or "how are you", silence transcribed as noise, or anything unrelated to the question asked — must ALSO score 0 across all 5 criteria. Do not award any credit just because words were spoken; the words must actually attempt to answer the specific question.
- Only genuine, on-topic attempts to answer the question earn nonzero points, and even then only in proportion to how well they meet each of the 5 criteria.
- ${answeredCount} out of ${questions.length} questions were flagged as containing any transcript text at all — this is NOT the same as being genuinely answered. Re-evaluate each one yourself against the rule above rather than trusting this count alone.
- A genuinely strong, detailed, well-structured answer should score 80+. A vague, short, or unfocused-but-relevant answer should score 20-50. An unanswered or off-topic/irrelevant answer scores 0.

FEEDBACK RULES:
- "strengths" must ONLY contain genuine positive observations backed by actual answer content, referencing specifics (e.g. mention the actual project/tool/example they used). If there is not enough real content across all answers to identify at least one genuine strength, return an empty array — do not pad it with disguised negatives.
- "improvements" should be specific and actionable, referencing what was actually missing or weak (e.g. "Your answer to Q2 never described the Result — you stopped after explaining the Action").

Return ONLY a valid JSON object with this exact shape, no markdown:
{
  "overallScore": <number 0-100, the average as described above>,
  "strengths": [<0 to 3 short specific strings, can be empty array>],
  "improvements": [<up to 3 short specific strings>]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const raw = response.text.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  const aiFeedback = JSON.parse(cleaned);

  return {
    overallScore: aiFeedback.overallScore,
    fillerWordCount: totalFillerWords,
    dominantMood,
    strengths: aiFeedback.strengths,
    improvements: aiFeedback.improvements,
    emotionTimeline: answers.map((a) => a.mood),
  };
}