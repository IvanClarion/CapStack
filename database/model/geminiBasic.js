/**
 * Gemini client helper module (Dynamic Version)
 *
 * Features:
 *  - Dynamic model selection (flash-lite vs flash) based on prompt size / flags.
 *  - SurveyAI session abstraction for multi-turn conversation with memory.
 *  - Streaming and single-shot utilities.
 *  - Robust extraction + retries.
 *
 * IMPORTANT: For production (especially React Native), proxy requests through a backend.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API } from "@env";

// ---------------- Configuration ----------------
const MODEL_FLASH_LITE = "gemini-2.5-flash-lite";
const MODEL_FLASH = "gemini-2.5-flash";
const DEFAULT_MODEL = MODEL_FLASH_LITE;
const MAX_RETRIES = 2;
const MAX_MESSAGES_MEMORY = 6; // number of prior user+ai turns to keep
const TOKEN_THRESHOLD_SWITCH = 1800; // naive threshold to switch to bigger model

// ---------------- Internal State ----------------
let _client = null;
const _modelCache = new Map();

// ---------------- Core Client Init ----------------
function getClient() {
  if (_client) return _client;
  if (!GEMINI_API) {
    console.warn("[geminiBasic] GEMINI_API env key missing.");
  }
  _client = new GoogleGenerativeAI(GEMINI_API || "");
  return _client;
}

export function getModel(modelName = DEFAULT_MODEL, systemInstruction) {
  const key = systemInstruction ? `${modelName}::${systemInstruction}` : modelName;
  if (_modelCache.has(key)) return _modelCache.get(key);

  const client = getClient();
  const model = client.getGenerativeModel({
    model: modelName,
    ...(systemInstruction && { systemInstruction })
  });

  _modelCache.set(key, model);
  return model;
}

// Convenience accessor
export const basicModel = () => getModel(DEFAULT_MODEL);

// ---------------- Helpers ----------------
function extractText(result) {
  if (!result) return "";
  try {
    const direct = result?.response?.text?.();
    if (direct) return direct;
  } catch (_) {}
  const parts =
    result?.response?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean);
  if (parts && parts.length) return parts.join("");
  return "";
}

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Extremely rough token estimation heuristic (characters / 4)
function estimateTokens(str) {
  if (!str) return 0;
  return Math.ceil(str.length / 4);
}

/**
 * Dynamic model chooser
 * - If references requested or large prompt: pick flash
 * - Else use flash-lite
 */
export function chooseModel({ totalTokens, needReferences, followUpLength }) {
  if (needReferences) return MODEL_FLASH; // prefer larger model for refs
  if (followUpLength > 400) return MODEL_FLASH; // longer user request
  if (totalTokens > TOKEN_THRESHOLD_SWITCH) return MODEL_FLASH;
  return MODEL_FLASH_LITE;
}

/**
 * askGemini: single-shot wrapper
 */
export async function askGemini(
  prompt,
  {
    modelName,
    structured = false,
    systemInstruction,
    retries = MAX_RETRIES
  } = {}
) {
  const finalPrompt =
    Array.isArray(prompt) ? prompt.filter(Boolean).join("\n") : String(prompt || "");

  // dynamic pick if not specified
  if (!modelName) {
    const approxTokens = estimateTokens(finalPrompt);
    modelName = chooseModel({
      totalTokens: approxTokens,
      needReferences: /Need References:\s*Yes/i.test(finalPrompt),
      followUpLength: finalPrompt.length
    });
  }

  const model = getModel(modelName, systemInstruction);

  const payload = structured
    ? {
        contents: [
          {
            role: "user",
            parts: [{ text: finalPrompt }]
          }
        ]
      }
    : finalPrompt;

  let attempt = 0;
  let lastError;
  while (attempt <= retries) {
    try {
      const result = await model.generateContent(payload);
      const text = extractText(result);
      if (!text) throw new Error("Empty model response");
      return { text, raw: result, modelUsed: modelName };
    } catch (e) {
      lastError = e;
      const retriable =
        e?.status === 429 ||
        e?.status === 503 ||
        e?.message?.toLowerCase?.().includes("timeout");

      if (!retriable || attempt === retries) break;
      await wait((attempt + 1) * 500);
    }
    attempt++;
  }
  console.error("[askGemini] failed:", lastError?.message || lastError);
  return {
    text: "The AI could not generate a response at this time.",
    raw: null,
    modelUsed: modelName
  };
}

/**
 * Streaming generation for incremental UI updates
 */
export async function streamGemini(
  prompt,
  {
    onChunk,
    modelName,
    systemInstruction
  } = {}
) {
  if (!modelName) {
    const approxTokens = estimateTokens(prompt);
    modelName = chooseModel({
      totalTokens: approxTokens,
      needReferences: /Need References:\s*Yes/i.test(prompt),
      followUpLength: prompt.length
    });
  }
  const model = getModel(modelName, systemInstruction);
  const streamResult = await model.generateContentStream(prompt);

  let full = "";
  for await (const chunk of streamResult.stream) {
    const piece = chunk.text();
    if (piece) {
      full += piece;
      if (typeof onChunk === "function") {
        try {
          onChunk(piece, full);
        } catch (cbErr) {
          console.warn("[streamGemini] onChunk callback error:", cbErr);
        }
      }
    }
  }
  return { text: full, modelUsed: modelName };
}

/**
 * Build base survey prompt (without follow-up)
 */
export function buildSurveyPromptBase(surveyResult) {
  if (!surveyResult) return "No survey data was provided.";
  const { needReferences, openEndedAnswer, chosenQuestions } = surveyResult;

  const formatted = (chosenQuestions || [])
    .map(
      (q, i) =>
        `${i + 1}. ${q.question}` +
        (q.description ? `\n   Desc: ${q.description}` : "") +
        (q.surveyTitle ? `\n   Section: ${q.surveyTitle}` : "")
    )
    .join("\n\n");

  return [
    "You are an assistant generating insights from a user survey.",
    `Need References: ${needReferences ? "Yes" : "No"}`,
    `User Additional Info: ${openEndedAnswer || "(none)"}`,
    "",
    "Selected Questions:",
    formatted || "(No questions selected)",
    "",
    "Your task: Provide actionable insights."
  ].join("\n");
}

/**
 * Construct a multi-turn message block with conversation memory.
 */
function buildConversationPrompt({ basePrompt, memoryMessages, newUserMessage }) {
  const lines = [basePrompt, "", "Conversation (recent turns):"];
  memoryMessages.forEach(m => {
    lines.push(`${m.role === "user" ? "User" : "Assistant"}: ${m.content}`);
  });
  lines.push("", `User: ${newUserMessage}`, "", "Assistant: ");
  return lines.join("\n");
}

/**
 * Survey AI Session
 * - Maintains base survey context
 * - Keeps short memory of conversation
 */
class SurveyAISession {
  constructor(surveyResult, { memoryLimit = MAX_MESSAGES_MEMORY } = {}) {
    this.surveyResult = surveyResult;
    this.basePrompt = buildSurveyPromptBase(surveyResult);
    this.memoryLimit = memoryLimit;
    this.history = []; // { role: "user"|"assistant", content: string }
    this.initialized = false;
  }

  /**
   * Generate initial insight (only once unless forced)
   */
  async initial({ force = false } = {}) {
    if (this.initialized && !force) {
      return {
        text: "(Already initialized)",
        modelUsed: null,
        skipped: true
      };
    }
    const composite = [
      this.basePrompt,
      "",
      "Provide: 1) Key interpretation themes, 2) Potential project framing, 3) " +
        "(If Need References is Yes) 2–3 credible reference source titles only."
    ].join("\n");
    const res = await askGemini(composite, {});
    this.history.push({ role: "assistant", content: res.text });
    this.initialized = true;
    return res;
  }

  /**
   * Ask a follow-up (adds user message + assistant response to memory)
   * Options:
   *  - streaming: boolean
   *  - onChunk: function(piece, full)
   */
  async ask(userMessage, { streaming = false, onChunk, systemInstruction } = {}) {
    if (!userMessage || !userMessage.trim()) {
      return { text: "Empty follow-up ignored.", modelUsed: null };
    }

    // Keep only last N pairs
    const trimmedHistory = this.history.slice(-this.memoryLimit);
    const prompt = buildConversationPrompt({
      basePrompt: this.basePrompt,
      memoryMessages: trimmedHistory,
      newUserMessage: userMessage.trim()
    });

    let result;
    if (streaming) {
      result = await streamGemini(prompt, { onChunk, systemInstruction });
    } else {
      result = await askGemini(prompt, { systemInstruction });
    }

    // Update history
    this.history.push({ role: "user", content: userMessage.trim() });
    this.history.push({ role: "assistant", content: result.text });

    return result;
  }

  getHistory() {
    return [...this.history];
  }

  reset({ keepBase = true } = {}) {
    if (keepBase) {
      this.history = [];
    } else {
      this.history = [];
      this.basePrompt = "";
    }
    this.initialized = false;
  }
}

/**
 * Factory to create a session for a survey result
 */
export function createSurveySession(surveyResult, options) {
  return new SurveyAISession(surveyResult, options);
}

/**
 * High-level function (single-shot) – not using conversation memory
 */
export async function generateSurveyInsights(surveyResult, followUpText = "") {
  const base = buildSurveyPromptBase(surveyResult);
  const lines = [
    base,
    followUpText
      ? `User follow-up request: ${followUpText}`
      : "No additional follow-up provided.",
    "",
    "Provide: 1) Key interpretation themes, 2) Potential project framing, 3) (If Need References is Yes) 2–3 credible reference source titles only."
  ];
  return askGemini(lines, {});
}

/**
 * Simple convenience
 */
export async function handleGeneration() {
  const { text } = await askGemini("Provide a concise definition of software testing.");
  return text;
}

/* ---------- Structured JSON prompt (references URL optional, but keep sources) ---------- */

function normalizeFollowUp(followUp) {
  if (!followUp) return "";
  if (Array.isArray(followUp)) {
    const trimmed = followUp.map(f => String(f || "").trim()).filter(Boolean);
    if (!trimmed.length) return "";
    return `User Follow-ups:\n- ${trimmed.join("\n- ")}`;
  }
  return `User Follow-up: ${String(followUp)}`;
}

export function buildStructuredSurveyJSONPrompt(surveyResult, followUp = "") {
  const { needReferences, openEndedAnswer, chosenQuestions } = surveyResult || {};
  const questionsBlock = (chosenQuestions || [])
    .map((q, i) => `${i + 1}. ${q.question}${q.description ? ` (Desc: ${q.description})` : ""}`)
    .join("\n");

  const followUpBlock = normalizeFollowUp(followUp);

  return [
    "You are an assistant that must output ONLY valid JSON (no markdown, no commentary).",
    "Schema:",
    "{",
    '  "title": "Concise title (max 10 words)",',
    '  "summary": "Short paragraph summarizing user intent.",',
    '  "themes": [ { "name": "Theme name", "explanation": "1–2 sentences" } ],',
    '  "projectIdeas": [ { "name": "Short project name", "goal": "1 sentence", "potentialImpact": "1 sentence", "nextSteps": ["Action 1","Action 2","Action 3"] } ],',
    '  "references": [ {',
    '      "source": "Credible source or concept title",',
    '      "type": "journal|book|organization|standard",',
    '      "url": "https://..." // optional',
    "  } ],",
    '  "risks": ["Risk statement 1","Risk statement 2"],',
    '  "visualTable": {',
    '    "columns": ["Column 1", "Column 2", "Column 3"],',
    '    "rows": [',
    '      ["Row1-Col1", "Row1-Col2", "Row1-Col3"],',
    '      ["Row2-Col1", "Row2-Col2", "Row2-Col3"]',
    '    ]',
    "  },",
    '  "researchQuestions": ["Question 1", "Question 2", "Question 3"]',
    "}",
    "",
    `Need References: ${needReferences ? "Yes" : "No"}`,
    `User Additional Info: ${openEndedAnswer || "(none)"}`,
    "Selected Questions:",
    questionsBlock || "(none)",
    followUpBlock || "",
    "",
    "Rules:",
    "- Output ONLY JSON (no backticks, no markdown).",
    "- If references are not needed set references: [].",
    "- If references ARE needed, ALWAYS include 3–5 reference objects with at least the 'source' field.",
    "- Provide an official homepage or canonical URL when known; omit 'url' only if unknown.",
    "- Do NOT invent DOIs/URLs. If unsure of URL, leave it out but keep the reference 'source'.",
    "- Keep projectIdeas to max 3 unless user explicitly asked for more.",
    "- Title <= 10 words.",
    "- All strings plain (no markdown formatting).",
    "- visualTable must be compact (3–5 columns, 3–6 rows).",
    "- researchQuestions should be 3–6 concise, researchable questions.",
  ].filter(Boolean).join("\n");
}

export async function generateStructuredSurveyJSON(surveyResult, followUp = "") {
  const prompt = buildStructuredSurveyJSONPrompt(surveyResult, followUp);
  // Force a single-shot (no memory for this raw JSON call)
  const res = await askGemini(prompt, {
    structured: false,
    // modelName: "gemini-2.5-flash" // optionally force larger model for references
  });
  return res; // { text, raw, modelUsed }
}

// Export everything needed
export default {
  getClient,
  getModel,
  basicModel,
  askGemini,
  streamGemini,
  chooseModel,
  estimateTokens,
  buildSurveyPromptBase,
  createSurveySession,
  generateSurveyInsights,
  handleGeneration,
  buildStructuredSurveyJSONPrompt,
  generateStructuredSurveyJSON
};