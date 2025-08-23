import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemeMain from '../components/ui/ThemeMain'
import ThemeText from '../components/ui/ThemeText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LayoutView from '../components/layout/LayoutView'
import '../assets/stylesheet/global.css'
import ControlModal from '../components/modal/ControlModal'
const Main = () => {
  const insets = useSafeAreaInsets(); // get safe top inset

  return (
  <>
    <ThemeMain >
      <LayoutView className='flex-1 items-center justify-center flex'>
      <ThemeText >Main</ThemeText>
      </LayoutView>
    </ThemeMain>
  </>
  )
}

export default Main
