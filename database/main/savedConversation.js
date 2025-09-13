import { supabase } from "../lib/supabase";

/**
 * Utility: ensure array of non-empty strings
 */
function sanitizeArray(arr) {
  return Array.isArray(arr)
    ? arr.filter(a => typeof a === "string" && a.trim().length)
    : [];
}

/**
 * Utility: remove undefined keys (helps with Supabase insert/update cleanliness)
 */
function stripUndefined(obj) {
  const clean = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
      clean[k] = obj[k];
    }
  }
  return clean;
}

/**
 * saveConversation
 * Insert (no id) or update (with id). Optionally append followUps.
 *
 * Table expected (example):
 * survey_conversations(
 *   id uuid pk,
 *   user_id uuid references auth.users(id),
 *   survey_result jsonb,
 *   structured_payload jsonb,
 *   follow_ups text[],
 *   model_used text,
 *   messages jsonb,
 *   archived boolean default false,
 *   created_at timestamptz default now(),
 *   updated_at timestamptz default now()
 * )
 */
export async function saveConversation(params = {}) {
  const {
    userId,
    surveyResult,
    structuredPayload,
    followUps = [],
    modelUsed,
    messages = [],
    id,
    appendFollowUps = true
  } = params;

  if (!userId) return { data: null, error: new Error("userId is required") };
  if (!surveyResult) return { data: null, error: new Error("surveyResult is required") };
  if (!structuredPayload) return { data: null, error: new Error("structuredPayload is required") };

  const cleanFollowUps = sanitizeArray(followUps);

  try {
    if (!id) {
      // INSERT
      const insertObj = stripUndefined({
        user_id: userId,
        survey_result: surveyResult,
        structured_payload: structuredPayload,
        follow_ups: cleanFollowUps,
        model_used: modelUsed || null,
        messages: messages?.length ? messages : null
      });

      console.log("[saveConversation][insert] payload:", insertObj);

      const { data, error } = await supabase
        .from("survey_conversations")
        .insert([insertObj])
        .select()
        .single();

      if (error) {
        console.error("[saveConversation][insert] error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      }

      return { data, error };
    }

    // UPDATE
    let existingFollowUps = [];
    if (appendFollowUps && cleanFollowUps.length) {
      const { data: existing, error: fetchErr } = await supabase
        .from("survey_conversations")
        .select("follow_ups")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (fetchErr) {
        console.warn("[saveConversation][fetch existing followUps] error:", {
          message: fetchErr.message,
          details: fetchErr.details,
          hint: fetchErr.hint,
          code: fetchErr.code
        });
      } else if (existing?.follow_ups) {
        existingFollowUps = existing.follow_ups;
      }
    }

    const mergedFollowUps = appendFollowUps
      ? [...existingFollowUps, ...cleanFollowUps]
      : cleanFollowUps;

    const updateObj = stripUndefined({
      structured_payload: structuredPayload,
      follow_ups: mergedFollowUps,
      model_used: modelUsed || null,
      messages: messages?.length ? messages : null,
      updated_at: new Date().toISOString()
      // If you ever want to replace the original survey_result, uncomment:
      // survey_result: surveyResult
    });

    console.log("[saveConversation][update] payload:", { id, userId, updateObj });

    const { data, error } = await supabase
      .from("survey_conversations")
      .update(updateObj)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[saveConversation][update] error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }

    return { data, error };
  } catch (err) {
    console.error("[saveConversation][exception]", err);
    return { data: null, error: err };
  }
}

/**
 * getConversation
 */
export async function getConversation({ id, userId }) {
  if (!id || !userId) {
    return { data: null, error: new Error("id and userId are required") };
  }
  const { data, error } = await supabase
    .from("survey_conversations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("[getConversation] error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  }

  return { data, error };
}

/**
 * listConversations
 */
export async function listConversations({
  userId,
  limit = 20,
  offset = 0,
  includeArchived = false
}) {
  if (!userId) {
    return { data: null, error: new Error("userId is required") };
  }

  let query = supabase
    .from("survey_conversations")
    .select(
      "id, created_at, updated_at, model_used, follow_ups, archived, structured_payload->title, survey_result->needReferences"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeArchived) {
    query = query.eq("archived", false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[listConversations] error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  }

  return { data, error };
}

/**
 * archiveConversation
 */
export async function archiveConversation({ id, userId }) {
  if (!id || !userId) {
    return { data: null, error: new Error("id and userId are required") };
  }
  const { data, error } = await supabase
    .from("survey_conversations")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[archiveConversation] error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  }

  return { data, error };
}

/**
 * restoreConversation
 */
export async function restoreConversation({ id, userId }) {
  if (!id || !userId) {
    return { data: null, error: new Error("id and userId are required") };
  }
  const { data, error } = await supabase
    .from("survey_conversations")
    .update({ archived: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[restoreConversation] error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  }

  return { data, error };
}

/**
 * deleteConversationPermanent
 */
export async function deleteConversationPermanent({ id, userId }) {
  if (!id || !userId) {
    return { data: null, error: new Error("id and userId are required") };
  }
  const { data, error } = await supabase
    .from("survey_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[deleteConversationPermanent] error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  }

  return { data, error };
}

/**
 * appendFollowUp
 * (Convenience wrapper)
 */
export async function appendFollowUp({
  id,
  userId,
  newFollowUp,
  newStructuredPayload,
  modelUsed
}) {
  if (!id || !userId || !newFollowUp || !newStructuredPayload) {
    return {
      data: null,
      error: new Error("id, userId, newFollowUp, newStructuredPayload required")
    };
  }

  return saveConversation({
    id,
    userId,
    surveyResult: {}, // Not replacing original survey_result
    structuredPayload: newStructuredPayload,
    followUps: [newFollowUp],
    modelUsed,
    messages: null,
    appendFollowUps: true
  });
}