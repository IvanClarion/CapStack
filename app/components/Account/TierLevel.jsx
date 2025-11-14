import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import '../../../assets/stylesheet/global.css';
import WrapperView from '../../../components/input/WrapperView';
import ThemeText from '../../../components/ui/ThemeText';
import LayoutView from '../../../components/layout/LayoutView';
import { CreativeCommons, Crown, RefreshCw } from 'lucide-react-native';
import { supabase } from '../../../database/lib/supabase';

const TierLevel = () => {
  const [tier, setTier] = useState('commoner'); // default if no record yet
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;

      const uid = sessionData?.session?.user?.id ?? null;
      if (!uid) {
        // not authenticated; keep default
        setTier('commoner');
        return;
      }

      // Read latest subscription for this user
      const { data, error } = await supabase
        .from('stripe_subscriptions')
        .select('status,current_period_end')
        .eq('users_id', uid)
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const status = (data?.status || '').toLowerCase();
      const end = data?.current_period_end ? new Date(data.current_period_end) : null;
      const now = new Date();
      const notExpired = end && end.getTime() > now.getTime();

      // Elite only when active/trialing AND current_period_end is in the future
      const isActiveLike = status === 'active' || status === 'trialing';
      const nextTier = isActiveLike && notExpired ? 'elite' : 'commoner';

      setTier(nextTier);
    } catch (e) {
      setErr(e?.message || 'Failed to fetch subscription status.');
      // keep showing last known tier (or default)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, [load]);

  const isElite = tier === 'elite';
  const Icon = isElite ? Crown : CreativeCommons;
  const iconColor = isElite ? '#FFD700' /* yellow-400 */ : '#E0E0E0';
  const borderClass = isElite ? 'border-amber-400/50' : 'border-gray-600';
  const bgClass = isElite ? 'bg-amber-400/20' : 'bg-gray-500/50';
  const label = isElite ? 'Elite' : 'Commoner';

  return (
    <LayoutView>
      
        <WrapperView className={`flex-row border-2 ${borderClass} ${bgClass} p-2 rounded-lg gap-2 items-center`}>
          <Icon color={iconColor} size={20} />
          <ThemeText className="text-sm font-semibold">{label}</ThemeText>

          {loading && (
            <ActivityIndicator size="small" color={iconColor} style={{ marginLeft: 8 }} />
          )}

          {!!err && !loading && (
            <WrapperView className="flex-row items-center gap-1 ml-2">
              <RefreshCw size={14} color={'#EF4444'} />
              <ThemeText className="text-[11px] text-red-400">Tap to retry</ThemeText>
            </WrapperView>
          )}
        </WrapperView>
     
    </LayoutView>
  );
};

export default TierLevel;