import { View, Text } from 'react-native'
import React from 'react'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import '../../../assets/stylesheet/global.css'
import ThemeText from '../../../components/ui/ThemeText'
const ProgressBar = () => {
  return (
    <>
        <LayoutView>
            <WrapperView className='flex flex-row items-center gap-3'>
                <ThemeText className='progressNumber'>1</ThemeText>
                <ThemeText className='cardHeader'>Field of Study</ThemeText>
            </WrapperView>
        </LayoutView>
    </>
  )
}

export default ProgressBar