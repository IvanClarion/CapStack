import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ArrowDownLeft, Diamond, Circle, LayoutDashboard, ArrowUpRight, RefreshCw } from 'lucide-react-native';
import ThemeText from '../../../components/ui/ThemeText';
import LayoutView from '../../../components/layout/LayoutView';
import WrapperView from '../../../components/input/WrapperView';
import ThemeIcon from '../../../components/ui/ThemeIcon';
import ThemeCard from '../../../components/ui/ThemeCard';
import ThemeBody from '../../../components/ui/ThemeBody';
import TransactionHistory from './TransactionHistory';
import ButtonView from '../../../components/buttons/ButtonView';
import '../../../assets/stylesheet/global.css';
import { fetchTodayTokensStrict } from '../../../database/main/tokens';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../../database/lib/supabase';

const Tokens = () => {
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userTier, setUserTier] = useState('commoner'); // 'commoner' | 'elite'
  const RESET_DAYS = 3; // reset window in days

  // default snapshot; will be overwritten by load()
  const [today, setToday] = useState({
    total_tokens: 32000,
    used_tokens: 0,
    remaining_tokens: 32000,
  });

  // Determine user's subscription tier (commoner vs elite) WITH expiration check
  async function loadUserTier() {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) {
        setUserTier('commoner');
        return;
      }

      const { data, error } = await supabase
        .from('stripe_subscriptions')
        .select('status,current_period_end,created_at')
        .eq('users_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[Tokens] loadUserTier error:', error);
        setUserTier('commoner');
        return;
      }

      const status = (data?.status || '').toLowerCase();
      const end = data?.current_period_end ? new Date(data.current_period_end) : null;
      const now = new Date();
      const notExpired = end && end.getTime() > now.getTime();
      const isActiveLike = status === 'active' || status === 'trialing';

      // Elite only if active/trialing AND not expired by current_period_end
      const nextTier = isActiveLike && notExpired ? 'elite' : 'commoner';
      setUserTier(nextTier);
    } catch (e) {
      console.warn('[Tokens] loadUserTier exception:', e);
      setUserTier('commoner');
    }
  }

  // Wait for session before hitting RPCs (prevents "Not authenticated" and silent 0s)
  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSessionReady(!!data?.session);
      // load tier once session available
      await loadUserTier();
      if (data?.session) {
        load();
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSessionReady(!!session);
      if (session) {
        loadUserTier();
        load();
      } else {
        // session logged out - reset
        setUserTier('commoner');
      }
    });

    init();

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function load() {
    if (!sessionReady) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const row = await fetchTodayTokensStrict();

      // Choose limit according to tier
      const limit = userTier === 'elite' ? 100000 : 32000;
      const used = Number(row?.used_tokens ?? row?.used ?? 0);

      const remaining = Math.max(0, limit - used);

      setToday({
        total_tokens: limit,
        used_tokens: used,
        remaining_tokens: remaining,
      });
    } catch (e) {
      console.warn('[Tokens.load] get_today_tokens error:', e);
      setErrorMsg(e?.message || 'Failed to load tokens.');
      // Keep previous today state on error (no overwrite)
    } finally {
      setLoading(false);
    }
  }

  // Reload when screen gains focus (after session is ready or tier changes)
  useFocusEffect(
    React.useCallback(() => {
      if (sessionReady) load();
    }, [sessionReady, userTier]),
  );

  return (
    <ThemeCard className="m-2 grid gap-5">
      <LayoutView className="grid gap-5">
        <WrapperView className="flex flex-row gap-2 items-center">
          <ThemeIcon className="iconWrapper">
            <LayoutDashboard />
          </ThemeIcon>
          <ThemeText className="cardHeader">Dashboard</ThemeText>
        </WrapperView>
        {errorMsg ? (
          <ThemeText className="text-[11px] color-red-400">
            {errorMsg}
          </ThemeText>
        ) : null}
      </LayoutView>

      <LayoutView className="tokensInfoLayout">
        <ThemeBody className="tokensBodyContainer ">
          <WrapperView className="flex-row p-2 gap-1 items-center">
            <Circle size={10} fill={'#667EEA'} color={'#667EEA'} />
            <ThemeText className="text-lg font-semibold">Total Tokens</ThemeText>
          </WrapperView>
          <WrapperView className="flex-row justify-center gap-1 flex-1 p-2 items-center">
            <Diamond size={25} color={'#667EEA'} />
            <ThemeText className="cardHeader items-center justify-center">
              {loading ? '...' : today.total_tokens.toLocaleString()}
            </ThemeText>
          </WrapperView>
        </ThemeBody>

        {/* Used + Remaining in a single flex row */}
        <WrapperView className="flex-1 flex-row lg:flex-col gap-2">
          <ThemeBody className="tokensBodyContainer flex-1">
            <WrapperView className="flex-row p-2 gap-1 items-center">
              <Circle size={10} fill={'#FF6060'} color={'#FF6060'} />
              <ThemeText className="text-xs font-semibold">Token Used</ThemeText>
            </WrapperView>
            <WrapperView className="flex-row justify-center gap-1 p-2 items-center">
              <ArrowDownLeft size={25} color={'#FF6060'} />
              <ThemeText className="cardHeader">
                {loading ? '...' : today.used_tokens.toLocaleString()}
              </ThemeText>
            </WrapperView>
          </ThemeBody>

          <ThemeBody className="tokensBodyContainer flex-1">
            <WrapperView className="flex-row p-2 gap-1 items-center">
              <Circle size={10} fill={'#22C55E'} color={'#22C55E'} />
              <ThemeText className="text-xs font-semibold">Remaining Tokens</ThemeText>
            </WrapperView>
            <WrapperView className="flex-row justify-center gap-1 p-2 items-center">
              <ArrowUpRight size={25} color={'#22C55E'} />
              <ThemeText className="cardHeader">
                {loading ? '...' : today.remaining_tokens.toLocaleString()}
              </ThemeText>
            </WrapperView>
          </ThemeBody>
        </WrapperView>
      </LayoutView>

      <LayoutView className="grid gap-2">
        <ThemeText className="cardHeader">Transaction History</ThemeText>
        <TransactionHistory />
        <ButtonView
          className="simpleButton w-fit android:border-none android:w-full android:border-0 "
          onPress={load}
          disabled={loading || !sessionReady}
        >
          <WrapperView className="flex flex-row items-center gap-1">
            <RefreshCw size={16} color={'white'} />
            <Text className="font-semibold color-white">
              {loading ? 'Refreshing...' : 'Refresh'}
            </Text>
          </WrapperView>
        </ButtonView>
      </LayoutView>
    </ThemeCard>
  );
};

export default Tokens;