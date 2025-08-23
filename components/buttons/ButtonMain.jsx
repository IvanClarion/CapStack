import React from 'react';
import { TouchableOpacity,Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css'

const ButtonMain = ({children, className, ...props}) => {
  return (
     <TouchableOpacity {...props}>
          <LinearGradient
            locations={[0, 0.7]} 
            colors={['#011F3D', '#764BA2']}
            className={clsx('mainButton android:p-5', className)}
            start={{ x: 0, y: 0 }}
             end={{ x: 1, y: 0 }}
          >
            <Text className='text-center text-lg  text-white font-semibold'>
            {children}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
  )
}

export default ButtonMain