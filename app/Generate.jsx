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
import * as ExpoLinking from 'expo-linking';
import '../assets/stylesheet/global.css';
import {
  ChevronRight, HatGlasses, Coins, Ticket, ChevronDown, ChevronUp, PencilLine, Save, X
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
import Gemini from '../database/model/geminiBasic';
import {
  safeParseStructuredJSON,
  validateStructuredPayload,
  coerceStructuredDefaults
} from '../database/util/jsonAI';
import { saveConversation } from '../database/main/savedConversation';
import { supabase } from '../database/lib/supabase';
import { exportStructuredToPdf } from '../database/util/pdf/exportStructuredToPdf';
import ThemeIcon from '../components/ui/ThemeIcon';
import CardSkeleton from '../components/loader/CardSkeleton';
const Generate = () => {
  const route = useRoute();
  const qs = useLocalSearchParams();

  const userSurveyResult = route?.params?.userSurveyResult;
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
  const [tokensCount, setTokensCount] = useState(0);

  const [baseSurveyResult, setBaseSurveyResult] = useState(null);
  const [answersOpen, setAnswersOpen] = useState(false);

  const responseRef = useRef(null);
  const abortRef = useRef({ cancelled: false });
  const autoSavedRef = useRef(false);

  // --- Rename title state ---
  const [editTitle, setEditTitle] = useState(false);
  const [pendingTitle, setPendingTitle] = useState('');

  // Derived display title so header and response stay in sync while editing
  const displayTitle = editTitle ? pendingTitle : (structuredParsed?.title || '');

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
        setTokensCount(Number(data?.tokens_count) || 0);
        setConversationId(id);

        setBaseSurveyResult(data?.survey_result || null);
      } catch (e) {
        if (mounted) setStructuredError(e?.message || 'Failed to load saved conversation.');
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
  }, [paramConversationId, paramStructuredPayload]);

  useEffect(() => {
    abortRef.current.cancelled = false;
    if (userSurveyResult && !paramConversationId && !paramStructuredPayload) {
      initialGenerate();
    }
    return () => {
      abortRef.current.cancelled = true;
    };
  }, [userSurveyResult]);

  async function initialGenerate() {
    await runStructuredGeneration({ addFollowUp: false, baseOverride: userSurveyResult });
  }

  async function ensureConversationId(payloadForSave) {
    if (conversationId) return conversationId;
    const savedId = await handleSaveConversation({ silent: true, payloadOverride: payloadForSave });
    return savedId || conversationId || null;
  }

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
      const promptString = Gemini.buildStructuredSurveyJSONPrompt(base, newFollowUps);
      const estIn = safeEstimateTokens(promptString);

      const res = await Gemini.generateStructuredSurveyJSON(base, newFollowUps);
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

  // FIX: Always return an absolute link
  function buildShareUrl(id) {
    const path = `/Generate?conversationId=${id}`;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${path}`;
    }
    // Native: create a deep link using your app scheme (configure "scheme" in app.json/app.config)
    // Example: capstack://Generate?conversationId=123
    try {
      return ExpoLinking.createURL(path);
    } catch {
      // Optional: fallback to a public base URL if you host a web version
      const BASE = process.env.EXPO_PUBLIC_APP_BASE_URL; // e.g., https://app.capstack.ai
      return BASE ? `${BASE}${path}` : path; // path is last resort (may not be clickable)
    }
  }

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

      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        // Keep url both in message and url field; some Android targets ignore the url field
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

          {/* --- CardSkeleton fallback for metrics cards while loading --- */}
          <LayoutView className='flex-1 flex-row gap-2 p-5'>
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
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

  // --- Save title handler ---
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
    } catch (e) {
      Alert.alert('Rename Error', e?.message || 'Failed to rename.');
    }
  }

  return (
    <ThemeBody className=' relative flex-1 overflow-hidden w-full max-w-full rounded-none h-full'>
      <WrapperView className='flex-row py-2 px-2 lg:px-10 items-center justify-between'>
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
            <TouchableOpacity
              className='bg-AscentViolet p-2 rounded-lg'
              onPress={() => setEditTitle(true)}
            >
              <PencilLine color={'white'} size={18} />
            </TouchableOpacity>
          </WrapperView>
        )}
      </WrapperView>

      <LayoutView className='pb-36 px-3 flex-1'>
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