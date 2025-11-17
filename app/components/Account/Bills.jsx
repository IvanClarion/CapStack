import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { FontAwesome } from '@expo/vector-icons';
import {
  ReceiptText,
  CalendarClock,
  BanknoteArrowUp,
  Wallet,
  CircleAlert,
  Trash,
  CreditCard,
  Check,
} from 'lucide-react-native';

import '../../../assets/stylesheet/global.css';
import ThemeCard from '../../../components/ui/ThemeCard';
import WrapperView from '../../../components/input/WrapperView';
import ThemeBody from '../../../components/ui/ThemeBody';
import ThemeText from '../../../components/ui/ThemeText';
import LayoutView from '../../../components/layout/LayoutView';
import ButtonView from '../../../components/buttons/ButtonView';
import { supabase } from '../../../database/lib/supabase';
import DeletePMModal from '../modal/DeletePMModal';
import { deletePaymentMethod } from '../../../database/auth/DeletePMfunction';

const FUNCTIONS_BASE = process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL;
const PRICE_MONTHLY = process.env.EXPO_PUBLIC_STRIPE_PRICE_MONTHLY;
const PRICE_YEARLY = process.env.EXPO_PUBLIC_STRIPE_PRICE_YEARLY;

function formatExpiry(mm, yy) {
  if (!mm || !yy) return '';
  return `${mm}/${String(yy).slice(-2)}`;
}
function formatDate(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return d.toLocaleDateString();
  } catch {
    return '—';
  }
}

WebBrowser.maybeCompleteAuthSession?.();

const BrandIcon = ({ brand, size = 22 }) => {
  const b = (brand || '').toLowerCase();
  switch (b) {
    case 'visa': return <FontAwesome name="cc-visa" size={size} color="#1A1F71" />;
    case 'mastercard': return <FontAwesome name="cc-mastercard" size={size} color="#EB001B" />;
    case 'amex': return <FontAwesome name="cc-amex" size={size} color="#2E77BC" />;
    case 'discover': return <FontAwesome name="cc-discover" size={size} color="#FF6000" />;
    case 'diners': return <FontAwesome name="cc-diners-club" size={size} color="#0A4A8A" />;
    case 'jcb': return <FontAwesome name="cc-jcb" size={size} color="#0B4EA2" />;
    default: return <CreditCard size={size} color="#E0E0E0" />;
  }
};

const Bills = () => {
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingSubscribe, setLoadingSubscribe] = useState(false);
  const [loadingPMs, setLoadingPMs] = useState(false);
  const [pmList, setPmList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPM, setSelectedPM] = useState(null);

  // Plan selection: 'monthly' or 'yearly'
  const [plan, setPlan] = useState('monthly');
  const selectedPriceId = plan === 'monthly' ? PRICE_MONTHLY : PRICE_YEARLY;

  // Subscription state
  const [sub, setSub] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);

  const loadSubscription = useCallback(async () => {
    setLoadingSub(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) {
        setSub(null);
        return;
      }
      const { data, error } = await supabase
        .from('stripe_subscriptions')
        .select('status,current_period_start,current_period_end,created_at')
        .eq('users_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      setSub(data || null);
    } catch {
      setSub(null);
    } finally {
      setLoadingSub(false);
    }
  }, []);

  /**
   * IMPORTANT FIX:
   * Only load payment methods for the currently authenticated user.
   * Previously the SELECT omitted a user filter which returned everyone’s methods.
   */
  const loadPaymentMethods = useCallback(async () => {
    try {
      setErrorMsg('');
      setLoadingPMs(true);

      // Get current user id
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (userErr || !uid) {
        // Not signed in or error — clear list
        setPmList([]);
        return;
      }

      const { data, error } = await supabase
        .from('stripe_payment_methods')
        .select('stripe_payment_method_id, type, card_brand, card_last4, exp_month, exp_year, wallet_provider, status, is_default, created_at')
        .eq('user_id', uid) // <-- SCOPE TO CURRENT USER
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPmList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErrorMsg(e?.message || 'Failed to load payment methods.');
      setPmList([]);
    } finally {
      setLoadingPMs(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentMethods();
    loadSubscription();
  }, [loadPaymentMethods, loadSubscription]);

  useFocusEffect(useCallback(() => {
    loadPaymentMethods();
    loadSubscription();
  }, [loadPaymentMethods, loadSubscription]));

  const defaultPM = useMemo(
    () => pmList.find((p) => p.is_default) || (pmList.length > 0 ? pmList[0] : null),
    [pmList]
  );

  const handleConnect = useCallback(async () => {
    try {
      setLoadingConnect(true);
      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes?.session?.access_token;
      if (!token) { Alert.alert('Not signed in', 'Please sign in to connect a payment method.'); return; }
      if (!FUNCTIONS_BASE) { Alert.alert('Config error', 'Missing EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL.'); return; }

      const redirectUrl = Linking.createURL('wallet-connected');
      const cancelUrl = Linking.createURL('wallet-canceled');

      const res = await fetch(`${FUNCTIONS_BASE}/create-checkout-setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ success_url: redirectUrl, cancel_url: cancelUrl }),
      });

      const txt = await res.text();
      let payload = {};
      try { payload = JSON.parse(txt); } catch {}
      if (__DEV__) console.log('[setup] status', res.status, 'payload', payload || txt);
      if (!res.ok || !payload?.url) throw new Error(payload?.error || txt || 'Could not start Stripe Checkout.');

      const result = await WebBrowser.openAuthSessionAsync(payload.url, redirectUrl);
      if (result.type === 'success') await loadPaymentMethods();
      try { WebBrowser.dismissBrowser?.(); } catch {}
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to connect wallet.');
    } finally {
      setLoadingConnect(false);
    }
  }, [loadPaymentMethods]);

  const handleSubscribe = useCallback(async () => {
    try {
      setLoadingSubscribe(true);

      if (!FUNCTIONS_BASE) return Alert.alert('Config error', 'Missing EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL.');
      if (!selectedPriceId || !/^price_/.test(String(selectedPriceId))) {
        return Alert.alert('Config error', `Missing or invalid Stripe price id for ${plan}.`);
      }

      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes?.session?.access_token;
      if (!token) return Alert.alert('Not signed in', 'Please sign in to subscribe.');

      const successUrl = Linking.createURL('subscription-confirmed');
      const cancelUrl = Linking.createURL('subscription-canceled');
      const pmId = defaultPM?.stripe_payment_method_id ?? null;

      if (__DEV__) console.log('[subscribe] price', selectedPriceId, 'pmId', pmId);

      const res = await fetch(`${FUNCTIONS_BASE}/create-checkout-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ price_id: selectedPriceId, success_url: successUrl, cancel_url: cancelUrl, pm_id: pmId }),
      });

      const txt = await res.text();
      let payload = {};
      try { payload = JSON.parse(txt); } catch {}
      if (__DEV__) console.log('[subscribe] status', res.status, 'payload', payload || txt);
      if (!res.ok || !payload?.url) throw new Error(payload?.error || txt || 'Could not start subscription checkout.');

      const result = await WebBrowser.openAuthSessionAsync(payload.url, successUrl);
      try { WebBrowser.dismissBrowser?.(); } catch {}
      if (result.type === 'success') {
        Alert.alert('Payment confirmation', 'Your subscription is processing. Thank you!');
        setTimeout(() => { loadSubscription(); }, 1500);
      }
    } catch (e) {
      Alert.alert('Subscribe failed', e?.message || 'Could not start subscription.');
    } finally {
      setLoadingSubscribe(false);
    }
  }, [plan, selectedPriceId, defaultPM, loadSubscription]);

  const openDelete = useCallback((pm) => { setSelectedPM(pm); setDeleteVisible(true); }, []);
  const closeDelete = useCallback(() => { setDeleteVisible(false); setSelectedPM(null); }, []);

  const confirmDelete = useCallback(async ({ password }) => {
    if (!selectedPM) return;
    if (!password || password.trim().length === 0) {
      Alert.alert('Required', 'Please enter your password.');
      return;
    }
    try {
      setDeleting(true);
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const email = userRes?.user?.email;
      if (userErr || !email) throw new Error('Could not read your account email.');
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw new Error('Incorrect password.');

      const { data: sessionRes } = await supabase.auth.getSession();
      const token = sessionRes?.session?.access_token;
      if (!token) throw new Error('Session expired. Please sign in again.');

      await deletePaymentMethod({ pmId: selectedPM.stripe_payment_method_id, token, password });
      closeDelete();
      await loadPaymentMethods();
      Alert.alert('Deleted', 'Payment method removed.');
    } catch (e) {
      Alert.alert('Delete failed', e?.message || 'Could not delete payment method.');
    } finally {
      setDeleting(false);
    }
  }, [selectedPM, closeDelete, loadPaymentMethods]);

  // Derived subscription helpers
  const subStatus = (sub?.status || '').toLowerCase();
  const isSubscribed = subStatus === 'active' || subStatus === 'trialing';
  // Show expiration only (current_period_end)
  const expirationText = sub?.current_period_end ? formatDate(sub.current_period_end) : '—';

  const PlanCard = ({ value, title, subtitle }) => {
    const active = plan === value;
    return (
      <Pressable
        onPress={() => setPlan(value)}
        className={`flex-1 rounded-xl p-3 border-2 ${active ? 'border-amber-400 bg-amber-400/10' : 'border-gray-600 bg-gray-600/30'}`}
      >
        <WrapperView className="flex-row items-center justify-between">
          <ThemeText className="font-semibold">{title}</ThemeText>
          {active ? <Check size={18} color="#F59E0B" /> : null}
        </WrapperView>
        {!!subtitle && <ThemeText className="text-xs opacity-75 mt-1">{subtitle}</ThemeText>}
      </Pressable>
    );
  };

  return (
    <ThemeCard className="overflow-hidden gap-5">
      {/* Header + Subscribe button */}
      <LayoutView className="flex flex-row align-middle gap-2 items-center">
        <WrapperView className="iconWrapper">
          <ReceiptText color={'white'} />
        </WrapperView>
        <WrapperView className="flex flex-1 flex-row items-center justify-between">
          <ThemeText className="cardHeader">Bills</ThemeText>
          <ButtonView
            className={`flex-row flex gap-1 rounded-lg ${isSubscribed ? 'bg-green-600' : 'bg-amber-600'}`}
            onPress={handleSubscribe}
            disabled={loadingSubscribe || isSubscribed}
          >
            {loadingSubscribe ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemeText className="font-semibold">
                {isSubscribed ? 'Subscribed' : (plan === 'monthly' ? 'Subscribe • Monthly' : 'Subscribe • Yearly')}
              </ThemeText>
            )}
          </ButtonView>
        </WrapperView>
      </LayoutView>

      {/* Subscription summary */}
      <LayoutView className="flex flex-row items-stretch justify-center gap-2">
        <ThemeBody className="themeBodyContainer">
          <WrapperView className='flex-row justify-start items-center flex-1 w-full gap-1'>
            <BanknoteArrowUp color={'#FF6060'} size={20} />
            <ThemeText className="text-xs font-semibold">Status</ThemeText>
          </WrapperView>
          <WrapperView className='flex-1 w-full items-center justify-center text-center'>
            <ThemeText className="cardlabel capitalize flex-1 items-center justify-center text-center w-full">
              {loadingSub ? '…' : (subStatus || '—')}
            </ThemeText>
          </WrapperView>
        </ThemeBody>

        <ThemeBody className="themeBodyContainer gap-3">
          <WrapperView className='flex-row justify-start items-center flex-1 w-full gap-1'>
            <CalendarClock color={'#FF6060'} size={20} />
            <ThemeText className="text-xs font-semibold">Expiration</ThemeText>
          </WrapperView>
          <WrapperView className='flex-1 items-center justify-center text-center'>
            <ThemeText className="cardlabel capitalize flex-1 items-center justify-center text-center w-full">
              {loadingSub ? '…' : expirationText}
            </ThemeText>
          </WrapperView>
        </ThemeBody>
      </LayoutView>

      {/* Plan Picker — HIDE when subscribed */}
      {!isSubscribed && (
        <LayoutView className="flex-row gap-2">
          <PlanCard value="monthly" title="Monthly Pro" subtitle="Renews every month" />
          <PlanCard value="yearly" title="Yearly Pro" subtitle="Best value, renews yearly" />
        </LayoutView>
      )}

      {/* Payment methods */}
      <LayoutView className="flex-1 items-stretch justify-center gap-2">
        <ThemeBody className="rounded-2xl gap-5 p-5">
          <WrapperView className="gap-2">
            <View className="grid gap-2">
              <ThemeText className="cardlabel">Payment Method</ThemeText>
              {pmList.length > 1 && (
                <WrapperView className="flex-row items-center bg-AscentViolet/30 p-2 rounded-lg border-2 border-AscentViolet">
                  <ThemeText className="text-xs font-semibold flex-1 text-gray-500">
                    You have {pmList.length - 1} more {pmList.length - 1 === 1 ? 'method' : 'methods'} saved.
                  </ThemeText>
                  <CircleAlert color={'#E0E0E0'} />
                </WrapperView>
              )}
            </View>
            <View className="line-section" />
          </WrapperView>

          {errorMsg ? <ThemeText className="text-[11px] color-red-400">{errorMsg}</ThemeText> : null}

          {loadingPMs ? (
            <WrapperView className="flex-row items-center gap-2">
              <ActivityIndicator size="small" />
              <ThemeText>Loading methods…</ThemeText>
            </WrapperView>
          ) : defaultPM ? (
            <WrapperView className="gap-2">
              <WrapperView className="gap-1 p-2 rounded-lg bg-gray-600/50">
                <WrapperView className="flex-row flex-1 items-center gap-2">
                  <BrandIcon brand={defaultPM.card_brand} size={22} />
                  <ThemeText className="cardlabel flex-1">
                    {defaultPM.type === 'card'
                      ? `${defaultPM.card_brand ?? 'Card'} •••• ${defaultPM.card_last4 ?? '????'}`
                      : defaultPM.type}
                    {defaultPM.wallet_provider ? ` (${defaultPM.wallet_provider})` : ''}
                  </ThemeText>
                  <WrapperView className="bg-RosePink/10 rounded-full">
                    {/* FIX: open delete modal with the selected payment method */}
                    <ButtonView onPress={() => openDelete(defaultPM)}>
                      <Trash size={18} color={'#FF6060'} />
                    </ButtonView>
                  </WrapperView>
                </WrapperView>
              </WrapperView>

              {pmList.slice(1).map((pm) => (
                <WrapperView key={pm.stripe_payment_method_id} className="p-2 rounded-lg bg-gray-700 flex-row items-center gap-2">
                  <BrandIcon brand={pm.card_brand} size={20} />
                  <ThemeText className="flex-1">
                    {pm.type === 'card' ? `${pm.card_brand ?? 'Card'} •••• ${pm.card_last4 ?? '????'}` : pm.type}
                    {pm.wallet_provider ? ` (${pm.wallet_provider})` : ''}
                  </ThemeText>
                  {!!pm.exp_month && !!pm.exp_year && (
                    <ThemeText className="text-xs text-gray-400">{formatExpiry(pm.exp_month, pm.exp_year)}</ThemeText>
                  )}
                  <WrapperView className="bg-RosePink/10 rounded-full">
                    {/* FIX: open delete modal with the selected payment method */}
                    <ButtonView onPress={() => openDelete(pm)}>
                      <Trash size={18} color={'#FF6060'} />
                    </ButtonView>
                  </WrapperView>
                </WrapperView>
              ))}
            </WrapperView>
          ) : (
            <WrapperView>
              <ThemeText>No Linked Wallet</ThemeText>
            </WrapperView>
          )}
        </ThemeBody>
      </LayoutView>

      <LayoutView className="flex lg:flex-row w-full items-stretch justify-start align-middle gap-2">
        <ButtonView className="simpleButton android:border-none android:w-full android:border-0" onPress={handleConnect} disabled={loadingConnect}>
          <WrapperView className="flex flex-row items-center gap-1">
            <Wallet size={16} color={'white'} />
            <Text className="font-semibold color-white">
              {loadingConnect ? 'Connecting…' : defaultPM ? 'Add Another Method' : 'Connect Payment Method'}
            </Text>
          </WrapperView>
        </ButtonView>
      </LayoutView>

      <DeletePMModal
        visible={deleteVisible}
        loading={deleting}
        pm={selectedPM}
        onClose={() => { setDeleteVisible(false); setSelectedPM(null); }}
        onConfirm={confirmDelete}
      />
    </ThemeCard>
  );
};

export default Bills;