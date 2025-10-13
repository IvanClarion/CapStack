import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, Alert, ActivityIndicator, View } from 'react-native';
import { Search, ChevronLeft, Check } from 'lucide-react-native';
import { useNavigation } from 'expo-router';

import { fetchSurvey } from '../../../database/main/fetchSurvey';
import '../../../assets/stylesheet/global.css'

import LayoutView from '../../../components/layout/LayoutView';
import WrapperView from '../../../components/input/WrapperView';
import ScrollViews from '../../../components/ui/ScrollView';
import ThemeText from '../../../components/ui/ThemeText';
import InputView from '../../../components/input/InputView';
import ButtonView from '../../../components/buttons/ButtonView';
import ThemeBody from '../../../components/ui/ThemeBody';

const FieldStudy = ({ onSurveyComplete }) => {
  // Store selected IDs as strings to avoid number/string mismatches with bigint IDs
  const [selectedIds, setSelectedIds] = useState([]);
  const [surveyData, setSurveyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showOpenEnded, setShowOpenEnded] = useState(false);
  const [openEndedAnswer, setOpenEndedAnswer] = useState('');
  const [needReferences, setNeedReferences] = useState(null);

  // Always store arrays of question objects per page index
  const [answers, setAnswers] = useState({});

  const debounceRef = useRef();
  const navigation = useNavigation();

  const normId = (v) => String(v ?? '');

  // Debounce logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Fetch survey data
  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        const data = await fetchSurvey();
        setSurveyData(data || []);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  if (loading) {
    return (
      <LayoutView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </LayoutView>
    );
  }

  if (!surveyData.length) {
    return (
      <LayoutView className="flex-1 justify-center items-center">
        <ThemeText>No Data</ThemeText>
      </LayoutView>
    );
  }

  const currentSurvey = surveyData[currentIndex];
  const isMulti = !!currentSurvey?.can_choose_multiple;

  // Filter questions
  const filteredQuestions =
    debouncedSearch.trim().length > 0
      ? (currentSurvey.survey_questions || []).filter(
          (q) =>
            q.questions.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (q.description && q.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
        )
      : (currentSurvey.survey_questions || []);

  // Toggle handler that respects single vs multi selection mode
  const handleButton = (idRaw) => {
    const id = normId(idRaw);
    if (isMulti) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    } else {
      setSelectedIds([id]);
    }
  };

  const handleNext = () => {
    if (!selectedIds.length) {
      Alert.alert(
        'Selection Required',
        isMulti ? 'Please choose at least one option before continuing.' : 'Please choose one option before continuing.'
      );
      return;
    }

    // Resolve selected question objects for this step
    const pickedArray = (currentSurvey.survey_questions || []).filter((q) =>
      selectedIds.includes(normId(q.id))
    );

    setAnswers((prev) => ({ ...prev, [currentIndex]: pickedArray }));

    if (currentIndex < surveyData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // If the next page was previously answered, preselect it
      const nextAnswered = answers[nextIndex];
      setSelectedIds(nextAnswered ? nextAnswered.map((q) => normId(q.id)) : []);
      setSearch('');
    } else {
      setShowOpenEnded(true);
    }
  };

  const handlePrev = () => {
    if (showOpenEnded) {
      setShowOpenEnded(false);
      return;
    }
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevAnswered = answers[prevIndex];
      setSelectedIds(prevAnswered ? prevAnswered.map((q) => normId(q.id)) : []);
      setSearch('');
    }
  };

  const handleOpenEndedSubmit = () => {
    // Build chosenQuestions array from ALL answers (flatten arrays)
    const chosenQuestions = Object.keys(answers)
      .sort((a, b) => Number(a) - Number(b))
      .flatMap((idx) => {
        const arr = Array.isArray(answers[idx]) ? answers[idx] : [];
        return arr.map((q) => ({
          surveyIndex: Number(idx),
          surveyTitle: surveyData[idx]?.title,
          id: q.id,
          question: q.questions,
          description: q.description,
        }));
      });

    const result = {
      needReferences,
      openEndedAnswer,
      chosenQuestions,
    };

    if (onSurveyComplete) onSurveyComplete(result);

    navigation.navigate('Generate', {
      userSurveyResult: result,
    });

    // Reset state (optional)
    setOpenEndedAnswer('');
    setNeedReferences(null);
    setShowOpenEnded(false);
    setCurrentIndex(0);
    setSelectedIds([]);
    setSearch('');
    setAnswers({});
  };

  return (
    <>
      {!showOpenEnded ? (
        <LayoutView className="flex-1 gap-5">
          <WrapperView className="flex-row gap-2 items-center">
            <ThemeText className="bg-AscentBlue font-semibold px-4 py-2 rounded-full">
              {currentIndex + 1}
            </ThemeText>
            <ThemeText className="font-semibold flex-1 cardHeader capitalize text-start">
              {currentSurvey.title}
            </ThemeText>
          </WrapperView>

          <ThemeText className="text-sm text-start color-gray-400">{currentSurvey.description}</ThemeText>

          {isMulti ? (
            <ThemeText className="text-xs text-gray-400">
              Multiple selection enabled. Tap all that apply.
            </ThemeText>
          ) : null}

          <WrapperView className="inputWrapper">
            <InputView className="flex-1" placeholder="Search" value={search} onChangeText={setSearch} />
            <Search color={'white'} />
          </WrapperView>

          {/* Optional: display selected chips for clarity in multi-select mode */}
          {isMulti && selectedIds.length > 0 && (
            <WrapperView className='bg-AscentBlue/50  border-2 border-AscentBlue items-start justify-start rounded-2xl self-start px-4 py-2'>
            <ThemeText className="text-xs font-semibold text-gray-400">
              {`${selectedIds.length} choosen`}
            </ThemeText>
            </WrapperView>
          )}

          <ScrollViews>
            <LayoutView className="gap-3 lg:grid lg:grid-cols-4">
              {filteredQuestions && filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => {
                  const isSelected = selectedIds.includes(normId(question.id));
                  return (
                    <WrapperView
                      key={normId(question.id)}
                      className={`WrapperChoices py-10 ${isSelected ? 'bg-SecondaryBlie border-SecondaryBlie ' : ''}`}
                    >
                      <TouchableOpacity
                        className="WrapperChoicesButton"
                        onPress={() => handleButton(question.id)}
                        activeOpacity={0.8}
                      >
                        <ThemeText className="cardlabel">{question.questions}</ThemeText>
                        <ThemeText className="text-center text-xs text-gray-500/80">
                          {question.description}
                        </ThemeText>
                      </TouchableOpacity>

                      {/* Visual checkmark on each selected card */}
                      {isSelected && (
                        <View className="absolute top-2 right-2 bg-AscentViolet rounded-full p-1">
                          <Check color="white" size={16} />
                        </View>
                      )}
                    </WrapperView>
                  );
                })
              ) : (
                <ThemeText className="text-center text-gray-400">No questions found.</ThemeText>
              )}
            </LayoutView>
          </ScrollViews>

          <LayoutView>
            <WrapperView className="flex-row items-center bottom-0 gap-2">
              <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} className="bg-RosePink rounded-full p-2">
                <ChevronLeft color={'white'} size={20} />
              </TouchableOpacity>
              <ButtonView onPress={handleNext} className="flex-1 simpleButton">
                {currentIndex < surveyData.length - 1 ? 'Next' : 'Finish'}
              </ButtonView>
            </WrapperView>
          </LayoutView>
        </LayoutView>
      ) : (
        <LayoutView className="flex-1 justify-center items-center gap-5">
          <WrapperView className="w-full gap-5 max-w-lg mx-auto">
            <LayoutView className="gap-5">
              <ThemeText className="cardlabel">Need references?</ThemeText>
              <WrapperView className="gap-3 lg:flex-row">
                <ButtonView
                  className={'WrapperChoices' + (needReferences === true ? ' bg-AscentBlue border-AscentBlue text-white' : '')}
                  onPress={() => setNeedReferences(true)}
                >
                  Yes, I need references
                </ButtonView>
                <ButtonView
                  className={'WrapperChoices' + (needReferences === false ? ' bg-AscentBlue border-AscentBlue text-white' : '')}
                  onPress={() => setNeedReferences(false)}
                >
                  No, I don't need references
                </ButtonView>
              </WrapperView>
            </LayoutView>
            <LayoutView className='gap-3'>
              <ThemeText className="cardlabel">Additional Information</ThemeText>
              <ThemeBody className="p-5 rounded-lg h-[150px]">
                <InputView
                  className=" text-start items-start justify-start"
                  placeholder="Type your answer or feedback here..."
                  value={openEndedAnswer}
                  onChangeText={setOpenEndedAnswer}
                  multiline
                />
              </ThemeBody>
              <WrapperView className='flex-row gap-2'>
                <ButtonView
                  className=" flex-1 simpleButton"
                  onPress={handleOpenEndedSubmit}
                  disabled={needReferences === null || !openEndedAnswer.trim()}
                >
                  Submit
                </ButtonView>
                <ButtonView className=" flex-1 deleteButton" onPress={handlePrev}>
                  Back
                </ButtonView>
              </WrapperView>
            </LayoutView>
          </WrapperView>
        </LayoutView>
      )}
    </>
  );
};

export default FieldStudy;