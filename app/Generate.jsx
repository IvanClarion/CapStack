import React, { useEffect, useState, useRef, useCallback } from 'react';

import {
  View,
  ScrollView,
  Keyboard,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import '../assets/stylesheet/global.css';
import {
  ChevronRight, HatGlasses, Coins, ChevronDown, ChevronUp, PencilLine, Save, X
} from 'lucide-react-native';
import LayoutView from '../components/layout/LayoutView';
import ScrollViews from '../components/ui/ScrollView';
import WrapperView from '../components/input/WrapperView';
import ThemeBody from '../components/ui/ThemeBody';
import ThemeText from '../components/ui/ThemeText';
import ThemeCard from '../components/ui/ThemeCard';
import InputView from '../components/input/InputView';
import ButtonView from '../components/buttons/ButtonView';
import { recordUsedTokens } from '../database/main/tokens';
import { addConversationTokens } from '../database/main/conversationTokens';
import Gemini, { setDefaultTier } from '../database/model/geminiBasic';
import {
  safeParseStructuredJSON,
  validateStructuredPayload,
  coerceStructuredDefaults
} from '../database/util/jsonAI';
import { saveConversation } from '../database/main/savedConversation';
import { supabase } from '../database/lib/supabase';
import { exportStructuredToPdf } from '../database/util/pdf/exportStructuredToPdf';
import CardSkeleton from '../components/loader/CardSkeleton';
import SubscribeModal from './components/modal/SubscribeModal';

// NEW: inline banner for invalid/troll prompt
import PromptBanner from './components/modal/PromptBanner';

const COMMONER_FOLLOWUP_LIMIT = 3;

const Generate = () => {
  const route = useRoute();
  const qs = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const userSurveyResult = route?.params?.userSurveyResult;
  const paramConversationId = route?.params?.conversationId ?? qs?.conversationId ?? null;
  const paramStructuredPayload = route?.params?.structuredPayload ?? null;
  // optional share token passed in URL / params
  const paramShareToken = route?.params?.token ?? qs?.token ?? null;

  const [loading, setLoading] = useState(false);
  const [structuredRaw, setStructuredRaw] = useState('');
  const [structuredParsed, setStructuredParsed] = useState(null);
  const [structuredError, setStructuredError] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [modelUsed, setModelUsed] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tokensCount, setTokensCount] = useState(0);

  const [baseSurveyResult, setBaseSurveyResult] = useState(null);
  const [answersOpen, setAnswersOpen] = useState(false);

  // share token state (may be provided in link or present on the conversation row)
  const [shareToken, setShareToken] = useState(paramShareToken || null);

  // User's tier for model selection and gating features
  const [userTier, setUserTier] = useState(null); // null | 'commoner' | 'elite'
  const tierLoaded = userTier !== null;
  const isElite = userTier === 'elite';

  const [subscribeVisible, setSubscribeVisible] = useState(false);

  const responseRef = useRef(null);
  const abortRef = useRef({ cancelled: false });
  const autoSavedRef = useRef(false);

  // NEW: small banner state + auto-hide timer
  const [warn, setWarn] = useState({ visible: false, message: '' });
  const warnTimerRef = useRef(null);

  // Measure composer height for proper placement of the banner above it
  const [composerHeight, setComposerHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Rename title state
  const [editTitle, setEditTitle] = useState(false);
  const [pendingTitle, setPendingTitle] = useState('');
  const displayTitle = editTitle ? pendingTitle : (structuredParsed?.title || '');

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      const h = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(Math.max(0, h - (insets.bottom || 0)));
    };
    const onHide = () => setKeyboardHeight(0);

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow?.remove?.();
      subHide?.remove?.();
    };
  }, [insets.bottom]);

  const safeEstimateTokens = (s) => {
    const fn = Gemini?.estimateTokens;
    if (typeof fn === 'function') return fn(String(s ?? ''));
    return Math.ceil(String(s ?? '').length / 4);
  };

  useEffect(() => {
    if (userSurveyResult) setBaseSurveyResult(userSurveyResult);
  }, [userSurveyResult]);

  useEffect(() => {
    if (structuredParsed?.title) setPendingTitle(structuredParsed.title);
    else setPendingTitle('');
  }, [structuredParsed?.title]);

  // Load user's tier
  const loadTier = useCallback(async () => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes?.user?.id;
      if (!uid) {
        setUserTier('commoner');
        return;
      }
      const { data, error } = await supabase
        .from('stripe_subscriptions')
        .select('status,created_at')
        .eq('users_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const status = (data?.status || '').toLowerCase();
      setUserTier(status === 'active' ? 'elite' : 'commoner');
    } catch {
      setUserTier('commoner');
    }
  }, []);

  useEffect(() => {
    loadTier();
  }, [loadTier]);

  useEffect(() => {
    if (tierLoaded) setDefaultTier(userTier);
  }, [tierLoaded, userTier]);

  useEffect(() => {
    let mounted = true;

    async function loadByIdOrToken(id, token = null) {
      try {
        setLoading(true);
        setStructuredError(null);

        // Fetch current signed-in user id (may be null for public readers)
        const { data: sessionData } = await supabase.auth.getUser();
        const currentUid = sessionData?.user?.id ?? null;

        // If a share token is provided (in the link), call the secure RPC that will
        // return the conversation row if the token matches or the row is public or caller is owner.
        if (token) {
          try {
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('rpc_get_conversation_for_view', { p_id: id, p_share_token: token });

            if (rpcError) {
              // RPC failed or denied access
              setStructuredError('This conversation is not available.');
              console.warn(`[Generate] rpc_get_conversation_for_view denied for id=${id} token=${token}:`, rpcError);
              return;
            }

            // supabase.rpc may return array or single object depending on function; normalize
            const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
            if (!row) {
              setStructuredError('This conversation is not available.');
              return;
            }

            // populate UI state from returned row
            const normalized = coerceStructuredDefaults(row?.structured_payload || {});
            setStructuredParsed(normalized);
            setFollowUps(Array.isArray(row?.follow_ups) ? row.follow_ups : []);
            setModelUsed(row?.model_used || null);
            setTokensCount(Number(row?.tokens_count) || 0);
            setConversationId(id);
            setBaseSurveyResult(row?.survey_result || null);

            // if the returned row has a share_token, keep it so share links can include it
            if (row?.share_token) setShareToken(row.share_token);
            return;
          } catch (rpcErr) {
            console.warn('[Generate] rpc_get_conversation_for_view error:', rpcErr);
            setStructuredError('This conversation is not available.');
            return;
          } finally {
            setLoading(false);
          }
        }

        // No token provided -> normal owner-only access
        // Use maybeSingle() to avoid Supabase client error when RLS prevents reading the row.
        const { data, error } = await supabase
          .from('survey_conversations')
          .select('user_id, structured_payload, follow_ups, model_used, survey_result, tokens_count, follow_up_count, share_token')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          // If single() coercion error or other DB issue
          // Provide friendly message rather than throwing raw DB client error
          console.warn('[Generate] loadById maybeSingle error:', error);
          setStructuredError('This conversation is not available on your account.');
          return;
        }

        // If RLS blocked the row, data will be null
        if (!data) {
          setStructuredError('This conversation is not available on your account.');
          console.warn(`[Generate] cannot load conversation ${id} — not visible to current user (RLS)`);
          return;
        }

        // Deny if the conversation does not belong to the current user
        if (!currentUid || data?.user_id !== currentUid) {
          setStructuredError('This conversation is not available on your account.');
          console.warn(`[Generate] attempted to load conversation ${id} belonging to user ${data?.user_id} while current user is ${currentUid}`);
          return;
        }

        const normalized = coerceStructuredDefaults(data?.structured_payload || {});
        setStructuredParsed(normalized);
        setFollowUps(Array.isArray(data?.follow_ups) ? data.follow_ups : []);
        setModelUsed(data?.model_used || null);
        setTokensCount(Number(data?.tokens_count) || 0);
        setConversationId(id);
        setBaseSurveyResult(data?.survey_result || null);

        if (data?.share_token) setShareToken(data.share_token);
      } catch (e) {
        // Friendly handling for the specific Supabase single() coercion error and others
        if (e?.message?.includes('Cannot coerce the result to a single JSON object')) {
          setStructuredError('This conversation is not available on your account.');
        } else {
          setStructuredError(e?.message || 'Failed to load saved conversation.');
        }
        console.warn('[Generate] loadByIdOrToken error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (paramStructuredPayload) {
      try {
        const payload =
          typeof paramStructuredPayload === 'string'
            ? JSON.parse(paramStructuredPayload)
            : paramStructuredPayload;
        const normalized = coerceStructuredDefaults(payload);
        setStructuredParsed(normalized);
        setStructuredError(null);
        if (paramConversationId) setConversationId(String(paramConversationId));
      } catch {
        setStructuredError('Failed to parse saved conversation payload.');
      }
      return;
    }

    if (paramConversationId) {
      // pass along any token that might have been included in the URL
      loadByIdOrToken(String(paramConversationId), paramShareToken ?? null);
      return;
    }

    return () => {
      mounted = false;
    };
  }, [paramConversationId, paramStructuredPayload, paramShareToken]);

  // Auto initial generation (no per-day limit)
  const initialGeneratedRef = useRef(false);
  useEffect(() => {
    abortRef.current.cancelled = false;

    if (initialGeneratedRef.current) {
      return () => {
        abortRef.current.cancelled = true;
      };
    }

    if (tierLoaded && userSurveyResult && !paramConversationId && !paramStructuredPayload) {
      initialGeneratedRef.current = true;
      initialGenerate(); // no counting/limit
    }

    return () => {
      abortRef.current.cancelled = true;
    };
  }, [tierLoaded, userSurveyResult, paramConversationId, paramStructuredPayload, userTier]);

  async function initialGenerate() {
    await runStructuredGeneration({ addFollowUp: false, baseOverride: userSurveyResult });
  }

  async function ensureConversationId(payloadForSave) {
    try {
  // convIdAfterSave is the conversation id you just ensured
  const convIdAfterSave = await ensureConversationId(normalized);
  if (convIdAfterSave && !shareToken) {
    // fetch the db share_token (should exist due to default/backfill)
    const { data: convRow, error: convErr } = await supabase
      .from('survey_conversations')
      .select('share_token')
      .eq('id', convIdAfterSave)
      .maybeSingle();
    if (!convErr && convRow?.share_token) {
      setShareToken(convRow.share_token);
    } else {
      // If share_token missing, log so you can investigate — this should be rare after backfill
      console.warn('[Generate] share_token missing after save for', convIdAfterSave, convErr);
    }
  }
} catch (e) {
  console.warn('[Generate] failed to fetch share_token after save', e);
}
  }

  // helper: create share token server-side (owner-only RPC)
  // Replace your existing helper with this (detailed logging)
async function createShareTokenForConversation(convId) {
  try {
    // ensure we are signed in and are the owner
    const { data: sessionData } = await supabase.auth.getUser();
    const currentUid = sessionData?.user?.id || null;
    if (!currentUid) {
      console.warn('[createShareTokenForConversation] no signed-in user; skipping token creation');
      return null;
    }

    // fetch conversation owner and existing share_token
    const { data: convRow, error: convErr } = await supabase
      .from('survey_conversations')
      .select('user_id, share_token')
      .eq('id', convId)
      .maybeSingle();

    if (convErr) {
      console.warn('[createShareTokenForConversation] failed to fetch conversation', convErr);
      return null;
    }
    if (!convRow) {
      console.warn('[createShareTokenForConversation] conversation not found', convId);
      return null;
    }

    // if DB already has token, return it
    if (convRow.share_token) {
      console.log('[createShareTokenForConversation] token already present', convRow.share_token);
      return convRow.share_token;
    }

    // ensure current user is owner before calling RPC
    if (convRow.user_id !== currentUid) {
      console.warn('[createShareTokenForConversation] current user is not owner; cannot create token', { currentUid, owner: convRow.user_id });
      return null;
    }

    // call RPC to create token
    const { data: rpcData, error: rpcErr } = await supabase
      .rpc('rpc_create_share_token', { p_conversation_id: convId });

    // Log both success and error for debugging
    console.log('[createShareTokenForConversation] rpc result', { rpcData, rpcErr });

    if (rpcErr) {
      // rpcErr.message / rpcErr.details contain DB error text
      console.warn('[createShareTokenForConversation] rpcErr.message:', rpcErr.message);
      console.warn('[createShareTokenForConversation] rpcErr.details:', rpcErr.details);
      return null;
    }

    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    console.log('[createShareTokenForConversation] token created', row?.share_token);
    return row?.share_token || null;
  } catch (e) {
    console.warn('[createShareTokenForConversation] unexpected error', e);
    return null;
  }
}

  // ... rest of file unchanged until runStructuredGeneration ...
  async function runStructuredGeneration({ addFollowUp, baseOverride } = {}) {
    if (!tierLoaded) return;

    const base = baseOverride ?? baseSurveyResult ?? userSurveyResult;
    if (!base) return;

    let newFollowUps = followUps;

    if (addFollowUp && userInput.trim()) {
      // Enforce follow-up limit for commoner on the frontend
      if (userTier === 'commoner' && (Array.isArray(followUps) ? followUps.length : 0) >= COMMONER_FOLLOWUP_LIMIT) {
        showWarn(`Commoner users are limited to ${COMMONER_FOLLOWUP_LIMIT} follow-ups.`);
        return;
      }

      newFollowUps = [...followUps, userInput.trim()];
      setFollowUps(newFollowUps);
    }

    setLoading(true);
    setStructuredError(null);
    setStructuredParsed(null);
    setStructuredRaw('');

    try {
      const promptString = Gemini.buildStructuredSurveyJSONPrompt(base, newFollowUps);
      const estIn = safeEstimateTokens(promptString);

      const res = await Gemini.generateStructuredSurveyJSON(base, newFollowUps, {
        tier: userTier,
      });

      if (abortRef.current.cancelled) return;
      setModelUsed(res.modelUsed || null);

      const raw = res.text || '';
      setStructuredRaw(raw);

      const estOut = safeEstimateTokens(raw);
      const tokensThisRun = Math.max(0, estIn + estOut);

      setTokensCount((prev) => (Number(prev) || 0) + tokensThisRun);

      try {
        await recordUsedTokens(tokensThisRun);
      } catch (err) {
        console.warn('[Generate] recordUsedTokens failed:', err?.message || err);
      }

      const parsed = safeParseStructuredJSON(raw);
      if (!parsed.ok) {
        setStructuredError(`Parse error: ${parsed.error}`);
        return;
      }

      const validationErr = validateStructuredPayload(parsed.data);
      if (validationErr) {
        setStructuredError(`Validation error: ${validationErr}`);
        return;
      }

      // Normalize (no client-side limiting of projectIdeas)
      const normalized = coerceStructuredDefaults(parsed.data);

      setStructuredParsed(normalized);

      try {
        const convId = await ensureConversationId(normalized);
        if (convId) {
          const note = addFollowUp ? 'follow-up generation' : 'initial generation';
          await addConversationTokens(convId, tokensThisRun, note);

          try {
            const { data, error } = await supabase
              .from('survey_conversations')
              .select('tokens_count')
              .eq('id', convId)
              .single();
            if (!error && data) {
              setTokensCount(Number(data.tokens_count) || 0);
            }
          } catch {}
        } else {
          console.warn('[Generate] Could not obtain conversation id; skipping ledger append.');
        }
      } catch (e) {
        console.warn('[conversation tokens] append failed:', e?.message || e);
      }

      if (addFollowUp || conversationId) {
        await handleSaveConversation({ silent: true, payloadOverride: normalized });

        // AFTER save: attempt to auto-create share token for owner (non-fatal)
        try {
          const convIdAfterSave = await ensureConversationId(normalized);
          if (convIdAfterSave && !shareToken) {
            const token = await createShareTokenForConversation(convIdAfterSave);
            if (token) setShareToken(token);
          }
        } catch (tokErr) {
          console.warn('[runStructuredGeneration] create share token failed', tokErr);
        }
      }
    } catch (e) {
      if (!abortRef.current.cancelled) {
        setStructuredError(e?.message || 'Unknown error generating structured JSON.');
      }
    } finally {
      if (!abortRef.current.cancelled) {
        setLoading(false);
        setUserInput('');
      }
    }
  }

  // Replaces the existing handleShareCurrent in Generate.jsx
  async function handleShareCurrent() {
    // inside handleShareCurrent after verifying convRow and owner:
if (!shareToken) {
  if (convRow?.share_token) {
    setShareToken(convRow.share_token);
  } else {
    Alert.alert('Share', 'Unable to create share link. Please try again later.');
    return;
  }
}
    try {
      let id = conversationId;
      if (!id) {
        const savedId = await handleSaveConversation({ silent: true });
        id = savedId || conversationId;
      }
      if (!id) {
        Alert.alert('Share', 'Please try again after the conversation is saved.');
        return;
      }

      // Ensure user is signed in
      const { data: sessionData, error: sessionErr } = await supabase.auth.getUser();
      if (sessionErr) {
        console.warn('[handleShareCurrent] getUser error', sessionErr);
      }
      const currentUid = sessionData?.user?.id;
      if (!currentUid) {
        Alert.alert('Share', 'You must be signed in to create a share link.');
        return;
      }

      // Quick owner check: fetch conversation owner to ensure caller is owner before calling RPC.
      const { data: convRow, error: convErr } = await supabase
        .from('survey_conversations')
        .select('user_id, share_token')
        .eq('id', id)
        .maybeSingle();

      if (convErr) {
        console.warn('[handleShareCurrent] failed to fetch conversation owner', convErr);
        Alert.alert('Share', 'Failed to prepare share link.');
        return;
      }
      if (!convRow) {
        Alert.alert('Share', 'Conversation not found.');
        return;
      }

      if (convRow.user_id !== currentUid) {
        // Not the owner — do not attempt to create a token
        Alert.alert('Share', 'Only the conversation owner can create a share link.');
        return;
      }

      // If a token already exists use it; otherwise create server-side (owner-only RPC)
      if (!convRow.share_token && !shareToken) {
        // Call the RPC with the exact parameter name expected by the function
        const { data: rpcData, error: rpcErr } = await supabase
          .rpc('rpc_create_share_token', { p_conversation_id: id });

        if (rpcErr) {
          // Log full error object for debugging (inspect rpcErr.message and rpcErr.details)
          console.warn('[handleShareCurrent] rpc_create_share_token error', rpcErr);
          if (rpcErr?.message?.toLowerCase().includes('forbidden')) {
            Alert.alert('Share', 'Only the owner can create a share link.');
          } else {
            Alert.alert('Share', rpcErr.message || 'Failed to create share link.');
          }
          return;
        }

        const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
        const token = row?.share_token;
        if (!token) {
          console.warn('[handleShareCurrent] rpc returned no token', rpcData);
          Alert.alert('Share', 'Failed to create share link (no token returned).');
          return;
        }
        setShareToken(token);
      } else if (!shareToken && convRow.share_token) {
        // Use existing DB token if present
        setShareToken(convRow.share_token);
      }

      // Build and share the URL (buildShareUrl reads shareToken from state)
      const url = buildShareUrl(id);
      const title = structuredParsed?.title || 'CapStack AI Conversation';
      const text = structuredParsed?.summary
        ? `${structuredParsed.summary.slice(0, 160)}${structuredParsed.summary.length > 160 ? '…' : ''}`
        : '';

      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await Share.share({
          title,
          message: text ? `${title}\n\n${text}\n\n${url}` : `${title}\n\n${url}`,
          url,
        });
      }
    } catch (e) {
      console.error('[handleShareCurrent] unexpected error', e);
      Alert.alert('Share', 'Unexpected error creating share link.');
    }
  }

  // -------------------- Moderation / Relevance Check --------------------
  const STOPWORDS = new Set([
    'the','a','an','and','or','but','to','of','for','with','on','in','by','at','as','is','are','was','were','be','been','being','that','this','these','those','it','its','from','into','over','under','about','than','then','so','if','not','no','yes','do','does','did','can','could','should','would','will','just','only','hello','hi','how','you','meet','nice'
  ]);

  const normalizeToken = (t) => {
    let x = String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!x) return '';
    if (x.length > 3 && x.endsWith('s')) x = x.slice(0, -1);
    return x;
  };

  const toTokens = (s) =>
    String(s || '')
      .toLowerCase()
      .split(/\s+/)
      .map(normalizeToken)
      .filter((x) => x && !STOPWORDS.has(x));

  const jaccard = (a, b) => {
    const A = new Set(a);
    const B = new Set(b);
    const inter = [...A].filter((x) => B.has(x)).length;
    const union = new Set([...a, ...b]).size || 1;
    return inter / union;
  };

  const PROFANITY = [
    'fuck','shit','bitch','asshole','dick','piss','cunt','bastard'
  ];

  const ALLOW_ACTIONS = new Set([
    'change','improve','refine','expand','rewrite','edit','polish','fix','update','shorten','lengthen','elaborate','clarify','enhance','revise','regenerate','add','remove','give'
  ]);
  const ALLOW_SECTIONS = new Set([
    'risk','summary','theme','project','idea','reference','table','overview','title','goal','impact','step'
  ]);

  const buildContextTokens = (base, structured) => {
    const arr = [];
    if (base?.openEndedAnswer) arr.push(...toTokens(base.openEndedAnswer));
    (base?.chosenQuestions || []).forEach((q) => {
      arr.push(...toTokens(q?.question));
      arr.push(...toTokens(q?.description));
      arr.push(...toTokens(q?.surveyTitle));
    });
    if (structured) {
      arr.push(...toTokens(structured.title));
      arr.push(...toTokens(structured.summary));
      (structured.themes || []).forEach((t) => {
        arr.push(...toTokens(t?.name));
        arr.push(...toTokens(t?.explanation));
      });
      (structured.projectIdeas || []).forEach((p) => {
        arr.push(...toTokens(p?.name));
        arr.push(...toTokens(p?.goal));
        arr.push(...toTokens(p?.potentialImpact));
        (p?.nextSteps || []).forEach((ns) => arr.push(...toTokens(ns)));
      });
      (structured.references || []).forEach((r) => {
        arr.push(...toTokens(r?.source));
        arr.push(...toTokens(r?.type));
      });
      (structured.risks || []).forEach((r) => arr.push(...toTokens(r)));
      if (structured.visualTable) {
        const vt = structured.visualTable;
        (vt.columns || []).forEach((c) => arr.push(...toTokens(c)));
        (vt.rows || []).forEach((row) =>
          row.forEach((cell) => arr.push(...toTokens(cell)))
        );
      }
    }
    return arr;
  };

  const classifyPrompt = (text, base) => {
    const raw = String(text || '').trim();
    const inputTokens = toTokens(raw);
    if (inputTokens.length === 0) {
      return { ok: false, code: 'empty', message: 'Prompt is invalid.' };
    }
    if (/(.)\1{6,}/.test(raw)) {
      return { ok: false, code: 'spam', message: 'Prompt looks spammy (repeated characters).' };
    }
    const lower = raw.toLowerCase();
    if (PROFANITY.some((w) => lower.includes(w))) {
      return { ok: false, code: 'profanity', message: 'Inappropriate language detected.' };
    }
    if (inputTokens.length === 1) {
      return { ok: true };
    }
    const hasAction = inputTokens.some((t) => ALLOW_ACTIONS.has(t));
    const hasSection = inputTokens.some((t) => ALLOW_SECTIONS.has(t));
    if (hasAction && hasSection) return { ok: true };

    const ctxTokens = buildContextTokens(base, structuredParsed);
    if (!ctxTokens.length) return { ok: true };

    const sim = jaccard(inputTokens, ctxTokens);
    if (sim < 0.02) {
      return { ok: false, code: 'unrelated', message: 'Prompt seems unrelated to your survey/output context.' };
    }
    return { ok: true };
  };

  const showWarn = (message) => {
    setWarn({ visible: true, message });
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    warnTimerRef.current = setTimeout(() => setWarn({ visible: false, message: '' }), 3500);
  };
  // ---------------------------------------------------------------------

  async function runStructuredGeneration({ addFollowUp, baseOverride } = {}) {
    if (!tierLoaded) return;

    const base = baseOverride ?? baseSurveyResult ?? userSurveyResult;
    if (!base) return;

    let newFollowUps = followUps;

    if (addFollowUp && userInput.trim()) {
      // Enforce follow-up limit for commoner on the frontend
      if (userTier === 'commoner' && (Array.isArray(followUps) ? followUps.length : 0) >= COMMONER_FOLLOWUP_LIMIT) {
        showWarn(`Commoner users are limited to ${COMMONER_FOLLOWUP_LIMIT} follow-ups.`);
        return;
      }

      newFollowUps = [...followUps, userInput.trim()];
      setFollowUps(newFollowUps);
    }

    setLoading(true);
    setStructuredError(null);
    setStructuredParsed(null);
    setStructuredRaw('');

    try {
      const promptString = Gemini.buildStructuredSurveyJSONPrompt(base, newFollowUps);
      const estIn = safeEstimateTokens(promptString);

      const res = await Gemini.generateStructuredSurveyJSON(base, newFollowUps, {
        tier: userTier,
      });

      if (abortRef.current.cancelled) return;
      setModelUsed(res.modelUsed || null);

      const raw = res.text || '';
      setStructuredRaw(raw);

      const estOut = safeEstimateTokens(raw);
      const tokensThisRun = Math.max(0, estIn + estOut);

      setTokensCount((prev) => (Number(prev) || 0) + tokensThisRun);

      try {
        await recordUsedTokens(tokensThisRun);
      } catch (err) {
        console.warn('[Generate] recordUsedTokens failed:', err?.message || err);
      }

      const parsed = safeParseStructuredJSON(raw);
      if (!parsed.ok) {
        setStructuredError(`Parse error: ${parsed.error}`);
        return;
      }

      const validationErr = validateStructuredPayload(parsed.data);
      if (validationErr) {
        setStructuredError(`Validation error: ${validationErr}`);
        return;
      }

      // Normalize (no client-side limiting of projectIdeas)
      const normalized = coerceStructuredDefaults(parsed.data);

      setStructuredParsed(normalized);

      try {
        const convId = await ensureConversationId(normalized);
        if (convId) {
          const note = addFollowUp ? 'follow-up generation' : 'initial generation';
          await addConversationTokens(convId, tokensThisRun, note);

          try {
            const { data, error } = await supabase
              .from('survey_conversations')
              .select('tokens_count')
              .eq('id', convId)
              .single();
            if (!error && data) {
              setTokensCount(Number(data.tokens_count) || 0);
            }
          } catch {}
        } else {
          console.warn('[Generate] Could not obtain conversation id; skipping ledger append.');
        }
      } catch (e) {
        console.warn('[conversation tokens] append failed:', e?.message || e);
      }

      if (addFollowUp || conversationId) {
        await handleSaveConversation({ silent: true, payloadOverride: normalized });
      }
    } catch (e) {
      if (!abortRef.current.cancelled) {
        setStructuredError(e?.message || 'Unknown error generating structured JSON.');
      }
    } finally {
      if (!abortRef.current.cancelled) {
        setLoading(false);
        setUserInput('');
      }
    }
  }

  async function handleSendFollowUp() {
    const base = baseSurveyResult ?? userSurveyResult ?? null;

    // Enforce follow-up limit for commoner at UI level
    if (userTier === 'commoner' && (Array.isArray(followUps) ? followUps.length : 0) >= COMMONER_FOLLOWUP_LIMIT) {
      showWarn(`Commoner users are limited to ${COMMONER_FOLLOWUP_LIMIT} follow-ups.`);
      return;
    }

    const verdict = classifyPrompt(userInput, base);
    if (!verdict.ok) {
      showWarn(verdict.message || 'Prompt rejected.');
      return;
    }
    if (!userInput.trim()) return;
    await runStructuredGeneration({ addFollowUp: true });
  }

  async function getUserId() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('[getUserId] auth error:', error);
      return null;
    }
    return data?.user?.id || null;
  }

  async function handleSaveConversation({ silent = false, payloadOverride = null } = {}) {
    const payload = payloadOverride ?? structuredParsed;

    if (!payload) {
      if (!silent) Alert.alert('Save', 'Nothing to save yet.');
      return null;
    }
    if (!baseSurveyResult && !conversationId) {
      if (!silent) Alert.alert('Save', 'Open a survey result to save a new conversation.');
      return null;
    }

    try {
      setSaving(true);
      const userId = await getUserId();
      if (!userId) {
        if (!silent) Alert.alert('Save Error', 'User not authenticated.');
        return null;
      }

      const params = {
        userId,
        surveyResult: baseSurveyResult || userSurveyResult || null,
        structuredPayload: payload,
        followUps,
        modelUsed,
        messages: null,
        appendFollowUps: false,
        tokensCount: Number(tokensCount) || 0
      };

      if (conversationId) params.id = conversationId;

      const { data, error } = await saveConversation(params);
      if (error) {
        if (!silent) Alert.alert('Save Error', error.message || 'Failed to save conversation.');
        return null;
      }

      let idToUse = conversationId;
      if (!conversationId && data?.id) {
        setConversationId(data.id);
        idToUse = data.id;
      }

      if (!silent) {
        Alert.alert('Saved', conversationId ? 'Conversation updated.' : 'Conversation created.');
      }
      return idToUse || null;
    } catch (e) {
      if (!silent) Alert.alert('Save Error', e?.message || 'Unexpected error saving conversation.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const shouldAutoSave =
      !!userSurveyResult &&
      !paramConversationId &&
      !paramStructuredPayload &&
      !!structuredParsed &&
      !loading &&
      !autoSavedRef.current;
    if (shouldAutoSave) {
      autoSavedRef.current = true;
      handleSaveConversation({ silent: true });
    }
  }, [structuredParsed, loading, userSurveyResult, paramConversationId, paramStructuredPayload]);

  function buildShareUrl(id) {
  // include shareToken if available
  const tokenPart = shareToken ? `&token=${shareToken}` : '';
  const path = `/Generate?conversationId=${id}${tokenPart}`;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  try {
    return ExpoLinking.createURL(path);
  } catch {
    const BASE = process.env.EXPO_PUBLIC_APP_BASE_URL;
    return BASE ? `${BASE}${path}` : path;
  }
}

  // Replaces the existing handleShareCurrent in Generate.jsx
async function handleShareCurrent() {
  try {
    let id = conversationId;
    if (!id) {
      const savedId = await handleSaveConversation({ silent: true });
      id = savedId || conversationId;
    }
    if (!id) {
      Alert.alert('Share', 'Please try again after the conversation is saved.');
      return;
    }

    // Ensure user is signed in
    const { data: sessionData, error: sessionErr } = await supabase.auth.getUser();
    if (sessionErr) {
      console.warn('[handleShareCurrent] getUser error', sessionErr);
    }
    const currentUid = sessionData?.user?.id;
    if (!currentUid) {
      Alert.alert('Share', 'You must be signed in to create a share link.');
      return;
    }

    // Quick owner check: fetch conversation owner to ensure caller is owner before calling RPC.
    const { data: convRow, error: convErr } = await supabase
      .from('survey_conversations')
      .select('user_id, share_token')
      .eq('id', id)
      .maybeSingle();

    if (convErr) {
      console.warn('[handleShareCurrent] failed to fetch conversation owner', convErr);
      Alert.alert('Share', 'Failed to prepare share link.');
      return;
    }
    if (!convRow) {
      Alert.alert('Share', 'Conversation not found.');
      return;
    }

    if (convRow.user_id !== currentUid) {
      // Not the owner — do not attempt to create a token
      Alert.alert('Share', 'Only the conversation owner can create a share link.');
      return;
    }

    // If a token already exists use it; otherwise create server-side (owner-only RPC)
    if (!convRow.share_token && !shareToken) {
      // Call the RPC with the exact parameter name expected by the function
      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('rpc_create_share_token', { p_conversation_id: id });

      if (rpcErr) {
        // Log full error object for debugging (inspect rpcErr.message and rpcErr.details)
        console.warn('[handleShareCurrent] rpc_create_share_token error', rpcErr);
        if (rpcErr?.message?.toLowerCase().includes('forbidden')) {
          Alert.alert('Share', 'Only the owner can create a share link.');
        } else {
          Alert.alert('Share', rpcErr.message || 'Failed to create share link.');
        }
        return;
      }

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      const token = row?.share_token;
      if (!token) {
        console.warn('[handleShareCurrent] rpc returned no token', rpcData);
        Alert.alert('Share', 'Failed to create share link (no token returned).');
        return;
      }
      setShareToken(token);
    } else if (!shareToken && convRow.share_token) {
      // Use existing DB token if present
      setShareToken(convRow.share_token);
    }

    // Build and share the URL (buildShareUrl reads shareToken from state)
    const url = buildShareUrl(id);
    const title = structuredParsed?.title || 'CapStack AI Conversation';
    const text = structuredParsed?.summary
      ? `${structuredParsed.summary.slice(0, 160)}${structuredParsed.summary.length > 160 ? '…' : ''}`
      : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, text, url });
    } else {
      await Share.share({
        title,
        message: text ? `${title}\n\n${text}\n\n${url}` : `${title}\n\n${url}`,
        url,
      });
    }
  } catch (e) {
    console.error('[handleShareCurrent] unexpected error', e);
    Alert.alert('Share', 'Unexpected error creating share link.');
  }
}
// debug helper - paste in Generate.jsx temporarily
async function createShareTokenDebug(conversationId) {
  try {
    console.log('[share] creating token for', conversationId);
    const res = await supabase.rpc('rpc_create_share_token', { p_conversation_id: conversationId });
    console.log('[share] rpc response', res);
    return res;
  } catch (err) {
    // should not normally throw — supabase-js returns { data, error }
    console.error('[share] rpc threw', err);
    throw err;
  }
}
// create/rotate share token (owner only)
// Replace existing helper with this version
async function createShareTokenForConversation(convId) {
  try {
    // ensure we are signed in and are the owner
    const { data: sessionData } = await supabase.auth.getUser();
    const currentUid = sessionData?.user?.id || null;
    if (!currentUid) {
      console.warn('[createShareTokenForConversation] no signed-in user; skipping token creation');
      return null;
    }

    // fetch conversation owner and existing share_token
    const { data: convRow, error: convErr } = await supabase
      .from('survey_conversations')
      .select('user_id, share_token')
      .eq('id', convId)
      .maybeSingle();

    if (convErr) {
      console.warn('[createShareTokenForConversation] failed to fetch conversation', convErr);
      return null;
    }
    if (!convRow) {
      console.warn('[createShareTokenForConversation] conversation not found', convId);
      return null;
    }

    // if DB already has token, return it
    if (convRow.share_token) {
      return convRow.share_token;
    }

    // ensure current user is owner before calling RPC
    if (convRow.user_id !== currentUid) {
      console.warn('[createShareTokenForConversation] current user is not owner; cannot create token', { currentUid, owner: convRow.user_id });
      return null;
    }

    // call RPC to create token
    const { data: rpcData, error: rpcErr } = await supabase
      .rpc('rpc_create_share_token', { p_conversation_id: convId });

    // Log both success and error for debugging
    console.log('[createShareTokenForConversation] rpc result', { rpcData, rpcErr });

    if (rpcErr) {
      // rpcErr.message / rpcErr.details contain DB error text (e.g. forbidden)
      return null;
    }

    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    return row?.share_token || null;
  } catch (e) {
    console.warn('[createShareTokenForConversation] unexpected error', e);
    return null;
  }
}
  const handleConvertPress = useCallback(() => {
    if (isElite) {
      handleExportPdf();
    } else {
      setSubscribeVisible(true);
    }
  }, [isElite, structuredParsed, conversationId]);

  const handleGoSubscribe = useCallback(() => {
    try {
      const url = ExpoLinking.createURL('Account');
      Linking.openURL(url);
    } catch {}
    setSubscribeVisible(false);
  }, []);

  function renderHeaderSummary() {
    if (baseSurveyResult) {
      const { needReferences, openEndedAnswer, chosenQuestions } = baseSurveyResult;
      const formattedQuestions = (chosenQuestions || [])
        .map((q, i) => `${i + 1}. ${q.question}${q.description ? `\n   ${q.description}` : ''}`)
        .join('\n\n');

      return (
        <WrapperView >
          <ThemeCard className=' rounded-2xl bg-black/60'>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAnswersOpen((v) => !v)}
              className='flex-row items-center justify-between p-4'
            >
              <ThemeText className='font-semibold text-base'>Survey Answers</ThemeText>
              <WrapperView className='bg-secondaryCard rounded-lg p-2'>
                {answersOpen ? <ChevronUp color='white' /> : <ChevronDown color='white' />}
              </WrapperView>
            </TouchableOpacity>

            {answersOpen && (
              <WrapperView className='px-4 pb-4'>
                <ThemeText className='systemContainer whitespace-pre-wrap'>
{`Need References: ${needReferences ? 'Yes' : 'No'}
Additional Info: ${openEndedAnswer || '(none)'}
Selected Questions:
${formattedQuestions || 'None'}`}
                </ThemeText>

                {!!followUps.length && (
                  <ThemeText className='mt-3 text-xs text-gray-400'>
                    Follow-Ups Applied:
                    {'\n'}
                    {followUps.map((f, i) => `#${i + 1}: ${f}`).join('\n')}
                  </ThemeText>
                )}
              </WrapperView>
            )}
          </ThemeCard>

          <LayoutView className='flex-1 flex-row gap-2 p-5'>
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <ThemeCard className='flex-1 justify-center items-center'>
                  <HatGlasses color={'#FF6060'} />
                  <ThemeText className='font-semibold text-lg text-gray-500'>
                    Model used
                  </ThemeText>
                  <ThemeText className='text-[10px]'>
                    {modelUsed || (isElite ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite')}
                  </ThemeText>
                </ThemeCard>

                <ThemeCard className='flex-1 justify-center items-center'>
                  <Coins color={'#FF6060'} />
                  <ThemeText className='font-semibold text-lg text-gray-500'>
                    Tokens (est):
                  </ThemeText>
                  <ThemeText className='text-[10px]'>{Number(tokensCount) || 0}</ThemeText>
                </ThemeCard>
              </>
            )}
          </LayoutView>
        </WrapperView>
      );
    }

    if (conversationId) {
      return (
        <WrapperView className='mb-6'>
          <ThemeText className='systemContainer'>
            Loaded from archive
          </ThemeText>
          <ThemeText className='mt-1 text-[10px] text-gray-500'>
            Tokens (est): {Number(tokensCount) || 0}
          </ThemeText>
          <ThemeText className='mt-1 text-[10px] text-gray-500'>
            Conversation ID: {conversationId}
          </ThemeText>
        </WrapperView>
      );
    }

    return null;
  }

  function renderVisualTable() {
    const vt = structuredParsed?.visualTable;
    if (!vt || !Array.isArray(vt.columns) || !vt.columns.length) return null;

    return (
      <WrapperView className=''>
        <ThemeText className='font-semibold mb-2'>Overview Table</ThemeText>
        <WrapperView className='rounded-2xl overflow-hidden border-2 border-gray-500'>
          <LayoutView className='flex-row rounded-lg'>
            {vt.columns.map((col, idx) => (
              <WrapperView key={`h-${idx}`} className='flex-1 border border-gray-600/50 p-2 bg-gray-600/50'>
                <ThemeText className='font-semibold' numberOfLines={2}>
                  {col}
                </ThemeText>
              </WrapperView>
            ))}
          </LayoutView>
          {(vt.rows || []).map((row, rIdx) => (
            <LayoutView key={`r-${rIdx}`} className='flex-row border border-gray-500'>
              {vt.columns.map((_, cIdx) => (
                <WrapperView key={`c-${rIdx}-${cIdx}`} className='flex-1 p-2'>
                  <ThemeText numberOfLines={4}>{row?.[cIdx] ?? ''}</ThemeText>
                </WrapperView>
              ))}
            </LayoutView>
          ))}
        </WrapperView>
      </WrapperView>
    );
  }

  function renderResearchQuestions() {
    const rq = structuredParsed?.researchQuestions;
    if (!Array.isArray(rq) || rq.length === 0) return null;
    return (
      <WrapperView>
        <ThemeText className='font-semibold mb-2'>Possible Research Questions</ThemeText>
        {rq.map((q, idx) => (
          <ThemeText key={idx} className='botContainer mb-1'>
            • {q}
          </ThemeText>
        ))}
      </WrapperView>
    );
  }

  function renderReferences() {
    const refs = structuredParsed?.references;
    if (!Array.isArray(refs) || refs.length === 0) return null;

    const openRef = async (url) => {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else Alert.alert('Cannot open link', url);
      } catch (e) {
        Alert.alert('Link error', e?.message || 'Failed to open link');
      }
    };

    return (
      <WrapperView>
        <ThemeText className='font-semibold mb-2'>References</ThemeText>

        {refs.map((r, i) => {
          const prefix = r?.type ? `[${r.type}] ` : '';
          const label = `${prefix}${r?.source || '(untitled source)'}`;
          if (r?.url) {
            return (
              <TouchableOpacity key={i} onPress={() => openRef(r.url)} activeOpacity={0.7} className=''>
                <ThemeText className='botContainer mb-1 text-blue-400 underline'>
                  {label}
                </ThemeText>
              </TouchableOpacity>
            );
          }

          return (
            <ThemeText key={i} className='botContainer mb-1'>
              {label}
            </ThemeText>
          );
        })}
      </WrapperView>
    );
  }

  function renderRisks() {
    const risks = structuredParsed?.risks;
    if (!Array.isArray(risks) || risks.length === 0) return null;

    return (
      <WrapperView>
        <ThemeText className='font-semibold mb-2'>Key Risks</ThemeText>
        {risks.map((r, idx) => (
          <ThemeText key={idx} className='botContainer mb-1'>
            • {r}
          </ThemeText>
        ))}
      </WrapperView>
    );
  }

  async function handleExportPdf() {
    try {
      if (!structuredParsed) {
        Alert.alert('Export', 'Nothing to export yet.');
        return;
      }
      let shareUrl = null;
      if (conversationId) {
        shareUrl = buildShareUrl(conversationId);
      }
      await exportStructuredToPdf({
        structured: structuredParsed,
        fileName: structuredParsed?.title || 'CapStack_AI',
        meta: {
          logoUrl: 'https://dncutrqrtvmhnyeghesf.supabase.co/storage/v1/object/public/logo/logo/capstacklogo-black.png',
          shareUrl
        }
      });
    } catch (e) {
      Alert.alert('Export Error', e?.message || 'Failed to create PDF.');
    }
  }

  async function handleSaveTitle() {
    const newTitle = (pendingTitle || '').trim();
    if (!newTitle) {
      Alert.alert('Rename', 'Title cannot be empty.');
      return;
    }
    try {
      const updated = { ...structuredParsed, title: newTitle };
      setStructuredParsed(updated);
      await handleSaveConversation({ silent: true, payloadOverride: updated });
      setEditTitle(false);
      // AFTER handleSaveConversation({ ... }) in runStructuredGeneration
try {
  const convIdAfterSave = await ensureConversationId(normalized);
  if (convIdAfterSave && !shareToken) {
    const token = await createShareTokenForConversation(convIdAfterSave);
    if (token) {
      console.log('[runStructuredGeneration] created share token', token);
      setShareToken(token);
    } else {
      console.warn('[runStructuredGeneration] no token created (owner check failed or RPC error)');
      // Optionally fetch DB row to show existing token if any
      const { data: convRow2, error: convErr2 } = await supabase
        .from('survey_conversations')
        .select('share_token')
        .eq('id', convIdAfterSave)
        .maybeSingle();
      if (!convErr2 && convRow2?.share_token) {
        setShareToken(convRow2.share_token);
      }
    }
  }
} catch (tokErr) {
  console.warn('[runStructuredGeneration] create share token failed', tokErr);
}
    } catch (e) {
      Alert.alert('Rename Error', e?.message || 'Failed to rename.');
    }
  }

  return (
    <ThemeBody className=' relative flex-1 overflow-hidden w-full max-w-full rounded-none h-full'>
      <WrapperView className='flex-row gap-1 py-2 px-2 lg:px-10 items-center justify-between'>
        {editTitle ? (
          <WrapperView className="flex-1 flex-row items-center gap-2">
            <InputView
              className="flex-1 px-2 rounded-lg  text-white"
              value={pendingTitle}
              onChangeText={setPendingTitle}
              autoFocus
              placeholder="Enter title"
              maxLength={80}
            />
            <TouchableOpacity
              className="bg-AscentViolet p-2 rounded-lg"
              onPress={handleSaveTitle}
            >
              <Save color={'white'} size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-700 p-2 rounded-lg"
              onPress={() => setEditTitle(false)}
            >
              <X color={'white'} size={18} />
            </TouchableOpacity>
          </WrapperView>
        ) : (
          <WrapperView className="flex-1 flex-row items-center gap-2">
            <ThemeText className='flex-1 uppercase cardlabel'>
              {displayTitle ? displayTitle : 'CapStack AI'}
            </ThemeText>
            <TouchableOpacity className='bg-AscentViolet p-2 rounded-lg' onPress={() => setEditTitle(true)}>
              <PencilLine color={'white'} size={18} />
            </TouchableOpacity>
          </WrapperView>
        )}
      </WrapperView>

      <LayoutView className='px-3 flex-1'>
        <ScrollViews
          className='gap-4'
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentContainerStyle={{ paddingBottom: 160 + keyboardHeight + (insets.bottom || 0) }}
        >
          {renderHeaderSummary()}
          {loading && (
            <View className='flex-row items-center gap-2'>
              <ActivityIndicator size='small' />
              <ThemeText>Generating structured data...</ThemeText>
            </View>
          )}
          {structuredError && (
            <WrapperView>
              <ThemeText className='deleteButton p-3 rounded-lg'>{structuredError}</ThemeText>
              {structuredRaw ? (
                <ThemeText className='botContainer mt-2'>
                  Raw (unparsed/invalid snippet):
                  {'\n'}
                  {structuredRaw.slice(0, 1600)}
                  {structuredRaw.length > 1600 ? '…' : ''}
                </ThemeText>
              ) : null}
            </WrapperView>
          )}
          {!structuredError && structuredParsed && (
            <WrapperView ref={responseRef} className='gap-5'>
              <ThemeText className='cardHeader'>{displayTitle || structuredParsed.title}</ThemeText>
              <ThemeText className='botContainer'>{structuredParsed.summary}</ThemeText>

              {!!structuredParsed.themes?.length && (
                <WrapperView>
                  <ThemeText className='font-semibold mb-2'>Themes</ThemeText>
                  {structuredParsed.themes.map((t, i) => (
                    <ThemeText key={i} className='botContainer mb-1'>
                      {t.name}: {t.explanation}
                    </ThemeText>
                  ))}
                </WrapperView>
              )}

              {!!structuredParsed.projectIdeas?.length && (
                <WrapperView>
                  <ThemeText className='font-semibold mb-2'>Project Ideas</ThemeText>
                  {structuredParsed.projectIdeas.map((p, i) => (
                    <WrapperView key={i} className='botContainer mb-2'>
                      <ThemeText className='font-semibold'>{p.name}</ThemeText>
                      <ThemeText>Goal: {p.goal}</ThemeText>
                      <ThemeText>Impact: {p.potentialImpact}</ThemeText>
                      {p.nextSteps?.length ? (
                        <ThemeText>
                          Next Steps:
                          {'\n'}
                          {p.nextSteps.map((s, si) => `• ${s}`).join('\n')}
                        </ThemeText>
                      ) : null}
                    </WrapperView>
                  ))}
                </WrapperView>
              )}

              {isElite && renderVisualTable()}
              {isElite && renderResearchQuestions()}
              {isElite && renderReferences()}
              {isElite && renderRisks()}
            </WrapperView>
          )}
        </ScrollViews>
      </LayoutView>

      {warn.visible && (
        <PromptBanner
          visible={warn.visible}
          message={warn.message}
          onClose={() => setWarn({ visible: false, message: '' })}
          onAction={() => {/* Navigate to rules modal */}}
          actionLabel="Read Rules"
          variant="warning"
          bottom={keyboardHeight + composerHeight + 12}
          autoDismissMs={3500}
        />
      )}

      <View
        className='w-full absolute gap-2 bg-black rounded-t-2xl p-4 border-2 left-0 right-0'
        style={{
          bottom: keyboardHeight,
          paddingBottom: (insets.bottom || 12),
        }}
        onLayout={(e) => {
          const h = e?.nativeEvent?.layout?.height ?? 0;
          setComposerHeight(h);
        }}
      >
        <WrapperView className='flex-row items-center gap-2'>
          <InputView
            className='flex-1'
            placeholder='Add a refinement or new angle...'
            multiline
            value={userInput}
            onChangeText={setUserInput}
          />
          <ButtonView
            onPress={handleSendFollowUp}
            disabled={
              loading ||
              !userInput.trim() ||
              !(baseSurveyResult || userSurveyResult)
            }
            className='bg-secondaryCard rounded-lg p-1'
          >
            <ChevronRight color={'white'} size={20} />
          </ButtonView>
        </WrapperView>

        <LayoutView className='flex-row gap-2'>
          <ButtonView className=' bg-secondaryCard rounded-lg' onPress={handleConvertPress}>
            <ThemeText className='text-sm'>Convert to PDF</ThemeText>
          </ButtonView>
        </LayoutView>
      </View>

      <SubscribeModal
        visible={subscribeVisible}
        onClose={() => setSubscribeVisible(false)}
        onSubscribe={handleGoSubscribe}
        title="You are on a free tier"
        message="Subscribe to unlock this feature."
        primaryLabel="Subscribe"
        secondaryLabel="Later"
      />
    </ThemeBody>
  );
};

export default Generate;