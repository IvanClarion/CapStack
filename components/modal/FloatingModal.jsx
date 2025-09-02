import { View, Text,Modal } from 'react-native'
import React from 'react'
import ThemeBody from '../ui/ThemeBody'
import ThemeCard from '../ui/ThemeCard'
import ThemeText from '../ui/ThemeText'
import LayoutView from '../layout/LayoutView'
import WrapperView from '../input/WrapperView'
import clsx from 'clsx'
import '../../assets/stylesheet/global.css'

const FloatingModal = ({visible, onRequestClose, children,className, ...props }) => {
  return (
    <Modal visible={visible} 
    onRequestClose={onRequestClose} 
    transparent 
    animationType='fade'
    {...props} >
          <View className={clsx('floatModalBg', className)}>
                  <ThemeBody className='floatModalCard'>
                        {children}
                  </ThemeBody>
          </View>
    </Modal>
  )
}

export default FloatingModal