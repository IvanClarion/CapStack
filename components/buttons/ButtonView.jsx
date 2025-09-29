import { TouchableWithoutFeedback, View } from 'react-native'
import React from 'react'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'
import ThemeText from '../ui/ThemeText'

const ButtonView = React.forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <TouchableWithoutFeedback {...props}>
        <View
          ref={ref}
          className={clsx('flex p-2 android:p-3 items-center font-semibold justify-center cursor-pointer', className)}
        >
          <ThemeText
            className={clsx('text-center outline-none border-0 font-semibold bg-transparent', className)}
          >
            {children}
          </ThemeText>
        </View>
      </TouchableWithoutFeedback>
    )
  }
)

export default ButtonView