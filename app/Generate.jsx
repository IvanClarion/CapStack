import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import '../assets/stylesheet/global.css';
import { ChevronRight, HatGlasses, Coins, Ticket, ChevronDown, ChevronUp } from 'lucide-react-native';
import LayoutView from '../components/layout/LayoutView';
import ScrollViews from '../components/ui/ScrollView';
import WrapperView from '../components/input/WrapperView';
import ThemeBody from '../components/ui/ThemeBody';
import ThemeText from '../components/ui/ThemeText';
import ThemeCard from '../components/ui/ThemeCard';
import InputView from '../components/input/InputView';
import ButtonView from '../components/buttons/ButtonView';

// Daily tokens (32k/day) utilities
import { recordUsedTokens } from '../database/main/tokens';

// Conversation-level tokens ledger
import { addConversationTokens } from '../database/main/conversationTokens';

// IMPORTANT: import the default object to avoid named-export mismatch
import Gemini from '../database/model/geminiBasic';

import {
  safeParseStructuredJSON,
  validateStructuredPayload,
  coerceStructuredDefaults
} from '../database/util/jsonAI';

import { saveConversation } from '../database/main/savedConversation';
import { supabase } from '../database/lib/supabase';
import { exportStructuredToPdf } from '../database/util/pdf/exportStructuredToPdf';

const Generate = () => {
  const route = useRoute();
  const qs = useLocalSearchParams();

  // From survey flow (native)
  const userSurveyResult = route?.params?.userSurveyResult;

  // From archive (web-safe)
  const paramConversationId = route?.params?.conversationId ?? qs?.conversationId ?? null;
  const paramStructuredPayload = route?.params?.structuredPayload ?? null;

  const [loading, setLoading] = useState(false);
  const [structuredRaw, setStructuredRaw] = useState('');
  const [structuredParsed, setStructuredParsed] = useState(null);
  const [structuredError, setStructuredError] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [modelUsed, setModelUsed] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tokensCount, setTokensCount] = useState(0); // conversation-level cumulative (est or server)

  // Source of truth for the survey result (from survey or archive)
  const [baseSurveyResult, setBaseSurveyResult] = useState(null);

  // Dropdown toggle state for Survey Answers
  const [answersOpen, setAnswersOpen] = useState(false);

  const responseRef = useRef(null);
  const abortRef = useRef({ cancelled: false });
  const autoSavedRef = useRef(false); // ensure auto-save happens only once

  // Local safe estimator fallback
  const safeEstimateTokens = (s) => {
    const fn = Gemini?.estimateTokens;
    if (typeof fn === 'function') return fn(String(s ?? ''));
    // fallback heuristic
    return Math.ceil(String(s ?? '').length / 4);
  };

  // Keep baseSurveyResult in sync with live survey flow
  useEffect(() => {
    if (userSurveyResult) setBaseSurveyResult(userSurveyResult);
  }, [userSurveyResult]);

  // Load saved conversation from id (web/native)
  useEffect(() => {
    let mounted = true;

    async function loadById(id) {
      try {
        setLoading(true);
        setStructuredError(null);

        const { data, error } = await supabase
          .from('survey_conversations')
          .select('structured_payload, follow_ups, model_used, survey_result, tokens_count')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!mounted) return;

        const normalized = coerceStructuredDefaults(data?.structured_payload || {});
        setStructuredParsed(normalized);
        setFollowUps(Array.isArray(data?.follow_ups) ? data.follow_ups : []);
        setModelUsed(data?.model_used || null);
        setTokensCount(Number(data?.tokens_count) || 0); // load server-summed tokens
        setConversationId(id);

        // base survey result for prompting from archives
        setBaseSurveyResult(data?.survey_result || null);
      } catch (e) {
        if (mounted) {
          setStructuredError(e?.message || 'Failed to load saved conversation.');
        }
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
      loadById(String(paramConversationId));
      return;
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramConversationId, paramStructuredPayload]);

  // Survey flow generation (when not opened from archive)
  useEffect(() => {
    abortRef.current.cancelled = false;
    if (userSurveyResult && !paramConversationId && !paramStructuredPayload) {
      initialGenerate();
    }
    return () => {
      abortRef.current.cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSurveyResult]);

  async function initialGenerate() {
    await runStructuredGeneration({ addFollowUp: false, baseOverride: userSurveyResult });
  }

  // Helper: make sure we have a conversation id; saves if needed and returns id
  async function ensureConversationId(payloadForSave) {
    if (conversationId) return conversationId;
    const savedId = await handleSaveConversation({ silent: true, payloadOverride: payloadForSave });
    return savedId || conversationId || null;
  }

  // IMPORTANT: allow passing baseOverride and fallback to baseSurveyResult || userSurveyResult
  async function runStructuredGeneration({ addFollowUp, baseOverride } = {}) {
    const base = baseOverride ?? baseSurveyResult ?? userSurveyResult;
    if (!base) return;

    let newFollowUps = followUps;

    if (addFollowUp && userInput.trim()) {
      newFollowUps = [...followUps, userInput.trim()];
      setFollowUps(newFollowUps);
    }

    setLoading(true);
    setStructuredError(null);
    setStructuredParsed(null);
    setStructuredRaw('');

    try {
      // 1) Estimate input tokens
      const promptString = Gemini.buildStructuredSurveyJSONPrompt(base, newFollowUps);
      const estIn = safeEstimateTokens(promptString);

      // 2) Generate
      const res = await Gemini.generateStructuredSurveyJSON(base, newFollowUps);
      if (abortRef.current.cancelled) return;
      setModelUsed(res.modelUsed || null);

      const raw = res.text || '';
      setStructuredRaw(raw);

      // 3) Estimate output tokens and compute delta for this run
      const estOut = safeEstimateTokens(raw);
      const tokensThisRun = Math.max(0, estIn + estOut);

      // Keep an immediate local estimate (UI)
      setTokensCount((prev) => (Number(prev) || 0) + tokensThisRun);

      // 4) Record daily usage (32k/day cap handled in RPC)
      try {
        await recordUsedTokens(tokensThisRun);
      } catch (err) {
        console.warn('[Generate] recordUsedTokens failed:', err?.message || err);
      }

      // 5) Parse and validate
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

      const normalized = coerceStructuredDefaults(parsed.data);
      setStructuredParsed(normalized);

      // 6) Ensure conversation exists, then append a conversation_tokens ledger row
      try {
        const convId = await ensureConversationId(normalized);
        if (convId) {
          const note = addFollowUp ? 'follow-up generation' : 'initial generation';
          await addConversationTokens(convId, tokensThisRun, note);

          // Refresh authoritative server total after trigger recalculates tokens_count
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

      // 7) Auto-save follow-ups or updates (no-op if we just created it above)
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

  // Save helper; supports silent mode and payload override for immediate persistence
  // Returns the conversation id (string) on success, or null on failure/no-op
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
        surveyResult: baseSurveyResult || userSurveyResult || null, // allow fallback
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

  // Auto-save once after initial generation completes (when coming from survey)
  useEffect(() => {
    const shouldAutoSave =
      !!userSurveyResult &&
      !paramConversationId &&
      !paramStructuredPayload &&
      !!structuredParsed &&
      !loading &&
      !autoSavedRef.current;

    if (shouldAutoSave) {
      autoSavedRef.current = true; // prevent duplicate saves
      handleSaveConversation({ silent: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuredParsed, loading, userSurveyResult, paramConversationId, paramStructuredPayload]);

  // Build an absolute or relative URL for sharing
  function buildShareUrl(id) {
    const path = `/Generate?conversationId=${id}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${path}`;
    }
    return path;
  }

  // Share current conversation; saves if needed first
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

      const url = buildShareUrl(id);
      const title =
        structuredParsed?.title ||
        structuredParsed?.Title ||
        'CapStack AI Conversation';
      const text = structuredParsed?.summary
        ? `${structuredParsed.summary.slice(0, 160)}${structuredParsed.summary.length > 160 ? '…' : ''}`
        : '';

      // Web Share API when available; otherwise RN Share
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
      // user canceled or share failed; ignore quietly
    }
  }

  function renderHeaderSummary() {
    if (baseSurveyResult) {
      const { needReferences, openEndedAnswer, chosenQuestions } = baseSurveyResult;
      const formattedQuestions = (chosenQuestions || [])
        .map((q, i) => `${i + 1}. ${q.question}${q.description ? `\n   ${q.description}` : ''}`)
        .join('\n\n');

      return (
        <WrapperView >
          {/* Dropdown card for Survey Answers */}
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

          {/* Metrics cards */}
          <LayoutView className='flex-1 lg:grid lg:grid-cols-3 gap-3 p-5'>
            {!!modelUsed && (
              <ThemeCard className='flex-1 justify-center items-center'>
                <HatGlasses color={'#FF6060'} />
                <ThemeText className='font-semibold text-lg text-gray-500'>
                  Model used
                </ThemeText>
                <ThemeText className='text-[10px]'>{modelUsed}</ThemeText>
              </ThemeCard>
            )}

            <ThemeCard className='flex-1 justify-center items-center'>
              <Coins color={'#FF6060'} />
              <ThemeText className='font-semibold text-lg text-gray-500'>
                Tokens (est):
              </ThemeText>
              <ThemeText className='text-[10px]'>{Number(tokensCount) || 0}</ThemeText>
            </ThemeCard>

            {!!conversationId && (
              <ThemeCard className='flex-1 justify-center items-center'>
                <Ticket color={'#FF6060'} />
                <ThemeText className='font-semibold text-lg text-gray-500'>
                  Conversation ID:
                </ThemeText>
                <ThemeText className='text-[10px]'>{conversationId}</ThemeText>
              </ThemeCard>
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
      <WrapperView>
        <ThemeText className='font-semibold mb-2'>Overview Table</ThemeText>
        <LayoutView className='flex-row'>
          {vt.columns.map((col, idx) => (
            <WrapperView key={`h-${idx}`} className='flex-1 border border-gray-700 p-2 bg-gray-900'>
              <ThemeText className='font-semibold' numberOfLines={2}>
                {col}
              </ThemeText>
            </WrapperView>
          ))}
        </LayoutView>
        {(vt.rows || []).map((row, rIdx) => (
          <LayoutView key={`r-${rIdx}`} className='flex-row'>
            {vt.columns.map((_, cIdx) => (
              <WrapperView key={`c-${rIdx}-${cIdx}`} className='flex-1 border border-gray-800 p-2'>
                <ThemeText numberOfLines={4}>{row?.[cIdx] ?? ''}</ThemeText>
              </WrapperView>
            ))}
          </LayoutView>
        ))}
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
              <TouchableOpacity key={i} onPress={() => openRef(r.url)} activeOpacity={0.7}>
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

  // NEW: render risks
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

  // Export to PDF
  async function handleExportPdf() {
    try {
      if (!structuredParsed) {
        Alert.alert('Export', 'Nothing to export yet.');
        return;
      }

      // Build a share URL if we have a conversation id
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

  return (
    <ThemeBody className=' relative flex-1 overflow-hidden w-full max-w-full rounded-none h-full'>
      <WrapperView className='flex-row p-3 items-start mb-4 justify-between'>
        <ThemeText className='flex-1 uppercase cardHeader'>CapStack AI</ThemeText>
        {/* No header buttons; auto-save + archive updates are handled in code */}
      </WrapperView>

      <LayoutView className='pb-40 px-3 flex-1'>
        <ScrollViews className='gap-4'>
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
              <ThemeText className='cardHeader'>{structuredParsed.title}</ThemeText>
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

              {renderVisualTable()}
              {renderResearchQuestions()}
              {renderReferences()}
              {renderRisks()}
            </WrapperView>
          )}
        </ScrollViews>
      </LayoutView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
        className='w-full flex-1 absolute gap-2 bg-black rounded-t-2xl  p-4 border-2 bottom-0 left-0 right-0'
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
            disabled={loading || !userInput.trim() || !(baseSurveyResult || userSurveyResult)}
            className='bg-secondaryCard rounded-lg p-1'
          >
            <ChevronRight color={'white'} size={20} />
          </ButtonView>
        </WrapperView>

        <LayoutView className='flex-row gap-2'>
          <ButtonView className=' bg-secondaryCard rounded-lg' onPress={handleExportPdf}>
            <ThemeText className='text-sm'>Convert to PDF</ThemeText>
          </ButtonView>
          <ButtonView
            className='bg-secondaryCard rounded-lg'
            onPress={handleShareCurrent}
            disabled={loading || (!structuredParsed && !conversationId)}
          >
            <ThemeText className='text-sm'>Share</ThemeText>
          </ButtonView>
        </LayoutView>
      </KeyboardAvoidingView>
    </ThemeBody>
  );
};

export default Generate;