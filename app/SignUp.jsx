import React, { useState } from 'react'
import Logo from '../assets/icons/capstackLogo.svg'
import '../assets/stylesheet/global.css'
import { useSignUp } from '../database/auth/SignUp'
import { Link } from 'expo-router'
import { Mail, Eye, User } from 'lucide-react-native'
import { AntDesign } from '@expo/vector-icons'
import { ImageBackground, View, Text } from 'react-native'
import ThemeCard from '../components/ui/ThemeCard'
import ThemeBody from '../components/ui/ThemeBody'
import ThemeText from '../components/ui/ThemeText'
import LayoutView from '../components/layout/LayoutView'
import InputView from '../components/input/InputView'
import WrapperView from '../components/input/WrapperView'
import ThemeIcon from '../components/ui/ThemeIcon'
import ButtonView from '../components/buttons/ButtonView'
import GeneralButton from '../components/buttons/GeneralButton'
import { googleOAuth } from '../database/auth/GoogleSignUp'
import { faceBookOAuth } from '../database/auth/FaceBookSignUp'
import { useNavigation } from 'expo-router'
const SignUp = () => {
  const naviagateTo = useNavigation();
  const [email,setEmail] = useState('');
  const [name,setName] = useState('');
  const [password,setPassword] = useState('');
  const [message,setMessage] = useState('');

  const handleSubmit = async()=>{
      if (!name.trim() || !password.trim() || !email.trim()){
        setMessage("All fields are required");
        return;
      }
      try{
        const {data,error} = await useSignUp(name,email,password);
        if (error) throw error;
        naviagateTo.navigate('index');
      }catch(error){
        setMessage(error.message);
      }
  }
  return (
    <>
      <ImageBackground source={require('../assets/images/PanelBG.png')} className='authBody overflow-hidden p-2'
      blurRadius={2}
      resizeMode="cover"
      >
        <ThemeCard className='authCard'>
          <LayoutView className='flex items-center w-full  text-center'>
            <LayoutView className='flex justify-center items-center w-full'>
              <ThemeIcon><Logo/></ThemeIcon>
                <ThemeText className='text-center'>Welcome to Capstack please sign up to continue</ThemeText>
              </LayoutView>
            </LayoutView>
           {message ? (  <Text className='font-semibold color-RosePink'>{message}</Text>) : null}
            <LayoutView className='w-full grid gap-2'>
              <ThemeText className='cardlabel'>Name</ThemeText>
              <WrapperView className='inputWrapper'>
                <InputView placeholder='Name' className='generalInput'
                value={name}
                onChangeText={setName}
                
                />
                <ThemeIcon><User/></ThemeIcon>
              </WrapperView>
            </LayoutView>
            <LayoutView className='w-full grid gap-2'>
              <ThemeText className='cardlabel'>Email</ThemeText>
              <WrapperView className='inputWrapper'>
                <InputView placeholder='Email' className='generalInput'
                value={email}
                onChangeText={setEmail}
                />
                <ThemeIcon><Mail /></ThemeIcon>
              </WrapperView>
            </LayoutView>
            <LayoutView className='w-full grid gap-2'>
              <ThemeText className='cardlabel'>Password</ThemeText>
              <WrapperView className='inputWrapper'>
                <InputView placeholder='Password' className='generalInput' secureTextEntry 
                
                value={password}
                onChangeText={setPassword}
                />
                <ThemeIcon><Eye /></ThemeIcon>
              </WrapperView>
            </LayoutView>
            <GeneralButton className='generalbutton' onPress={handleSubmit}>Sign Up</GeneralButton>
            <LayoutView className='w-full'>
             <LayoutView className="flex-row items-center w-full my-4">
                  {/* Left line */}
                  <View className="flex-1 h-[1px] bg-gray-300" />

                  {/* Center text */}
                  <ThemeText className="px-3">
                    or Sign Up with
                  </ThemeText>

                  {/* Right line */}
                  <View className="flex-1 h-[1px] bg-gray-300" />
              </LayoutView>
             <LayoutView className='flex-row w-full gap-1 '>
              <ButtonView className='ascentButton flex-1' onPress={googleOAuth}>
                <WrapperView className='flex-row items-center gap-2'>
                <AntDesign name="google" size={18} color='white' />
                </WrapperView>
              </ButtonView>
              <ButtonView className='ascentButton flex-1' onPress={faceBookOAuth}>
                <WrapperView className='flex-row items-center gap-2'>
                <AntDesign name="facebook-square" size={20} color="white" />
                </WrapperView>
              </ButtonView>
            </LayoutView>
            </LayoutView>
            <LayoutView>
              <ThemeText>Already have an account? <Link href='/'>
                <ThemeText className='underline font-semibold cursor-pointer'>Sign In</ThemeText>
              </Link></ThemeText>
            </LayoutView>
          </ThemeCard>
      </ImageBackground>
    </>
  )
}



export default SignUp