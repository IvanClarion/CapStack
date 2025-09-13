import React, { useEffect, useState, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import '../assets/stylesheet/global.css';
import { Share2, ChevronRight, Download, Repeat2 } from 'lucide-react-native';

import LayoutView from '../components/layout/LayoutView';
import ScrollViews from '../components/ui/ScrollView';
import WrapperView from '../components/input/WrapperView';
import ThemeBody from '../components/ui/ThemeBody';
import ThemeMain from '../components/ui/ThemeMain';
import ThemeText from '../components/ui/ThemeText';
import ThemeCard from '../components/ui/ThemeCard';
import InputView from '../components/input/InputView';
import ButtonView from '../components/buttons/ButtonView';

import { generateStructuredSurveyJSON } from '../database/model/geminiBasic';

import {
  safeParseStructuredJSON,
  validateStructuredPayload,
  coerceStructuredDefaults
} from '../database/util/jsonAI';

import { saveConversation } from '../database/main/savedConversation';
import { supabase } from '../database/lib/supabase'; // ensure this path is correct

const Generate = () => {
  const route = useRoute();
  const userSurveyResult = route.params?.userSurveyResult;

  const [loading, setLoading] = useState(false);
  const [structuredRaw, setStructuredRaw] = useState('');
  const [structuredParsed, setStructuredParsed] = useState(null);
  const [structuredError, setStructuredError] = useState(null);
  const [followUps, setFollowUps] = useState([]); // cumulative follow-up prompts
  const [userInput, setUserInput] = useState('');
  const [modelUsed, setModelUsed] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [saving, setSaving] = useState(false);

  const abortRef = useRef({ cancelled: false });

  useEffect(() => {
    abortRef.current.cancelled = false;
    if (userSurveyResult) {
      initialGenerate();
    }
    return () => {
      abortRef.current.cancelled = true;
    };
  }, [userSurveyResult]);

  async function initialGenerate() {
    await runStructuredGeneration({ addFollowUp: false });
  }

  async function runStructuredGeneration({ addFollowUp, explicitRegenerate = false } = {}) {
    if (!userSurveyResult) return;
    let newFollowUps = followUps;

    if (addFollowUp && userInput.trim()) {
      newFollowUps = [...followUps, userInput.trim()];
      setFollowUps(newFollowUps);
    } else if (explicitRegenerate) {
      // keep existing followUps
    }

    setLoading(true);
    setStructuredError(null);
    setStructuredParsed(null);
    setStructuredRaw('');

    try {
      const res = await generateStructuredSurveyJSON(userSurveyResult, newFollowUps);
      if (abortRef.current.cancelled) return;
      setModelUsed(res.modelUsed || null);

      const raw = res.text || '';
      setStructuredRaw(raw);

      const parsed = safeParseStructuredJSON(raw);
      if (!parsed.ok) {
        setStructuredError(`Parse error: ${parsed.error}`);
      } else {
        const validationErr = validateStructuredPayload(parsed.data);
        if (validationErr) {
          setStructuredError(`Validation error: ${validationErr}`);
        } else {
          const normalized = coerceStructuredDefaults(parsed.data);
          setStructuredParsed(normalized);
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

  async function handleSendFollowUp() {
    if (!userInput.trim()) return;
    await runStructuredGeneration({ addFollowUp: true });
  }

  async function handleRegenerate() {
    await runStructuredGeneration({ explicitRegenerate: true });
  }

  async function getUserId() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log("[getUserId] auth error:", error);
      return null;
    }
    return data?.user?.id || null;
  }

  async function handleSaveConversation() {
    if (!structuredParsed) {
      Alert.alert('Save', 'Nothing to save yet.');
      return;
    }
    if (!userSurveyResult) {
      Alert.alert('Save', 'Missing survey context.');
      return;
    }

    try {
      setSaving(true);
      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Save Error', 'User not authenticated.');
        return;
      }

      const params = {
        userId,
        surveyResult: userSurveyResult,
        structuredPayload: structuredParsed,
        followUps,
        modelUsed,
        messages: null,
        appendFollowUps: false
      };

      if (conversationId) {
        params.id = conversationId;
      }

      console.log("[handleSaveConversation] outgoing:", params);
      const { data, error } = await saveConversation(params);

      if (error) {
        console.log("[handleSaveConversation] supabase error object:", error);
        Alert.alert('Save Error', error.message || 'Failed to save conversation.');
        return;
      }

      if (!conversationId && data?.id) {
        setConversationId(data.id);
      }

      Alert.alert('Saved', conversationId ? 'Conversation updated.' : 'Conversation created.');
    } catch (e) {
      Alert.alert('Save Error', e?.message || 'Unexpected error saving conversation.');
    } finally {
      setSaving(false);
    }
  }

  function renderHeaderSummary() {
    if (!userSurveyResult) return null;
    const { needReferences, openEndedAnswer, chosenQuestions } = userSurveyResult;
    const formattedQuestions = (chosenQuestions || [])
      .map(
        (q, i) =>
          `${i + 1}. ${q.question}${q.description ? `\n   ${q.description}` : ''}`
      )
      .join('\n\n');

    return (
      <WrapperView className='mb-6'>
        <ThemeText className='systemContainer whitespace-pre-wrap'>
{`Survey Answers:
Need References: ${needReferences ? 'Yes' : 'No'}
Additional Info: ${openEndedAnswer || '(none)'}

Selected Questions:
${formattedQuestions || 'None'}`}
        </ThemeText>
        {followUps.length ? (
          <ThemeText className='mt-3 text-xs text-gray-400'>
            Follow-Ups Applied:
            {'\n'}
            {followUps.map((f, i) => `#${i + 1}: ${f}`).join('\n')}
          </ThemeText>
        ) : null}
        {modelUsed && (
            <ThemeText className='mt-2 text-[10px] text-gray-500'>
              Model used: {modelUsed}
            </ThemeText>
        )}
        {conversationId && (
          <ThemeText className='mt-1 text-[10px] text-gray-500'>
            Conversation ID: {conversationId}
          </ThemeText>
        )}
      </WrapperView>
    );
  }

  return (
    <ThemeMain>
      <ThemeCard className='flex-1 items-center overflow-hidden rounded-none justify-center'>
        <ThemeBody className='p-5 relative flex-1 overflow-hidden w-full lg:max-w-[70%] max-w-lg h-full rounded-2xl'>
          <WrapperView className='flex-row items-start mb-4 justify-between'>
            <ThemeText className='flex-1 uppercase cardHeader'>
              AI Assistant
            </ThemeText>
            <WrapperView className='flex-row gap-2'>
              <ButtonView
                className='bg-AscentBlue rounded-lg px-3 py-2'
                onPress={handleSaveConversation}
                disabled={!structuredParsed || saving}
              >
                <Download color={'white'} size={18} />
              </ButtonView>
              <ButtonView
                className='bg-AscentBlue rounded-lg px-3 py-2'
                onPress={handleRegenerate}
                disabled={loading}
              >
                <Repeat2 color={'white'} size={18} />
              </ButtonView>
              <Share2 color={'white'} size={20}/>
            </WrapperView>
          </WrapperView>

          <LayoutView className='pb-28 flex-1'>
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
                  <ThemeText className='deleteButton p-3 rounded-lg'>
                    {structuredError}
                  </ThemeText>
                  {structuredRaw ? (
                    <ThemeText className='botContainer mt-2'>
                      Raw (unparsed/invalid snippet):
                      {'\n'}{structuredRaw.slice(0, 1600)}
                      {structuredRaw.length > 1600 ? '…' : ''}
                    </ThemeText>
                  ) : null}
                </WrapperView>
              )}

              {!structuredError && structuredParsed && (
                <WrapperView className='gap-5'>
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
                              {'\n'}{p.nextSteps.map((s, si) => `• ${s}`).join('\n')}
                            </ThemeText>
                          ) : null}
                        </WrapperView>
                      ))}
                    </WrapperView>
                  )}

                  {!!structuredParsed.references?.length && (
                    <WrapperView>
                      <ThemeText className='font-semibold mb-2'>References</ThemeText>
                      {structuredParsed.references.map((r, i) => (
                        <ThemeText key={i} className='botContainer mb-1'>
                          {r.type ? `[${r.type}] ` : ''}{r.source}
                        </ThemeText>
                      ))}
                    </WrapperView>
                  )}

                  {!!structuredParsed.risks?.length && (
                    <WrapperView>
                      <ThemeText className='font-semibold mb-2'>Risks</ThemeText>
                      {structuredParsed.risks.map((r, i) => (
                        <ThemeText key={i} className='botContainer mb-1'>
                          • {r}
                        </ThemeText>
                      ))}
                    </WrapperView>
                  )}
                </WrapperView>
              )}
            </ScrollViews>
          </LayoutView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={20}
            className='w-full absolute gap-2 bg-black rounded-t-2xl p-4 border-2 bottom-0 left-0 right-0'
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
                disabled={loading || !userInput.trim()}
                className='bg-secondaryCard rounded-lg p-1'
              >
                <ChevronRight color={'white'} size={30} />
              </ButtonView>
            </WrapperView>
          </KeyboardAvoidingView>
        </ThemeBody>
      </ThemeCard>
    </ThemeMain>
  );
};

export default Generate;