import { View, Text } from 'react-native'
import { Image } from 'react-native'
import '../../assets/stylesheet/global.css'
import React from 'react'
const ProfileIcon = () => {
  return (
    <View >
    <Image
    source={require('../../assets/images/defaultProfile.png')}
    resizeMode="cover"
    classname='p-2'
    />
    </View>
  )
}

export default ProfileIcon