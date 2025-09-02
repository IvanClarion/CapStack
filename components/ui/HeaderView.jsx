import { View, Text, useColorScheme } from 'react-native'
import { BlurView } from 'expo-blur'
import React from 'react'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'
const HeaderView = ({children, className, ...props}) => {
    const colorTheme = useColorScheme();

    const tint = colorTheme ?? 'default';
  return (
    <BlurView
    className={clsx('', className)}
    {...props}
    tint={tint}
    >
     {children}
    </BlurView>
  )
}

export default HeaderView