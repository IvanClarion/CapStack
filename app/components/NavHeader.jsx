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

    <ThemeBody className="flex-row overflow-visible relative bg-none  justify-between items-center p-0 w-full  gap-0">
      <MenuBar/>
    <WrapperView className='p-2 rounded-full'>
      <ProfileIcon/>
    </WrapperView>
    </ThemeBody>


     </>
   )
 }
 
 export default NavHeader