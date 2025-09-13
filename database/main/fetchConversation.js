import { supabase } from "../lib/supabase";

/**
 * fetchConversations
 * Fetch conversations (archived or not) returning ONLY: id, structured_payload.
 *
 * @param {object} params
 * @param {string} [params.userId]              Optional filter by user_id.
 * @param {boolean} [params.archivedOnly=true]  If true, only archived rows.
 * @param {string} [params.search]              Case-insensitive search on structured_payload.title.
 */
export async function fetchConversations({
  userId,
  archivedOnly = true,
  search
} = {}) {
  try {
    let query = supabase
      .from("survey_conversations")
      .select("id, structured_payload")
      .order("created_at", { ascending: false });

    if (archivedOnly) {
      query = query.eq("archived", true);
    }
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (search && search.trim()) {
      // Attempt JSON path title filter
      query = query.ilike("structured_payload->>title", `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const shaped = (data || []).map(r => ({
      id: r.id,
      structured_payload: r.structured_payload ?? {}
    }));

    return { data: shaped, error: null };
  } catch (error) {
    console.error("[fetchConversations] error:", error);
    return { data: null, error };
  }
}