import { View, Text } from 'react-native'
import { Trash,Calendar, Heart } from 'lucide-react-native'
import React from 'react'
import ThemeText from '../../../components/ui/ThemeText'
import ThemeCard from '../../../components/ui/ThemeCard'
import LayoutView from '../../../components/layout/LayoutView'
import ButtonView from '../../../components/buttons/ButtonView'
import WrapperView from '../../../components/input/WrapperView'
import ThemeIcon from '../../../components/ui/ThemeIcon'
const ArchivesMain = () => {
  return (
    <>
    <LayoutView  className='grid item gap-3 m-5 lg:grid-cols-3'>
       <ThemeCard className='flex gap-5'>
            <WrapperView className='flex flex-row items-center justify-between'>
                <ThemeText className='cardHeader flex-1'>Saved Project</ThemeText>
                <Heart 
                color={'gray'}
                />
            </WrapperView>
            <WrapperView className='flex-row items-center flex gap-3'>
                <ThemeIcon><Calendar size={15}/></ThemeIcon>
                <ThemeText className='text-xs'>12/27/09</ThemeText>
            </WrapperView>
            <WrapperView className='flex-row gap-2'>
                <ButtonView className='flex-1 simpleButton'>View</ButtonView>
                <ButtonView className='deleteIcon flex'><ThemeIcon><Trash size={18}/></ThemeIcon></ButtonView>
            </WrapperView>
        </ThemeCard>

        <ThemeCard className='flex gap-5'>
           <WrapperView className='flex flex-row items-start justify-between'>
                <ThemeText className='cardHeader flex-1'>Saved Project Demo asdaddadasd</ThemeText>
                <Heart 
                color={'gray'}
                />
            </WrapperView>
            <WrapperView className='flex-row items-center flex gap-3'>
                <ThemeIcon><Calendar size={15}/></ThemeIcon>
                <ThemeText className='text-xs'>12/27/09</ThemeText>
            </WrapperView>
            <WrapperView className='flex-row gap-2'>
                <ButtonView className='flex-1 simpleButton'>View</ButtonView>
                <ButtonView className='deleteIcon flex'><ThemeIcon><Trash size={18}/></ThemeIcon></ButtonView>
            </WrapperView>
        </ThemeCard>

        <ThemeCard className='flex gap-5'>
            <WrapperView className='flex flex-row items-center justify-between'>
                <ThemeText className='cardHeader flex-1'>It capstone</ThemeText>
                <Heart 
                color={'gray'}
                />
            </WrapperView>
            <WrapperView className='flex-row items-center flex gap-2'>
                <ThemeIcon><Calendar size={15}/></ThemeIcon>
                <ThemeText className='text-xs'>12/27/09</ThemeText>
            </WrapperView>
            <WrapperView className='flex-row gap-2'>
                <ButtonView className='flex-1 simpleButton'>View</ButtonView>
                <ButtonView className='deleteIcon flex'><ThemeIcon><Trash size={18}/></ThemeIcon></ButtonView>
            </WrapperView>
        </ThemeCard>

        <ThemeCard className='flex gap-5'>
            <WrapperView className='flex flex-row items-center justify-between'>
                <ThemeText className='cardHeader flex-1'>Wapatay Survey Oi!!</ThemeText>
                <Heart 
                color={'gray'}
                />
            </WrapperView>
            <WrapperView className='flex-row items-center flex gap-2'>
                <ThemeIcon><Calendar size={15}/></ThemeIcon>
                <ThemeText className='text-xs'>12/27/09</ThemeText>
            </WrapperView>
            <WrapperView className='flex-row gap-2'>
                <ButtonView className='flex-1 simpleButton'>View</ButtonView>
                <ButtonView className='deleteIcon flex'><ThemeIcon><Trash size={18}/></ThemeIcon></ButtonView>
            </WrapperView>
        </ThemeCard>

        <ThemeCard className='flex gap-5'>
           <WrapperView className='flex flex-row items-center justify-between'>
                <ThemeText className='cardHeader flex-1'>Ivan === Joshua Garcia</ThemeText>
                <Heart 
                color={'gray'}
                />
            </WrapperView>
            <WrapperView className='flex-row items-center flex gap-2'>
                <ThemeIcon><Calendar size={15}/></ThemeIcon>
                <ThemeText className='text-xs'>12/27/09</ThemeText>
            </WrapperView>
            <WrapperView className='flex-row gap-2'>
                <ButtonView className='flex-1 simpleButton'>View</ButtonView>
                <ButtonView className='deleteIcon flex'><ThemeIcon><Trash size={18}/></ThemeIcon></ButtonView>
            </WrapperView>
        </ThemeCard>
    </LayoutView>
    </>
  )
}

export default ArchivesMain