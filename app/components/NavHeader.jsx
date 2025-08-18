 import { View, Text } from 'react-native'
 import React from 'react'
 import MenuBar from '../../components/navBar/MenuBar'
 import '../../assets/stylesheet/global.css'
 import WrapperView from '../../components/input/WrapperView'
 import ProfileIcon from '../../components/profile/ProfileIcon'
 const NavHeader = () => {
   return (
    <>

    <View className="flex-row  justify-between items-center p-0 w-full  gap-5">
      <MenuBar/>
    <WrapperView className='p-2 rounded-full overflow-hidden'>
      <ProfileIcon/>
    </WrapperView>
    </View>


     </>
   )
 }
 
 export default NavHeader