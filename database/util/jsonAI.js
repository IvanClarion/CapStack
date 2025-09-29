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

  // Optional fields checks (non-fatal)
  if (obj.visualTable) {
    const vt = obj.visualTable;
    if (typeof vt !== "object") return "visualTable must be an object if provided";
    if (vt.columns && !Array.isArray(vt.columns)) return "visualTable.columns must be an array";
    if (vt.rows && !Array.isArray(vt.rows)) return "visualTable.rows must be an array";
  }
  if (obj.researchQuestions && !Array.isArray(obj.researchQuestions)) {
    return "researchQuestions must be an array if provided";
  }
  return null;
}

function sanitizeStringArray(arr) {
  return Array.isArray(arr) ? arr.map(x => String(x ?? "")).filter(Boolean) : [];
}

function sanitizeTable(vt) {
  if (!vt || typeof vt !== "object") return { columns: [], rows: [] };
  const columns = sanitizeStringArray(vt.columns).slice(0, 6); // safety cap
  const rows = Array.isArray(vt.rows) ? vt.rows : [];
  const cleanedRows = rows
    .map(r => (Array.isArray(r) ? r.map(c => String(c ?? "")) : null))
    .filter(Boolean)
    .slice(0, 10) // safety cap
    .map(r => (columns.length ? r.slice(0, columns.length) : r));
  return { columns, rows: cleanedRows };
}

// Expanded URL recognition
function isLikelyUrl(s) {
  if (!s) return false;
  const t = String(s).trim();
  if (/^https?:\/\//i.test(t)) return true;
  if (/^www\./i.test(t)) return true;
  // DOI patterns: doi:... or bare 10.xxxx/...
  if (/^(doi:)?10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i.test(t)) return true;
  // arXiv: 1234.56789 or arXiv:1234.56789v2
  if (/^arxiv:\s*\d{4}\.\d{4,5}(v\d+)?$/i.test(t)) return true;
  return false;
}

function normalizeUrlLike(u) {
  if (!u) return null;
  let t = String(u).trim();

  // Promote www. to https://
  if (/^www\./i.test(t)) return `https://${t.replace(/^www\./i, "www.")}`;

  // DOI to https://doi.org/...
  const doiMatch = t.match(/^(?:doi:)?(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)$/i);
  if (doiMatch) return `https://doi.org/${doiMatch[1]}`;

  // arXiv to https://arxiv.org/abs/...
  const arxivMatch = t.match(/^arxiv:\s*(\d{4}\.\d{4,5}(?:v\d+)?)/i);
  if (arxivMatch) return `https://arxiv.org/abs/${arxivMatch[1]}`;

  // Already http(s)
  if (/^https?:\/\//i.test(t)) return t;

  return null;
}

function normalizeReference(r) {
  // Accept string or object inputs, output a normalized object
  if (typeof r === "string") {
    const s = r.trim();
    const url = normalizeUrlLike(s);
    return {
      source: s || "(untitled source)",
      type: null,
      url
    };
  }
  if (!r || typeof r !== "object") {
    return { source: "(untitled source)", type: null, url: null };
  }
  // Accept common alternate keys for source
  const sourceRaw = r.source ?? r.title ?? r.name ?? "";
  const source = String(sourceRaw ?? "").trim() || "(untitled source)";
  const type = r.type ? String(r.type).trim() : null;

  // Prefer explicit URL if valid/normalizable; otherwise try to derive from source
  let url = normalizeUrlLike(r.url);
  if (!url && isLikelyUrl(source)) {
    url = normalizeUrlLike(source);
  }

  return { source, type, url };
}

function sanitizeReferences(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeReference).filter(ref => !!ref && !!ref.source);
}

export function coerceStructuredDefaults(obj) {
  if (!obj || typeof obj !== "object") return obj;

  // Be tolerant of capitalization variants from the model
  if (!("references" in obj) && "References" in obj) obj.references = obj.References;
  if (!("projectIdeas" in obj) && "ProjectIdeas" in obj) obj.projectIdeas = obj.ProjectIdeas;
  if (!("themes" in obj) && "Themes" in obj) obj.themes = obj.Themes;

  obj.themes = Array.isArray(obj.themes) ? obj.themes : [];
  obj.projectIdeas = Array.isArray(obj.projectIdeas) ? obj.projectIdeas : [];
  obj.references = sanitizeReferences(obj.references);
  obj.risks = Array.isArray(obj.risks) ? obj.risks : [];
  if (!obj.title) obj.title = "Untitled";
  if (!obj.summary) obj.summary = "";

  // New optional fields
  obj.researchQuestions = sanitizeStringArray(obj.researchQuestions);
  obj.visualTable = sanitizeTable(obj.visualTable);

  obj.schemaVersion = 2;
  return obj;
}