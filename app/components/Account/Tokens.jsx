import { View, Text } from 'react-native'
import React, {Suspense} from 'react'
import { ArrowDownLeft,Diamond,Circle,LayoutDashboard,ArrowUpRight } from 'lucide-react-native'
import ThemeText from '../../../components/ui/ThemeText'
import LayoutView from '../../../components/layout/LayoutView'
import WrapperView from '../../../components/input/WrapperView'
import ThemeIcon from '../../../components/ui/ThemeIcon'
import ThemeCard from '../../../components/ui/ThemeCard'
import ThemeBody from '../../../components/ui/ThemeBody'
import DashboardChart from './DashboardChart'
import '../../../assets/stylesheet/global.css'
const Tokens = () => {
  return (
    <ThemeCard className='m-2 grid gap-5'>
        <LayoutView className='grid gap-5'>
            <WrapperView className='flex flex-row gap-2 items-center'>
                <ThemeIcon className='iconWrapper'><LayoutDashboard/></ThemeIcon>
                <ThemeText className='cardHeader'>Dashboard</ThemeText>
            </WrapperView>
        </LayoutView>
        <LayoutView className='tokensInfoLayout'>
            <ThemeBody className='tokensBodyContainer'>
                <WrapperView className='flex-row p-2 gap-1 items-center'>
                    <Circle size={10} fill={'#667EEA'} color={'#667EEA'}/>
                    <ThemeText className='text-lg font-semibold'>Total Tokens</ThemeText>
                </WrapperView>  
                <WrapperView  className='flex-row justify-center gap-1 p-2 items-center'>
                    <Diamond size={25} color={'#667EEA'}/>
                    <ThemeText className='cardHeader'>1,000,000</ThemeText>
                </WrapperView>
            </ThemeBody>
             <ThemeBody className='tokensBodyContainer'>
                <WrapperView className='flex-row p-2 gap-1 items-center'>
                    <Circle size={10} fill={'#FF6060'} color={'#FF6060'}/>
                    <ThemeText className='text-lg font-semibold'>Token Used</ThemeText>
                </WrapperView>  
                <WrapperView  className='flex-row justify-center gap-1 p-2 items-center'>
                    <ArrowDownLeft size={25} color={'#FF6060'}/>
                    <ThemeText className='cardHeader'>10,000</ThemeText>
                </WrapperView>
            </ThemeBody>
            <ThemeBody className='tokensBodyContainer'>
                <WrapperView className='flex-row p-2 gap-1 items-center'>
                    <Circle size={10} fill={'#22C55E'} color={'#22C55E'}/>
                    <ThemeText className='text-lg font-semibold'>Remaining Tokens</ThemeText>
                </WrapperView>  
                <WrapperView  className='flex-row justify-center gap-1 p-2 items-center'>
                    <ArrowUpRight size={25} color={'#22C55E'}/>
                    <ThemeText className='cardHeader'>900,000</ThemeText>
                </WrapperView>
            </ThemeBody>
        </LayoutView>
        <LayoutView className='grid gap-2'>
            <ThemeText className='cardHeader'>Usage Summary</ThemeText>
            <DashboardChart/>
        </LayoutView>
    </ThemeCard>
  )
}

export default Tokens