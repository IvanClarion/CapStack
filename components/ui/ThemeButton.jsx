import { TouchableWithoutFeedback, useColorScheme,View} from 'react-native'
import React from 'react'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'
const ThemeButton = ({children, className, ...props}) => {
    const colorScheme = useColorScheme();
  return (
    <TouchableWithoutFeedback {...props}>
        <View className={clsx('ascentButton',colorScheme === "dark"? 'color-white' : 'color-black', className)} >
        {children}
        </View>
    </TouchableWithoutFeedback>
  )
}

export default ThemeButton