import { supabase } from '../lib/supabase';

/**
 * Append a token-usage event to the ledger for a conversation.
 * Server computes cumulative total_tokens automatically from survey_conversations.tokens_count.
 */
export async function addConversationTokens(conversationId: string, used: number, note?: string) {
  const p_used = Math.max(0, Math.floor(Number(used) || 0));
  const { data, error } = await supabase.rpc('add_conversation_tokens', {
    p_conversation_id: conversationId,
    p_used,
    p_note: note ?? null,
  });
  if (error) throw error;
  return data; // the inserted row
}