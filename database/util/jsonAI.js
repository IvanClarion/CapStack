// JSON sanitation + guarded parsing + basic normalization

export function stripCodeFences(text = "") {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function lightRepair(str) {
  return str
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/^\uFEFF/, "");
}

export function safeParseStructuredJSON(raw) {
  if (!raw) return { ok: false, error: "Empty response", data: null, raw };
  const cleaned = lightRepair(stripCodeFences(raw));
  try {
    const data = JSON.parse(cleaned);
    return { ok: true, data, error: null, raw };
  } catch (e) {
    return { ok: false, error: e.message, data: null, raw };
  }
}

export function validateStructuredPayload(obj) {
  if (!obj || typeof obj !== "object") return "Not an object";
  const required = ["title", "summary", "themes", "projectIdeas", "references", "risks"];
  for (const key of required) {
    if (!(key in obj)) return `Missing key: ${key}`;
  }
  if (!Array.isArray(obj.themes)) return "themes must be an array";
  if (!Array.isArray(obj.projectIdeas)) return "projectIdeas must be an array";
  if (!Array.isArray(obj.references)) return "references must be an array";
  if (!Array.isArray(obj.risks)) return "risks must be an array";
  return null;
}

export function coerceStructuredDefaults(obj) {
  if (!obj || typeof obj !== "object") return obj;
  obj.themes = Array.isArray(obj.themes) ? obj.themes : [];
  obj.projectIdeas = Array.isArray(obj.projectIdeas) ? obj.projectIdeas : [];
  obj.references = Array.isArray(obj.references) ? obj.references : [];
  obj.risks = Array.isArray(obj.risks) ? obj.risks : [];
  if (!obj.title) obj.title = "Untitled";
  if (!obj.summary) obj.summary = "";
  obj.schemaVersion = 1;
  return obj;
}