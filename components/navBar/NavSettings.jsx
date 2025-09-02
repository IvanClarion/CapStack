import { View, Text } from 'react-native'
import { Link } from 'expo-router'
import { User, Settings, ReceiptText,MessageSquareWarning,ArrowLeftRight } from 'lucide-react-native'
import React from 'react'
import LayoutView from '../layout/LayoutView'
import ThemeBody from '../ui/ThemeBody'
import ThemeText from '../ui/ThemeText'
import ThemeIcon from '../ui/ThemeIcon'
import '../../assets/stylesheet/global.css'
import WrapperView from '../input/WrapperView'
const NavSettings = () => {
  return (
    <LayoutView className='grid gap-5'>
        <WrapperView className='flex flex-row items-center gap-2 justify-center'>
            <Settings color={'#FF6060'}/>
            <ThemeText className='cardHeader'>Settings</ThemeText>
        </WrapperView>
        <Link href='/Account'>
        <WrapperView className='settingNav'>
            <ThemeIcon><User/></ThemeIcon>
            <ThemeText className='cardlabel'>Account</ThemeText>
        </WrapperView>
        </Link>
        <WrapperView className='settingNav'>
            <ThemeIcon><ReceiptText/></ThemeIcon>
            <ThemeText className='cardlabel'>Bills</ThemeText>
        </WrapperView>
        <WrapperView className='settingNav'>
            <ThemeIcon><ArrowLeftRight/></ThemeIcon>
            <ThemeText className='cardlabel'>Transaction</ThemeText>
        </WrapperView>
        <WrapperView className='settingNav'>
            <ThemeIcon><MessageSquareWarning/></ThemeIcon>
            <ThemeText className='cardlabel'>Report</ThemeText>
        </WrapperView>
    </LayoutView>
  )
}

export default NavSettings