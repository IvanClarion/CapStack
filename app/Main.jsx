import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ThemeMain from '../components/ui/ThemeMain'
import ThemeText from '../components/ui/ThemeText'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Main = () => {
  const insets = useSafeAreaInsets(); // get safe top inset

  return (
    <ThemeMain >
      <View className='flex-1 items-center justify-center' style={{ paddingTop: insets.top + 100 }}> 
        
        <ThemeText >Main</ThemeText>
      </View>
    </ThemeMain>
  )
}

export default Main
