import { View, Text,ScrollView  } from 'react-native'
import { ArchiveIcon } from 'lucide-react-native'
import React from 'react'
import ArchivesMain from './components/archives/ArchivesMain'
import LayoutView from '../components/layout/LayoutView'
import ThemeMain from '../components/ui/ThemeMain'
import ThemeText from '../components/ui/ThemeText'
import WrapperView from '../components/input/WrapperView'
import ThemeIcon from '../components/ui/ThemeIcon'
import HeaderView from '../components/ui/HeaderView'
import '../assets/stylesheet/global.css'
const Archive = () => {
  return (
    <>
    <ThemeMain>
   
    <ScrollView>
    <WrapperView className='m-5 gap-2 flex-row items-center justify-center'>
    <ThemeIcon><ArchiveIcon size={20}/></ThemeIcon>
    <ThemeText className='cardHeader text-center'>Archive</ThemeText>
    </WrapperView>
    <WrapperView className='flex'>
      <ArchivesMain/>
    </WrapperView>
    </ScrollView>
    </ThemeMain>
    </>
  )
}

export default Archive