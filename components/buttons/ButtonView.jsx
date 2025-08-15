import { TouchableWithoutFeedback,View,Text } from 'react-native'
import React from 'react'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'
const ButtonView = ({children, className, ...props}) => {
  return (
    <TouchableWithoutFeedback {...props}>
      <View className={clsx('flex p-2 android:p-4 items-center font-semibold justify-center cursor-pointer', className)}>
        <Text className={clsx('text-center font-semibold bg-transparent', className)} {...props}>
        {children}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default ButtonView
