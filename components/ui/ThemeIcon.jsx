import React from 'react'
import { useColorScheme, View } from 'react-native'
import clsx from 'clsx'

const ThemeIcon = ({ children, className, ...props }) => {
  const colorScheme = useColorScheme()
  const iconColor = colorScheme === 'dark' ? 'white' : 'black'

  const childWithColor = React.cloneElement(children, {
    color: iconColor,
    
  })

  return (
    <View className={clsx(className)} {...props}>
      {childWithColor}
    </View>
  )
}

export default ThemeIcon
