import React from 'react';
import { TouchableOpacity,Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css'
import ThemeText from '../ui/ThemeText'
const GeneralButton = ({ children, className, ...props }) => {
  return (
    <TouchableOpacity className='generalbutton  overflow-hidden' {...props}>
      <LinearGradient
        colors={['#DF5A9A', '#4B3381']}
        className={clsx('p-3  rounded-2xl android:p-5', className)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text className='text-center text-white font-semibold'>
          {children}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};


export default GeneralButton;