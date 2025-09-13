import { supabase } from '../lib/supabase'

export async function fetchSurvey() {
  try {
    const { data, error } = await supabase
      .from('survey_title')
      .select(`
        id,
        title,
        description,
        survey_questions (
          id,
          survey_title_id,
          questions,
          created_at,
          description
        )
      `)
      .order('created_at', { ascending: true })
      .order('created_at', { referencedTable: 'survey_questions', ascending: true })

    if (error) throw error;
    console.log('survey fetched', data);
    return data;
  } catch (error) {
    console.log(error.message);
    return null;
  }
}