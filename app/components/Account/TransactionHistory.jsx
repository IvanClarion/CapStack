import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { ArrowDownRight } from 'lucide-react-native';

import '../../../assets/stylesheet/global.css';
import LayoutView from '../../../components/layout/LayoutView';
import WrapperView from '../../../components/input/WrapperView';
import ThemeText from '../../../components/ui/ThemeText';
import ThemeBody from '../../../components/ui/ThemeBody';
import { supabase } from '../../../database/lib/supabase';

const FUNCTIONS_BASE = process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL;

function formatPesoFromMinor(minor, currency) {
  if (typeof minor !== 'number') return '—';
  const major = minor / 100;
  const prefix = (currency || '').toUpperCase() === 'PHP' ? '₱ ' : '';
  return `${prefix}${major.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return '—';
  }
}

const TransactionHistory = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      if (!FUNCTIONS_BASE) throw new Error('Missing EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL');

      const { data: sessionRes, error: sErr } = await supabase.auth.getSession();
      if (sErr) throw sErr;
      const token = sessionRes?.session?.access_token;
      if (!token) {
        setRows([]);
        return;
      }

      const res = await fetch(`${FUNCTIONS_BASE}/list-invoices`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const txt = await res.text();
      let payload = {};
      try { payload = JSON.parse(txt); } catch {}

      if (!res.ok) throw new Error(payload?.error || txt || 'Failed to load invoices.');

      setRows(Array.isArray(payload?.invoices) ? payload.invoices : []);
    } catch (e) {
      setErr(e?.message || 'Failed to load transactions.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <ScrollView className="transactionScroll" nestedScrollEnabled showsVerticalScrollIndicator>
      <ThemeBody className="transactionCard">
        {loading ? (
          <WrapperView className="flex-row items-center gap-2">
            <ActivityIndicator size="small" />
            <ThemeText>Loading transactions…</ThemeText>
          </WrapperView>
        ) : err ? (
          <WrapperView className="gap-2">
            <ThemeText className="text-[12px] text-red-400">{String(err)}</ThemeText>
          </WrapperView>
        ) : rows.length === 0 ? (
          <WrapperView className="gap-2">
            <ThemeText className="opacity-70">No transactions yet.</ThemeText>
          </WrapperView>
        ) : (
          <LayoutView className="gap-5">
            {rows.map((inv) => (
              <LayoutView key={inv.id} className="gap-2 flex-row items-center">
                <WrapperView className="transactionIcon">
                  <ArrowDownRight size={25} color={'#FF6060'} />
                </WrapperView>
                <WrapperView className="flex-1">
                  <ThemeText className="text-lg font-semibold">Subscription Fee</ThemeText>
                  <ThemeText className="text-[10px]">{formatDate(inv.created_at || inv.created)}</ThemeText>
                </WrapperView>
                <WrapperView className="transactionPrice">
                  <ThemeText className="font-bold text-sm color-RosePink">
                    {formatPesoFromMinor(inv.amount_paid, inv.currency)}
                  </ThemeText>
                </WrapperView>
              </LayoutView>
            ))}
          </LayoutView>
        )}
      </ThemeBody>
    </ScrollView>
  );
};

export default TransactionHistory;