import { GoogleGenAI } from "@google/genai";

// Instantiate the Gemini client using the environment variable. In production
// this should come from your platform secrets (Vercel, etc.).
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  // Do not throw on import; many dev tools import files. We will still allow
  // the function to check and throw at call time if needed.
}

const ai = new GoogleGenAI({ apiKey });

export type GeminiIssue = {
  type: string; // e.g. 'syntax', 'runtime', 'style', 'logic'
  line: number | null;
  excerpt: string;
  explanation: string;
  suggestion: string;
};

export type GeminiReport = {
  issues: GeminiIssue[];
  summary: string;
};

/**
 * Analyze a user's code string with Google Gemini and return Gemini's analysis.
 * The function asks Gemini to return a JSON object with `issues` and `summary`.
 * If Gemini's output cannot be parsed as JSON, the raw model text is returned
 * for debugging.
 *
 * @param code - The user's written code to analyze (plain text)
 * @returns { report } when JSON parsed successfully, otherwise { raw }
 */
export async function analyzeCodeWithGemini(
  code: string
): Promise<{ report?: GeminiReport; raw?: string; error?: string }> {
  if (!code || typeof code !== "string") {
    return { error: "`code` must be a non-empty string" };
  }

  if (!apiKey) {
    return { error: "GEMINI_API_KEY is not set in environment" };
  }

  // Structured prompt asking for JSON-only output with a defined shape.
  const prompt = `You are a strict code reviewer. Given the user's source code between triple backticks, find any errors (syntax, runtime, or clear logical bugs) and return a SINGLE valid JSON object ONLY with the exact shape:\n{\\"issues\\": [ {\\"type\\": string, \\\"line\\": number|null, \\\"excerpt\\": string, \\\"explanation\\": string, \\\"suggestion\\": string } ], \\\"summary\\": string }\nIf there are no problems, return {\\"issues\\": [], \\\"summary\\": \\\"No problems found.\\"}.\nUser code:\n\n\
\`\`\`\n${code}\n\`\`\`\nRespond with valid JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Extract text from possible SDK response shapes.
    let modelText = "";
    if (typeof response === "string") modelText = response;
    else if ((response as any)?.text) modelText = (response as any).text;
    else if ((response as any)?.output?.[0]?.content) {
      const content = (response as any).output[0].content;
      if (Array.isArray(content)) modelText = content.map((c: any) => c.text ?? JSON.stringify(c)).join("\n");
      else modelText = content.text ?? JSON.stringify(content);
    } else if ((response as any)?.candidates?.[0]?.content) {
      const c = (response as any).candidates[0].content;
      modelText = Array.isArray(c) ? c.map((p: any) => p.text ?? JSON.stringify(p)).join("\n") : c.text ?? JSON.stringify(c);
    } else {
      modelText = JSON.stringify(response);
    }

    // Try to parse JSON.
    try {
      const parsed = JSON.parse(modelText);
      return { report: parsed as GeminiReport };
    } catch (parseErr) {
      return { raw: modelText };
    }
  } catch (err: any) {
    return { error: String(err) };
  }
}

export default analyzeCodeWithGemini;
