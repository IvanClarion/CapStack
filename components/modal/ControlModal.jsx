

import { View, Dimensions, useColorScheme, Modal, TouchableHighlight } from 'react-native'
import React from 'react'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'
import ThemeCard from '../ui/ThemeCard'
import { ArrowLeft } from 'lucide-react-native'
import ThemeBody from '../ui/ThemeBody'
import { BlurView } from 'expo-blur'
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
        <View
          className={clsx(
            'absolute bottom-0 p-2 left-0 right-0 lg:mx-20 rounded-t-2xl rounded-b-none',
            colorMode === 'dark' ? 'bg-secondaryCard' : 'bg-white',
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
