import { View, Text } from 'react-native'
import Survey from './Survey'
import ButtonMain from '../../../components/buttons/ButtonMain'
import { testAIModel } from '../../../database/model/testModel'
import { MoveRight } from 'lucide-react-native'
import React from 'react'
import clsx from 'clsx'
import ProgressBar from './ProgressBar'
import '../../../assets/stylesheet/global.css'
import ThemeBody from '../../../components/ui/ThemeBody'
import ThemeCard from '../../../components/ui/ThemeCard'
import ThemeText from '../../../components/ui/ThemeText'
import ThemeIcon from '../../../components/ui/ThemeIcon'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import InputView from '../../../components/input/InputView'
import GeneralButton from '../../../components/buttons/GeneralButton'

const MainForm = () => {
  return (
    <>
    <ThemeCard className='grid rounded-none lg:rounded-2xl w-full lg:w-[90%] lg:h-[90%] h-full gap-5'>
        <Survey/>
    </ThemeCard>
    </>
  )
}

export default MainForm