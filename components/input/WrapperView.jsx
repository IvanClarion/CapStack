import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import clsx from 'clsx'
const WrapperView = ({children, className, ...props}) => {
  return (
    <View className={clsx('', className)} {...props}>
      {children}
    </View>
  )
}

export default WrapperView

const styles = StyleSheet.create({})