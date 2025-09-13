import { supabase } from "../lib/supabase";

// ... (other functions like saveConversation already defined)

export async function getConversation({ id, userId }) {
  if (!id || !userId) return { data: null, error: new Error("id and userId are required") };
  const { data, error } = await supabase
    .from("survey_conversations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  return { data, error };
}