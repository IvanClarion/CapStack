import { View, Text } from 'react-native'
import FieldStudy from './FieldStudy'
import ButtonMain from '../../../components/buttons/ButtonMain'
import { testAIModel } from '../../../database/model/testModel'
import { MoveRight } from 'lucide-react-native'
import React from 'react'
import clsx from 'clsx'
import '../../../assets/stylesheet/global.css'
import ThemeBody from '../../../components/ui/ThemeBody'
import ThemeCard from '../../../components/ui/ThemeCard'
import ThemeText from '../../../components/ui/ThemeText'
import ThemeIcon from '../../../components/ui/ThemeIcon'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import InputView from '../../../components/input/InputView'
import GeneralButton from '../../../components/buttons/GeneralButton'
import ProgressBar from './ProgressBar'
const MainForm = () => {
  return (
    <>
    <ThemeCard className='grid w-full lg:w-[90%] lg:h-[90%] h-full gap-5'>
        <ProgressBar/>
        <FieldStudy/>
        <View className='lg:items-end  '>
        <GeneralButton className='w-full flex-1 lg:w-[180px] '>Next</GeneralButton>
        </View>
    </ThemeCard>
    </>
  )
}

export default MainForm