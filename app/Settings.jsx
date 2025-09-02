import { View, Text } from 'react-native'
import React from 'react'
import WebView from '../components/ui/WebView'
import '../assets/stylesheet/global.css'
import NavSettings from '../components/navBar/NavSettings'
import ThemeCard from '../components/ui/ThemeCard'
import ThemeMain from '../components/ui/ThemeMain'
import ButtonView from '../components/buttons/ButtonView'
const Settings = () => {
  return (
  <ThemeMain>
    <WebView className='w-full lg:max-w-[25%] rounded-none lg:rounded-r-2xl flex-1'>
      <ThemeCard className='rounded-none flex-1'>
        <NavSettings/>
      </ThemeCard>
    </WebView>
  </ThemeMain>
  )
}

export default Settings