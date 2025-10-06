const FUNCTIONS_BASE = process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL; // https://<ref>.functions.supabase.co

// Calls the Supabase Edge Function to delete a Stripe payment method
export async function deletePaymentMethod({ pmId, token }) {
  if (!FUNCTIONS_BASE) throw new Error('Missing EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL');
  if (!pmId) throw new Error('Missing payment method id');

  const res = await fetch(`${FUNCTIONS_BASE}/delete-payment-method`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ payment_method_id: pmId }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || 'Failed to delete payment method');
  }
  return payload;
}