import React, { useState } from 'react'
import Logo from '../assets/icons/capstackLogo.svg'
import '../assets/stylesheet/global.css'
import { useSignUp } from '../database/auth/SignUp'
import { Link, useNavigation } from 'expo-router'
import { Mail, Eye, User, Phone } from 'lucide-react-native'
import { AntDesign } from '@expo/vector-icons'
import { ImageBackground, View, Text, TouchableOpacity } from 'react-native'
import ScrollViews from '../components/ui/ScrollView'
import ThemeCard from '../components/ui/ThemeCard'
import ThemeText from '../components/ui/ThemeText'
import LayoutView from '../components/layout/LayoutView'
import InputView from '../components/input/InputView'
import WrapperView from '../components/input/WrapperView'
import ThemeIcon from '../components/ui/ThemeIcon'
import ButtonView from '../components/buttons/ButtonView'
import GeneralButton from '../components/buttons/GeneralButton'
import { googleOAuth } from '../database/auth/GoogleSignUp'
import { faceBookOAuth } from '../database/auth/FaceBookSignUp'

const SignUp = () => {
  const navigateTo = useNavigation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim()) {
      setMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const { data, error } = await useSignUp(name, email, password, phone);
      if (error) throw error;
      console.log("Signed up user:", data.user);
      navigateTo.navigate('index');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/PanelBG.png')}
      className='authBody overflow-hidden p-2'
      blurRadius={2}
      resizeMode="cover"
    >
      <ScrollViews>
        <ThemeCard className='authCard'>
          <LayoutView className='flex items-center w-full text-center'>
            <LayoutView className='flex justify-center items-center w-full'>
              <ThemeIcon><Logo /></ThemeIcon>
              <ThemeText className='text-center'>
                Welcome to Capstack, please sign up to continue
              </ThemeText>
            </LayoutView>
          </LayoutView>

          {message ? (
            <Text className='font-semibold text-rose-500'>{message}</Text>
          ) : null}

          {/* Name */}
          <LayoutView className='w-full grid gap-2'>
            <ThemeText className='cardlabel'>Name</ThemeText>
            <WrapperView className='inputWrapper'>
              <InputView
                placeholder='Name'
                className='generalInput'
                value={name}
                onChangeText={setName}
              />
              <ThemeIcon><User /></ThemeIcon>
            </WrapperView>
          </LayoutView>

          {/* Email */}
          <LayoutView className='w-full grid gap-2'>
            <ThemeText className='cardlabel'>Email</ThemeText>
            <WrapperView className='inputWrapper'>
              <InputView
                placeholder='Email'
                className='generalInput'
                value={email}
                onChangeText={setEmail}
              />
              <ThemeIcon><Mail /></ThemeIcon>
            </WrapperView>
          </LayoutView>

          <LayoutView className='w-full grid gap-2'>
            <ThemeText className='cardlabel'>Phone Number</ThemeText>
            <WrapperView className='inputWrapper'>
              <InputView
                placeholder='Number'
                className='generalInput'
                keyboardType="numeric"
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              />
              <ThemeIcon><Phone /></ThemeIcon>
            </WrapperView>
          </LayoutView>

          {/* Password */}
          <LayoutView className='w-full grid gap-2'>
            <ThemeText className='cardlabel'>Password</ThemeText>
            <WrapperView className='inputWrapper flex-row items-center'>
              <InputView
                placeholder='Password'
                className='generalInput flex-1'
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <ThemeIcon><Eye /></ThemeIcon>
              </TouchableOpacity>
            </WrapperView>
          </LayoutView>

          {/* Confirm Password */}
          <LayoutView className='w-full grid gap-2'>
            <ThemeText className='cardlabel'>Confirm Password</ThemeText>
            <WrapperView className='inputWrapper flex-row items-center'>
              <InputView
                placeholder='Confirm Password'
                className='generalInput flex-1'
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <ThemeIcon><Eye /></ThemeIcon>
              </TouchableOpacity>
            </WrapperView>
          </LayoutView>

          <GeneralButton className='generalbutton' onPress={handleSubmit}>
            Sign Up
          </GeneralButton>

          {/* OAuth buttons */}
          <LayoutView className='w-full'>
            <LayoutView className="flex-row items-center w-full my-4">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <ThemeText className="px-3">or Sign Up with</ThemeText>
              <View className="flex-1 h-[1px] bg-gray-300" />
            </LayoutView>

            <LayoutView className='flex-row w-full gap-1'>
              <ButtonView className='ascentButton p-2 flex-1' onPress={googleOAuth}>
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
            <ThemeText>
              Already have an account?{" "}
              <Link href='/'>
                <ThemeText className='underline font-semibold cursor-pointer'>
                  Sign In
                </ThemeText>
              </Link>
            </ThemeText>
          </LayoutView>
        </ThemeCard>
      </ScrollViews>
    </ImageBackground>
  )
}

export default SignUp
