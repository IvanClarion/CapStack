import { supabase } from "../lib/supabase";

/**
 * saveConversation
 * - Creates or updates a conversation in survey_conversations.
 * - tokensCount (number) is saved to tokens_count.
 */
export async function saveConversation({
  id,                 // optional: when present, updates
  userId,
  surveyResult = null,
  structuredPayload = null,
  followUps = [],
  modelUsed = null,
  messages = null,
  appendFollowUps = false,
  tokensCount = null   // NEW: estimated or exact token usage
}) {
  if (!userId) {
    return { data: null, error: new Error("userId is required") };
  }

  try {
    const now = new Date().toISOString();

    if (!id) {
      // Insert new row
      const insertObj = {
        user_id: userId,
        survey_result: surveyResult,
        structured_payload: structuredPayload,
        follow_ups: followUps,
        model_used: modelUsed,
        messages,
        archived: true,
        created_at: now,
        updated_at: now,
        ...(typeof tokensCount === "number" ? { tokens_count: tokensCount } : {})
      };

      const { data, error } = await supabase
        .from("survey_conversations")
        .insert([insertObj])
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }
      return { data, error: null };
    }

    // Update existing row
    const updateObj = {
      updated_at: now
    };

    if (surveyResult !== null) updateObj.survey_result = surveyResult;
    if (structuredPayload !== null) updateObj.structured_payload = structuredPayload;
    if (modelUsed !== null) updateObj.model_used = modelUsed;
    if (messages !== null) updateObj.messages = messages;
    if (typeof tokensCount === "number") updateObj.tokens_count = tokensCount;

    if (appendFollowUps && Array.isArray(followUps) && followUps.length) {
      // If you want true append on the server, replace this with a PostgREST RPC or SQL
      updateObj.follow_ups = followUps;
    } else if (Array.isArray(followUps)) {
      updateObj.follow_ups = followUps;
    }

    const { data, error } = await supabase
      .from("survey_conversations")
      .update(updateObj)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Optional helpers (unchanged): getConversation, listConversations, archiveConversation, restoreConversation
 * Keep your existing implementations here.
 */