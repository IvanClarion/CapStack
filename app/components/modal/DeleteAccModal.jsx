import { View, Text,Alert } from 'react-native'

import { OctagonAlert } from 'lucide-react-native'
import { deleteCurrentUser } from '../../../database/auth/DeleteAccount'
import '../../../assets/stylesheet/global.css'
import ThemeIcon from '../../../components/ui/ThemeIcon'
import ButtonView from '../../../components/buttons/ButtonView'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import React from 'react'
import FloatingModal from '../../../components/modal/FloatingModal'
import ThemeText from '../../../components/ui/ThemeText'
const DeleteAccModal = ({visible, onClose, ...props}) => {
  return (
    <FloatingModal visible={visible} onRequestClose={onClose} {...props}>
        <LayoutView className='self-center'>
        <OctagonAlert size={'40px'} color={'#FF6060'} className='size-10 text-RosePink'/>
        </LayoutView>
        <LayoutView className='text-center'>
            <WrapperView className='self-center text-center items-center gap-2'>
            <ThemeText className='cardHeader'>Delete Your Account?</ThemeText>
            <ThemeText>This is action is not reversible</ThemeText>
            </WrapperView>
        </LayoutView>
        <LayoutView className='flex flex-row gap-2'>
                    <ButtonView className='simpleButton flex-1' onPress={onClose}>Cancel</ButtonView>
                    <ButtonView className='deleteBtn2 flex-1' onPress={deleteCurrentUser}>Delete</ButtonView>
        </LayoutView>
    </FloatingModal>
  )
}

export default DeleteAccModal