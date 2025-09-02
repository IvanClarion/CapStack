import { View, Text } from 'react-native'
import clsx from 'clsx'
import React from 'react'
import '../../assets/stylesheet/global.css'

const WebView = ({children, className, ...props}) => {
  return (
    <View className={clsx(" relative lg:sticky",className)}{...props}>
      {children}
    </View>
  )
}

export default WebView