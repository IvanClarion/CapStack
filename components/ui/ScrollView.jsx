import { ScrollView } from 'react-native'
import React from 'react'
import clsx from 'clsx'
const ScrollViews = ({children, className, ...props}) => {
  return (
    <ScrollView
    className={clsx('bg-none', className)}
    {...props}
    >
      {children}  
    </ScrollView>
  )
}

export default ScrollViews