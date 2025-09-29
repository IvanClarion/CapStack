import { View, Text } from 'react-native'
import { ReceiptText,Crown,CalendarClock,BanknoteArrowUp,CircleStar,Wallet } from 'lucide-react-native'
import React from 'react'
import '../../../assets/stylesheet/global.css'
import ThemeCard from '../../../components/ui/ThemeCard'
import WrapperView from '../../../components/input/WrapperView'
import ThemeBody from '../../../components/ui/ThemeBody'
import ThemeText from '../../../components/ui/ThemeText'
import LayoutView from '../../../components/layout/LayoutView'
import ThemeIcon from '../../../components/ui/ThemeIcon'
import ButtonView from '../../../components/buttons/ButtonView'
const Bills = () => {
  return (
    <ThemeCard className=' overflow-hidden gap-5'>
        <LayoutView className='flex flex-row align-middle gap-2 items-center'>
            <WrapperView className='iconWrapper' >
                <ReceiptText color={'white'}/>
            </WrapperView>
            <WrapperView className='flex flex-1 flex-row items-center justify-between'>
                <ThemeText className='cardHeader'>Bills</ThemeText>
                <WrapperView className='basicUserTag'><Crown size={18} color={'white'}/><Text className='basicUserTagText'>Basic</Text></WrapperView>
            </WrapperView>
        </LayoutView>
        <LayoutView className=' flex flex-row items-stretch justify-center gap-2'>
            <ThemeBody className='themeBodyContainer'>
                <ThemeText className='cardlabel'>Due Date</ThemeText>
                <CalendarClock color={'#FF6060'}/>
                <ThemeText className='cardHeader'>12/10/25</ThemeText>
            </ThemeBody >
            <ThemeBody className='themeBodyContainer'>
                <ThemeText className='cardlabel'>Payable</ThemeText>
                <BanknoteArrowUp color={'#FF6060'}/>
                <ThemeText className='cardHeader'>$20.00</ThemeText>
            </ThemeBody>
        </LayoutView>
       <LayoutView className='flex-1 items-stretch justify-center gap-2'>
            <ThemeBody className='rounded-2xl gap-5 p-5'>
                <WrapperView>
                <ThemeText className='cardlabel'>Payment Method</ThemeText>
                <View className='line-section'/>
                </WrapperView>
                <WrapperView>
                    <ThemeText>No Linked Wallet</ThemeText>
                </WrapperView>
            </ThemeBody >
        </LayoutView>
        <LayoutView className='flex lg:flex-row w-full  items-stretch justify-start align-middle gap-2'>
            <ButtonView className='simpleButton android:border-none android:w-full android:border-0'>
           <WrapperView className='flex flex-row items-center gap-1'>
            <Wallet size={16} color={'white'}/>
               <Text className="font-semibold color-white">Connect Payment Method</Text>
            </WrapperView>
            </ButtonView>
        </LayoutView>
    </ThemeCard>
  )
}

export default Bills