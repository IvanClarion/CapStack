import { supabase } from '../lib/supabase';

/**
 * Append a token-usage event to the ledger for a conversation.
 * Tries the RPC `add_conversation_tokens` first (atomic on server).
 * Falls back to a direct UPDATE + optional ledger INSERT if the RPC is unavailable.
 *
 * Returns:
 *  - RPC path: the inserted ledger row (public.conversation_tokens)
 *  - Fallback path: a pseudo row with the same shape (best-effort), or null if insert not possible
 */
export async function addConversationTokens(
  conversationId: string,
  used: number,
  note?: string
) {
  const p_used = Math.max(0, Math.floor(Number(used) || 0));

  // 1) Preferred path: server RPC (atomic, consistent)
  try {
    const { data, error } = await supabase.rpc('add_conversation_tokens', {
      p_conversation_id: conversationId,
      p_used,
      p_note: note ?? null,
    });
    if (error) throw error;
    return data || null; // server returns the inserted ledger row
  } catch (rpcErr) {
    // 2) Fallback path: client-side update (non-atomic; good enough for most apps)
    // Read current tokens_count and owner id
    const { data: convo, error: selErr } = await supabase
      .from('survey_conversations')
      .select('tokens_count, user_id')
      .eq('id', conversationId)
      .maybeSingle();
    if (selErr) throw selErr;
    if (!convo) throw new Error('Conversation not found');

    const next = Math.max(0, Number(convo.tokens_count || 0)) + p_used;

    // Update running total
    const { error: updErr } = await supabase
      .from('survey_conversations')
      .update({ tokens_count: next, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    if (updErr) throw updErr;

    // Optional: write to a ledger table if it exists (ignore if table/policy missing)
    let pseudoRow: any = null;
    try {
      const insert = {
        conversation_id: conversationId,
        user_id: convo.user_id,
        tokens: p_used,
        note: note ?? null,
      };
      const { data: ledgers } = await supabase
        .from('conversation_tokens')
        .insert(insert)
        .select('*') // return the inserted row if policies allow
        .limit(1);
      pseudoRow = Array.isArray(ledgers) ? ledgers[0] : null;

      // If the insert didn't return (due to RLS select restrictions), synthesize a minimal shape
      if (!pseudoRow) {
        pseudoRow = {
          id: null,
          ...insert,
          created_at: new Date().toISOString(),
        };
      }
    } catch {
      // Ledger table may not exist or RLS may block; ignore silently
      pseudoRow = null;
    }

    return pseudoRow;
  }
}