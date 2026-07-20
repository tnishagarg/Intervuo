import { GoogleGenAI } from "@google/genai";

export async function generateQuestions({ resumeText, type, difficulty, targetRole, questionCount }) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are an expert technical interviewer. Generate exactly ${questionCount} realistic, specific interview questions tailored to this candidate's resume.

Interview type: ${type} (behavioral, technical, or mixed)
Difficulty: ${difficulty}
Target role: ${targetRole || "Not specified — infer the likely role from the resume"}

Resume:
${resumeText}

Rules:
- "text" must be the FULL, specific interview question a real interviewer would ask out loud — never a category label like "Technical" or "Behavioral".
- "type" must be either "Behavioral" or "Technical" only — describing the category of that specific question.
- Reference specific skills, tools, or projects from the resume where relevant.
- STRICT TYPE RULE: if the requested interview type above is "behavioral", every question's "type" must be "Behavioral". If it's "technical", every question's "type" must be "Technical". If it's "hr", every question's "type" must be "HR" — covering things like salary expectations, availability, reasons for leaving previous roles, career goals, why this company/role, strengths/weaknesses, and general culture-fit questions (not coding or system design). If it's "mixed", split roughly evenly across Behavioral, Technical, and HR.
- STRICT DIFFICULTY RULE:
  - "Easy" = foundational questions anyone with basic knowledge of their listed skills should answer; straightforward scenarios, one concept at a time.
  - "Medium" = requires connecting 2+ concepts or trade-off reasoning; realistic workplace scenarios with some ambiguity.
  - "Hard" = deep technical depth, edge cases, system-level thinking, or multi-layered behavioral scenarios requiring nuanced judgment. Push genuinely hard for senior-level rigor.
- STRICT TARGET ROLE RULE: if a target role is specified, at least half the questions must be clearly framed around what that specific role would realistically be asked (e.g. a "Senior Backend Engineer" gets deeper system-design pressure than a "Junior Frontend Developer" would). If no target role is specified, infer the most likely role from the resume and apply the same logic.

Example of correct output format:
[
  { "type": "Technical", "text": "You listed React and Node.js — can you walk me through how you'd design a real-time notification system connecting them?" },
  { "type": "HR", "text": "What are your salary expectations for this role, and are you open to relocation?" },
  { "type": "Behavioral", "text": "Tell me about a time you disagreed with a teammate's technical decision. How did you handle it?" }
]

Return ONLY a valid JSON array of exactly ${questionCount} objects in that shape, matching the interview type requested above. No markdown, no extra text.`;

let response;
try {
  response = await ai.models.generateContent({
    model: "gemini-flash-lite-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });
} catch (apiErr) {
  console.error("GEMINI API CALL FAILED:", apiErr);
  throw apiErr;
}
  console.log("Raw Gemini response:", response.text);
  const raw = response.text.trim();
  // Strip markdown code fences if the model adds them despite instructions
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Gemini response:", raw);
    throw new Error("QUESTION_PARSE_FAILED");
  }
}