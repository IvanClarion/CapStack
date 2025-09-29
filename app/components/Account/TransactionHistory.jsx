import { View, Text, ScrollView } from 'react-native'
import { ArrowDownRight } from 'lucide-react-native'
import React from 'react'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import ThemeText from '../../../components/ui/ThemeText'
import ThemeBody from '../../../components/ui/ThemeBody'
import '../../../assets/stylesheet/global.css'
import ThemeCard from '../../../components/ui/ThemeCard'
import ScrollViews from '../../../components/ui/ScrollView'
const TransactionHistory = () => {
  return (
  <ScrollView className='transactionScroll'
  nestedScrollEnabled
      showsVerticalScrollIndicator
  >
    <ThemeBody className='transactionCard'>
      
      <LayoutView className='gap-5'>
      <LayoutView className='gap-2 flex-row items-center'>
        <WrapperView className='transactionIcon'>
            <ArrowDownRight size={25} color={'#FF6060'}/>
        </WrapperView>
        <WrapperView className='flex-1'>
            <ThemeText className='text-lg font-semibold'>Subscription Fee</ThemeText>
            <ThemeText className='text-[10px]'>09/27/24</ThemeText>
        </WrapperView>
        <WrapperView className='transactionPrice'>
          <ThemeText className='font-bold text-sm color-RosePink'>P 1000.00</ThemeText>
        </WrapperView>
      </LayoutView>
      <LayoutView className='gap-2 flex-row items-center'>
        <WrapperView className='transactionIcon'>
            <ArrowDownRight size={25} color={'#FF6060'}/>
        </WrapperView>
        <WrapperView className='flex-1'>
            <ThemeText className='text-lg font-semibold'>Subscription Fee</ThemeText>
            <ThemeText className='text-[10px]'>09/27/24</ThemeText>
        </WrapperView>
        <WrapperView className='transactionPrice'>
          <ThemeText className='font-bold text-sm color-RosePink'>P 1000.00</ThemeText>
        </WrapperView>
      </LayoutView>
      <LayoutView className='gap-2 flex-row items-center'>
        <WrapperView className='transactionIcon'>
            <ArrowDownRight size={25} color={'#FF6060'}/>
        </WrapperView>
        <WrapperView className='flex-1'>
            <ThemeText className='text-lg font-semibold'>Subscription Fee</ThemeText>
            <ThemeText className='text-[10px]'>09/27/24</ThemeText>
        </WrapperView>
        <WrapperView className='transactionPrice'>
          <ThemeText className='font-bold text-sm color-RosePink'>P 1000.00</ThemeText>
        </WrapperView>
      </LayoutView>
      <LayoutView className='gap-2 flex-row items-center'>
        <WrapperView className='transactionIcon'>
            <ArrowDownRight size={25} color={'#FF6060'}/>
        </WrapperView>
        <WrapperView className='flex-1'>
            <ThemeText className='text-lg font-semibold'>Subscription Fee</ThemeText>
            <ThemeText className='text-[10px]'>09/27/24</ThemeText>
        </WrapperView>
        <WrapperView className='transactionPrice'>
          <ThemeText className='font-bold text-sm color-RosePink'>P 1000.00</ThemeText>
        </WrapperView>
      </LayoutView>
      <LayoutView className='gap-2 flex-row items-center'>
        <WrapperView className='transactionIcon'>
            <ArrowDownRight size={25} color={'#FF6060'}/>
        </WrapperView>
        <WrapperView className='flex-1'>
            <ThemeText className='text-lg font-semibold'>Subscription Fee</ThemeText>
            <ThemeText className='text-[10px]'>09/27/24</ThemeText>
        </WrapperView>
        <WrapperView className='transactionPrice'>
          <ThemeText className='font-bold text-sm color-RosePink'>P 1000.00</ThemeText>
        </WrapperView>
      </LayoutView>
      <LayoutView className='gap-2 flex-row items-center'>
        <WrapperView className='transactionIcon'>
            <ArrowDownRight size={25} color={'#FF6060'}/>
        </WrapperView>
        <WrapperView className='flex-1'>
            <ThemeText className='text-lg font-semibold'>Subscription Fee</ThemeText>
            <ThemeText className='text-[10px]'>09/27/24</ThemeText>
        </WrapperView>
        <WrapperView className='transactionPrice'>
          <ThemeText className='font-bold text-sm color-RosePink'>P 1000.00</ThemeText>
        </WrapperView>
      </LayoutView>
      </LayoutView>
      
    </ThemeBody>
    </ScrollView>
    
  )
}

export default TransactionHistory