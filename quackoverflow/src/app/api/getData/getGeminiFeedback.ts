import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

// We intentionally do NOT instantiate the Gemini client at module import
// time because `process.env.GEMINI_API_KEY` may not be set until the dev
// server is started with the environment configured. The client will be
// created inside the function below so missing env vars produce runtime
// errors at call time instead of during module loading.

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

  let apiKey = process.env.GEMINI_API_KEY;
  // Local development convenience: if the env var isn't set, try to read
  // `src/app/api/gemini/.env` for a GEMINI_API_KEY. This is only used when
  // NODE_ENV !== 'production'. Do NOT rely on this in production.
  if (!apiKey && process.env.NODE_ENV !== "production") {
    try {
      const envPath = path.join(
        process.cwd(),
        "src",
        "app",
        "api",
        "gemini",
        ".env"
      );
      if (fs.existsSync(envPath)) {
        const raw = fs.readFileSync(envPath, "utf8");
        const m = raw.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)\s*$/m);
        if (m) {
          apiKey = m[1].trim().replace(/^['\"]|['\"]$/g, "");
        }
      }
    } catch {
      // ignore read errors; we'll return the normal missing-key error below
    }
  }
  if (!apiKey) {
    return { error: "GEMINI_API_KEY is not set in environment" };
  }

  const ai = new GoogleGenAI({ apiKey });

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
    if (typeof response === "string") {
      modelText = response;
    } else {
      // Use type assertion to handle the response object
      const responseObj = response as unknown as Record<string, unknown>;

      if (responseObj?.text) {
        modelText = responseObj.text as string;
      } else if (
        responseObj?.output &&
        Array.isArray(responseObj.output) &&
        responseObj.output[0]
      ) {
        const output = responseObj.output[0] as Record<string, unknown>;
        const content = output.content;
        if (Array.isArray(content)) {
          modelText = content
            .map((c: unknown) => {
              const item = c as Record<string, unknown>;
              return item.text ?? JSON.stringify(c);
            })
            .join("\n");
        } else {
          const contentObj = content as Record<string, unknown>;
          modelText = (contentObj.text as string) ?? JSON.stringify(content);
        }
      } else if (
        responseObj?.candidates &&
        Array.isArray(responseObj.candidates) &&
        responseObj.candidates[0]
      ) {
        const candidate = responseObj.candidates[0] as Record<string, unknown>;
        const content = candidate.content;
        if (Array.isArray(content)) {
          modelText = content
            .map((p: unknown) => {
              const item = p as Record<string, unknown>;
              return item.text ?? JSON.stringify(p);
            })
            .join("\n");
        } else {
          const contentObj = content as Record<string, unknown>;
          modelText = (contentObj.text as string) ?? JSON.stringify(content);
        }
      } else {
        modelText = JSON.stringify(response);
      }
    }

    // Try to parse JSON.
    try {
      const parsed = JSON.parse(modelText);
      return { report: parsed as GeminiReport };
    } catch {
      return { raw: modelText };
    }
  } catch (err: unknown) {
    return { error: String(err) };
  }
}

export default analyzeCodeWithGemini;
