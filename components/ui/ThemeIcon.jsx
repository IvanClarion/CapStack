import React from 'react'
import { View } from 'react-native'
import clsx from 'clsx'

const ThemeIcon = React.forwardRef(({ children, className, ...props }, ref) => {
  const childWithColor = React.cloneElement(children, {
    color: '#FFFFFF',
  })

  return (
    <View ref={ref} className={clsx(className)} {...props}>
      {childWithColor}
    </View>
  )
})

export default ThemeIcon