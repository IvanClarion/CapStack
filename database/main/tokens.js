import { supabase } from '../lib/supabase';

/**
 * Fetch today's tokens for the current authenticated user.
 * Throws on error so the caller can handle and show a message.
 */
export async function fetchTodayTokensStrict() {
  const { data, error } = await supabase.rpc('get_today_tokens');
  if (error) {
    throw error;
  }
  return data; // { total_tokens, used_tokens, remaining_tokens, day, ... }
}

/**
 * Backward-compatible wrapper. Returns null on error (so UI can keep defaults).
 */
export async function fetchTodayTokens() {
  try {
    return await fetchTodayTokensStrict();
  } catch (error) {
    console.warn('[fetchTodayTokens] rpc error:', error?.message || error);
    return null;
  }
}

/**
 * Increment used tokens for today by amount (>=0). Returns updated row.
 */
export async function recordUsedTokens(amount) {
  const inc = Math.max(0, Math.floor(Number(amount) || 0));
  const { data, error } = await supabase.rpc('inc_used_tokens', { p_amount: inc });
  if (error) {
    console.warn('[recordUsedTokens] rpc error:', error?.message || error);
    throw error;
  }
  return data;
}