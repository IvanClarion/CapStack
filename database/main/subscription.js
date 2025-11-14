// new helper for subscription / tier evaluation
import { supabase } from '../lib/supabase';

/**
 * getUserTier
 * - Loads the most recent stripe_subscriptions row for the current authenticated user
 * - Evaluates whether the subscription is still active (status === 'active' AND current_period_end in the future)
 * - Returns { tier: 'elite' | 'commoner', subscription: <row|null> }
 *
 * Note: This is a client-side convenience. The canonical source of truth should be your
 * server-side Stripe webhook handlers which update the stripe_subscriptions table.
 */
export async function getUserTier() {
  try {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userRes?.user?.id) {
      return { tier: 'commoner', subscription: null };
    }
    const uid = userRes.user.id;

    const { data, error } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('users_id', uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[getUserTier] supabase error', error);
      return { tier: 'commoner', subscription: null };
    }

    const sub = data || null;
    if (!sub) return { tier: 'commoner', subscription: null };

    // Normalize status
    const status = (sub.status || '').toLowerCase();

    // current_period_end may be a timestamp string, epoch integer, or null
    let periodEndDate = null;
    if (sub.current_period_end) {
      // If it's numeric (epoch), convert to ms
      if (typeof sub.current_period_end === 'number') {
        periodEndDate = new Date(Number(sub.current_period_end) * 1000);
      } else {
        const parsed = new Date(sub.current_period_end);
        if (!Number.isNaN(parsed.getTime())) periodEndDate = parsed;
      }
    }

    const now = new Date();
    const notExpired = periodEndDate ? periodEndDate > now : true; // if no periodEnd available, consider not expired (rely on status)

    const isActive = status === 'active' && notExpired;

    return { tier: isActive ? 'elite' : 'commoner', subscription: sub };
  } catch (e) {
    console.warn('[getUserTier] unexpected error', e);
    return { tier: 'commoner', subscription: null };
  }
}