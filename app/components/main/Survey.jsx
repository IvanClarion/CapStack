import { View, TouchableOpacity, Alert } from 'react-native'
import { Search, ChevronLeft } from 'lucide-react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useNavigation } from 'expo-router'
import { ActivityIndicator } from 'react-native'
import { fetchSurvey } from '../../../database/main/fetchSurvey'
import '../../../assets/stylesheet/global.css'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import ScrollViews from '../../../components/ui/ScrollView'
import ThemeText from '../../../components/ui/ThemeText'
import InputView from '../../../components/input/InputView'
import ThemeIcon from '../../../components/ui/ThemeIcon'
import ButtonView from '../../../components/buttons/ButtonView'
import ThemeBody from '../../../components/ui/ThemeBody'

const FieldStudy = ({ onSurveyComplete }) => {
  const [selectedId, setSelectedId] = useState('')
  const [surveyData, setSurveyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showOpenEnded, setShowOpenEnded] = useState(false)
  const [openEndedAnswer, setOpenEndedAnswer] = useState('')
  const [needReferences, setNeedReferences] = useState(null)

  // NEW: accumulate answers (key = survey index, value = question object)
  const [answers, setAnswers] = useState({})

  const debounceRef = useRef()
  const navigation = useNavigation()

  // Debounce logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  // Fetch survey data
  useEffect(() => {
    async function getData() {
      setLoading(true)
      try {
        const data = await fetchSurvey()
        setSurveyData(data || [])
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])

  if (loading) {
    return (
      <LayoutView className="flex-1 justify-center items-center">
        <ActivityIndicator size={'large'} />
      </LayoutView>
    )
  }

  if (!surveyData.length) {
    return (
      <LayoutView className="flex-1 justify-center items-center">
        <ThemeText>No Data</ThemeText>
      </LayoutView>
    )
  }

  const currentSurvey = surveyData[currentIndex]

  // Filter questions
  const filteredQuestions = debouncedSearch.trim().length > 0
    ? currentSurvey.survey_questions.filter(q =>
        q.questions.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (q.description && q.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
      )
    : currentSurvey.survey_questions

  const handleButton = (id) => {
    setSelectedId(id)
  }

  const handleNext = () => {
    if (!selectedId) {
      Alert.alert('Selection Required', 'Please choose one option before continuing.')
      return
    }

    // Store the selected question for this survey index
    const picked = currentSurvey.survey_questions.find(q => q.id === selectedId)
    setAnswers(prev => ({ ...prev, [currentIndex]: picked }))

    if (currentIndex < surveyData.length - 1) {
      setCurrentIndex(currentIndex + 1)
      // If the next page was previously answered, preselect it
      const nextAnswered = answers[currentIndex + 1]
      setSelectedId(nextAnswered ? nextAnswered.id : '')
      setSearch('')
    } else {
      setShowOpenEnded(true)
    }
  }

  const handlePrev = () => {
    if (showOpenEnded) {
      setShowOpenEnded(false)
      return
    }
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      // Restore previously selected answer if exists
      const prevAnswered = answers[prevIndex]
      setSelectedId(prevAnswered ? prevAnswered.id : '')
      setSearch('')
    }
  }

  const handleOpenEndedSubmit = () => {
    // Build chosenQuestions array
    const chosenQuestions = Object.keys(answers)
      .sort((a, b) => Number(a) - Number(b))
      .map(idx => {
        const q = answers[idx]
        return {
          surveyIndex: Number(idx),
            // include optional survey meta
          surveyTitle: surveyData[idx]?.title,
          id: q.id,
          question: q.questions,
          description: q.description
        }
      })

    const result = {
      needReferences,
      openEndedAnswer,
      chosenQuestions
    }

    if (onSurveyComplete) onSurveyComplete(result)

    navigation.navigate('Generate', {
      userSurveyResult: result
    })

    // Reset state (optional)
    setOpenEndedAnswer('')
    setNeedReferences(null)
    setShowOpenEnded(false)
    setCurrentIndex(0)
    setSelectedId('')
    setSearch('')
    setAnswers({})
  }

  return (
    <>
      {!showOpenEnded ? (
        <LayoutView className="flex-1 gap-5">
          <WrapperView className='flex-row gap-2 items-center'>
            <ThemeText className='bg-AscentBlue font-semibold px-4 py-2 rounded-full'>
              {currentIndex + 1}
            </ThemeText>
            <ThemeText className="font-semibold flex-1 cardHeader capitalize text-start">
              {currentSurvey.title}
            </ThemeText>
          </WrapperView>
          <ThemeText className="text-sm text-start color-gray-400">
            {currentSurvey.description}
          </ThemeText>
          <WrapperView className="inputWrapper">
            <InputView
              className="flex-1"
              placeholder="Search"
              value={search}
              onChangeText={setSearch}
            />
            <ThemeIcon>
              <Search />
            </ThemeIcon>
          </WrapperView>
          <ScrollViews>
            <View>
              <LayoutView className="gap-3 lg:grid lg:grid-cols-4">
                {filteredQuestions && filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => {
                    const isSelected = selectedId === question.id
                    return (
                      <WrapperView
                        key={question.id}
                        className={`WrapperChoices duration-300 py-10 ${isSelected ? 'bg-SecondaryBlie border-SecondaryBlie ' : ''}`}
                      >
                        <TouchableOpacity
                          className="WrapperChoicesButton"
                          onPress={() => handleButton(question.id)}
                        >
                          <ThemeText className="cardlabel">
                            {question.questions}
                          </ThemeText>
                          <ThemeText className='text-center text-xs text-gray-500/80'>
                            {question.description}
                          </ThemeText>
                        </TouchableOpacity>
                      </WrapperView>
                    )
                  })
                ) : (
                  <ThemeText className="text-center text-gray-400">No questions found.</ThemeText>
                )}
              </LayoutView>
            </View>
          </ScrollViews>
          <LayoutView>
            <WrapperView className='flex-row items-center bottom-0 gap-2'>
              <TouchableOpacity
                onPress={handlePrev}
                disabled={currentIndex === 0}
                className='bg-RosePink rounded-full p-2'
              >
                <ChevronLeft color={'white'} size={30}/>
              </TouchableOpacity>
              <ButtonView onPress={handleNext} className='flex-1 simpleButton'>
                {currentIndex < surveyData.length - 1 ? "Next" : "Finish"}
              </ButtonView>
            </WrapperView>
          </LayoutView>
        </LayoutView>
      ) : (
        <LayoutView className="flex-1 justify-center items-center gap-5">
          <WrapperView className="w-full gap-5 max-w-lg mx-auto">
            <LayoutView className='gap-5'>
              <ThemeText className='cardlabel'>Need references?</ThemeText>
              <WrapperView className='gap-3 lg:flex-row'>
                <ButtonView
                  className={
                    'WrapperChoices' +
                    (needReferences === true ? 'bg-AscentBlue border-AscentBlue text-white' : '')
                  }
                  onPress={() => setNeedReferences(true)}
                >
                  Yes, I need references
                </ButtonView>
                <ButtonView
                  className={
                    'WrapperChoices' +
                    (needReferences === false ? 'bg-AscentBlue border-AscentBlue text-white' : '')
                  }
                  onPress={() => setNeedReferences(false)}
                >
                  No, I don't need references
                </ButtonView>
              </WrapperView>
            </LayoutView>
            <LayoutView>
              <ThemeText className="cardlabel">
                Additional Information
              </ThemeText>
              <ThemeBody className='p-5 rounded-lg h-[150px]'>
                <InputView
                  className="flex-1"
                  placeholder="Type your answer or feedback here..."
                  value={openEndedAnswer}
                  onChangeText={setOpenEndedAnswer}
                  multiline
                />
              </ThemeBody>
              <ButtonView
                className="mt-2 simpleButton"
                onPress={handleOpenEndedSubmit}
                disabled={needReferences === null || !openEndedAnswer.trim()}
              >
                Submit
              </ButtonView>
              <ButtonView
                className="mt-2 deleteButton"
                onPress={handlePrev}
              >
                Back
              </ButtonView>
            </LayoutView>
          </WrapperView>
        </LayoutView>
      )}
    </>
  )
}

export default FieldStudy