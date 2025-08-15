import { Text, useColorScheme } from 'react-native'
import React from 'react'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'
const ThemeText = ({children, className, ...props}) => {
    const colorScheme = useColorScheme();
  return (
    <Text className={clsx('',colorScheme==='dark'?'text-white': 'text-black', className)}{...props}>
      {children}
    </Text>
  )
}

export default ThemeText
