import { View, Text } from 'react-native'
import ThemeCard from '../../components/ui/ThemeCard'
import React from 'react'
import MenuBar from '../../components/navBar/MenuBar'
import '../../assets/stylesheet/global.css'
import WrapperView from '../../components/input/WrapperView'
import ProfileIcon from '../../components/profile/ProfileIcon'
import { BlurView } from 'expo-blur'
import ThemeBody from '../../components/ui/ThemeBody'

const NavHeader = () => {
  return (
    <>
      <ThemeBody className="flex-row items-center justify-between p-0 w-full relative overflow-visible bg-none">
        <MenuBar />
      </ThemeBody>
    </>
  )
}

export default NavHeader