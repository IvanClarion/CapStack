import React from 'react'
import Logo from '../assets/icons/capstackLogo.svg'
import PanelBg from '../assets/images/PanelBG.png'
import { BlurView } from 'expo-blur'
import '../assets/stylesheet/global.css'
import { useEffect } from 'react'
import { supabase } from '../database/lib/supabase'
import { Link } from 'expo-router'
import { Mail, Eye } from 'lucide-react-native'
import { AntDesign } from '@expo/vector-icons'
import { ImageBackground, StyleSheet,TouchableOpacity, View } from 'react-native'
import ThemeCard from '../components/ui/ThemeCard'
import ThemeBody from '../components/ui/ThemeBody'
import ThemeText from '../components/ui/ThemeText'
import LayoutView from '../components/layout/LayoutView'
import InputView from '../components/input/InputView'
import WrapperView from '../components/input/WrapperView'
import ThemeIcon from '../components/ui/ThemeIcon'
import ButtonView from '../components/buttons/ButtonView'
import ThemeButton from '../components/ui/ThemeButton'
import GeneralButton from '../components/buttons/GeneralButton'
import  SectionView from '../components/layout/SectionView'
const index = ({navigation}) => {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('test-table').select('*').limit(1);
      if (error) {
        console.error("Supabase Error:", error);
      } else {
        console.log("Supabase Connected ✅ Data:", data);
      }
    };
    testConnection();
  }, []);
  return (
    <>
      <ImageBackground source={require('../assets/images/PanelBG.png')} className='authBody p-2'
      blurRadius={2}
      >
        <ThemeCard className='authCard themeCard'>
          <LayoutView className='flex items-center w-full  text-center'>
            <LayoutView className='flex justify-center items-center w-full'>
              <ThemeIcon><Logo/></ThemeIcon>
                <ThemeText className='text-center'>Welcome to Capstack please signin to continue</ThemeText>
              </LayoutView>
            </LayoutView>
            <LayoutView className='w-full grid gap-2'>
              <ThemeText className='cardlabel'>Email</ThemeText>
              <WrapperView className='inputWrapper'>
                <InputView placeholder='Email' className='generalInput' />
                <ThemeIcon><Mail /></ThemeIcon>
              </WrapperView>
            </LayoutView>
            <LayoutView className='w-full grid gap-2'>
              <ThemeText className='cardlabel'>Password</ThemeText>
              <WrapperView className='inputWrapper'>
                <InputView placeholder='Password' className='generalInput' secureTextEntry />
                <ThemeIcon><Eye /></ThemeIcon>
              </WrapperView>
            </LayoutView>
            
            <GeneralButton className='generalbutton w-full'>Sign In</GeneralButton>
            <SectionView className='w-full'>
             <LayoutView className="flex-row items-center w-full my-4">
                  {/* Left line */}
                  <View className="flex-1 h-[1px] bg-gray-300" />

                  {/* Center text */}
                  <ThemeText className="px-3">
                    or Sign In with
                  </ThemeText>

                  {/* Right line */}
                  <View className="flex-1 h-[1px] bg-gray-300" />
              </LayoutView>
              <LayoutView className='flex-row w-full gap-1 '>
              <ButtonView className='ascentButton flex-1'>
                <WrapperView className='flex-row items-center gap-2'>
                <AntDesign name="google" size={18} color='white' />
                </WrapperView>
              </ButtonView>
              <ButtonView className='ascentButton flex-1'>
                <WrapperView className='flex-row items-center gap-2'>
                <AntDesign name="facebook-square" size={20} color="white" />
                </WrapperView>
              </ButtonView>
            </LayoutView>
            </SectionView>
            <LayoutView>
              <ThemeText>Don't have account yet? <Link href='SignUp'>
                <ThemeText className='underline font-semibold cursor-pointer'>Sign Up</ThemeText>
              </Link></ThemeText>
            </LayoutView>
          </ThemeCard>
        
      </ImageBackground>
    </>
  )
}

const styles = StyleSheet.create({
  panelBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover', // or 'stretch', 'contain'
  },
})

export default index