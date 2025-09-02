import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

function parseHash(url) {
  // Get the part after '#'
  const hash = url.split('#')[1];
  if (!hash) return {};
  return hash.split('&').reduce((acc, kv) => {
    const [k, v] = kv.split('=');
    acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

export async function googleOAuth() {
  const redirectUrl = Linking.createURL('/Main');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
  if (error) {
    Alert.alert('Error', error.message);
    return null;
  }
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type === 'success' && result.url) {
      // Parse tokens from hash fragment
      const tokens = parseHash(result.url);
      const { access_token, refresh_token } = tokens;
      if (access_token && refresh_token) {
        // Set session for Supabase
        await supabase.auth.setSession({ access_token, refresh_token });
        return await supabase.auth.getUser();
      }
    }
    return null;
  }
}