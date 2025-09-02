import { View, Text } from 'react-native'
import { Link } from 'expo-router'
import React from 'react'
import Themebody from '../components/ui/ThemeBody'
import ThemeText from '../components/ui/ThemeText'
import ButtonView from '../components/buttons/ButtonView'
import LayoutView from '../components/layout/LayoutView'
import '../assets/stylesheet/global.css'
const NotFoundScreen = () => {
  return (
    <Themebody className='flex-1 items-center gap-3 p-2 justify-center'>
      <ThemeText className='color-RosePink text-6xl font-extrabold'>404</ThemeText>
      <ThemeText className='cardHeader'>Page Not Found</ThemeText>
      <ThemeText>The page you're looking for can't be found.</ThemeText>
      <Link href='/Main'>
      <ButtonView className='simpleButton'>Go to Home</ButtonView>
      </Link>
    </Themebody>
  )
}

export default NotFoundScreen