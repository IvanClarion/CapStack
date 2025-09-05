import { StyleSheet, View, useColorScheme } from 'react-native'
import clsx  from 'clsx'
import '../../assets/stylesheet/global.css'
import React from 'react'

const ThemeBody = ({children, className, ...props}) => {
  const colorScheme = useColorScheme()
  return (
    <View className={clsx('bg-secondaryCard', className)} {...props}>
     {children}
    </View>
  )
}

export default ThemeBody

const styles = StyleSheet.create({})