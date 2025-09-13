import { View, Dimensions, useColorScheme, Modal, TouchableHighlight, TouchableWithoutFeedback } from 'react-native'
import React from 'react'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'

import { ArrowLeft } from 'lucide-react-native'

const ControlModal = ({ visible, onRequestClose, children, className, ...props }) => {
  const { height } = Dimensions.get('window')
  const colorMode = useColorScheme()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View className="flex-1 bg-black/50" />
      </TouchableWithoutFeedback>

      <View
        className={clsx(
          'absolute bottom-0 p-2 left-0 right-0 rounded-t-2xl rounded-b-none bg-secondaryCard',
          'lg:inset-0 lg:w-[60%] lg:m-auto lg:rounded-2xl',
          className
        )}
        style={{
          height: height * 0.7,
        }}
        {...props}
      >
        <TouchableHighlight
          onPress={onRequestClose}
          className="p-1 bg-RosePink font-semibold rounded-full self-start"
        >
          <ArrowLeft color={'white'} />
        </TouchableHighlight>
        <View className="flex-1 p-4">{children}</View>
      </View>
    </Modal>
  )
}

export default ControlModal
