import { View, Text } from 'react-native'
import FieldStudy from './FieldStudy'

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
import ProgressBar from './ProgressBar'
const MainForm = () => {
  return (
    <>
    <ThemeCard className='grid w-full lg:w-[98%] lg:h-[95%] h-full gap-5'>
        <ProgressBar/>
        <FieldStudy/>
    </ThemeCard>
    </>
  )
}

export default MainForm