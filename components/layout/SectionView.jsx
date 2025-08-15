import { View } from 'react-native'
import React from 'react'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'

const SectionView = ({children, className, ...props}) => {
  return (
    <View className={clsx('', className)} {...props}>
      {children}
    </View>
  )
}

export default SectionView
