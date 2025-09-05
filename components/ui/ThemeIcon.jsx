import React from 'react'
import { useColorScheme, View } from 'react-native'
import clsx from 'clsx'

const ThemeIcon = ({ children, className, ...props }) => {
  

  const childWithColor = React.cloneElement(children, {
    color: '#FFFFFF',
    
  })

  return (
    <View className={clsx(className)} {...props}>
      {childWithColor}
    </View>
  )
}

export default ThemeIcon
