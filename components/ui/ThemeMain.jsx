import { View, Text } from 'react-native'

import { ImageBackground } from 'expo-image'
import clsx from 'clsx'
import React from 'react'



const ThemeMain = ({children, className, ...props}) => {
  return (
    <ImageBackground 
    style={{ flex: 1, width: '100%', height: '100%' }}
    contentFit="cover"
    source={require('../../assets/images/mainBg.png')}
    {...props}
    >
        {children}
    </ImageBackground>
  )
}

export default ThemeMain