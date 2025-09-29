import { supabase } from '../lib/supabase';

export async function deleteConversation({ id }) {
  if (!id) {
    return { data: null, error: new Error('id is required') };
  }

  // Rely on RLS (user_id = auth.uid()) for permission. No userId filter needed.
  const { data, error } = await supabase
    .from('survey_conversations')
    .delete()
    .eq('id', id)
    .select('id'); // return deleted ids

  if (error) {
    console.error('[deleteConversation] error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { data: null, error };
  }

  if (!data || data.length === 0) {
    // Most likely RLS denied or the id doesn’t exist
    return { data: null, error: new Error('No row deleted (RLS denied or not found)') };
  }

  return { data: data[0], error: null };
}