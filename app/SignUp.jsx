import React, { useEffect } from 'react';
import Logo from '../assets/icons/capstackLogo.svg';
import '../assets/stylesheet/global.css';
import { supabase } from '../database/lib/supabase';
import { Link } from 'expo-router';
import { Mail, Eye, User } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { ImageBackground, StyleSheet, View } from 'react-native';
import ThemeCard from '../components/ui/ThemeCard';
import ThemeText from '../components/ui/ThemeText';
import LayoutView from '../components/layout/LayoutView';
import InputView from '../components/input/InputView';
import WrapperView from '../components/input/WrapperView';
import ThemeIcon from '../components/ui/ThemeIcon';
import ButtonView from '../components/buttons/ButtonView';
import GeneralButton from '../components/buttons/GeneralButton';
import { logError, logInfo } from '../utils/errorLogger';
/**
 * Sign-up screen component
 * Handles new user registration and navigation to sign-in
 */
const SignUp = ({ navigation }) => {
  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('test-table').select('*').limit(1);
        if (error) {
          logError(error, 'Supabase Connection Test - SignUp', { table: 'test-table' });
        } else {
          logInfo('Supabase connection successful', 'Database Connection - SignUp', {
            recordCount: data?.length || 0,
          });
        }
      } catch (error) {
        logError(error, 'Supabase Connection Test - SignUp Unexpected Error');
      }
    };
    testConnection();
  }, []);

  return (
    <>
      {/* Main authentication background with blur effect */}
      <ImageBackground
        source={require('../assets/images/PanelBG.png')}
        className="authBody p-2"
        blurRadius={2}
        resizeMode="cover"
      >
        {/* Main sign-up card container */}
        <ThemeCard className="authCard">
          {/* Header section with logo and welcome message */}
          <LayoutView className="flex items-center w-full text-center">
            <LayoutView className="flex justify-center items-center w-full">
              <ThemeIcon>
                <Logo />
              </ThemeIcon>
              <ThemeText className="text-center">
                Welcome to Capstack please sign up to continue
              </ThemeText>
            </LayoutView>
          </LayoutView>

          {/* Name input section */}
          <LayoutView className="w-full grid gap-2">
            <ThemeText className="cardlabel">Name</ThemeText>
            <WrapperView className="inputWrapper">
              <InputView placeholder="Name" className="generalInput" />
              <ThemeIcon>
                <User />
              </ThemeIcon>
            </WrapperView>
          </LayoutView>

          {/* Email input section */}
          <LayoutView className="w-full grid gap-2">
            <ThemeText className="cardlabel">Email</ThemeText>
            <WrapperView className="inputWrapper">
              <InputView placeholder="Email" className="generalInput" />
              <ThemeIcon>
                <Mail />
              </ThemeIcon>
            </WrapperView>
          </LayoutView>

          {/* Password input section */}
          <LayoutView className="w-full grid gap-2">
            <ThemeText className="cardlabel">Password</ThemeText>
            <WrapperView className="inputWrapper">
              <InputView placeholder="Password" className="generalInput" secureTextEntry />
              <ThemeIcon>
                <Eye />
              </ThemeIcon>
            </WrapperView>
          </LayoutView>

          {/* Sign up button */}
          <GeneralButton className="generalbutton">Sign Up</GeneralButton>

          {/* Social authentication section */}
          <LayoutView className="w-full">
            {/* Divider with "or Sign Up with" text */}
            <LayoutView className="flex-row items-center w-full my-4">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <ThemeText className="px-3">or Sign Up with</ThemeText>
              <View className="flex-1 h-[1px] bg-gray-300" />
            </LayoutView>

            {/* Social authentication buttons */}
            <LayoutView className="flex-row w-full gap-1">
              <ButtonView className="ascentButton flex-1">
                <WrapperView className="flex-row items-center gap-2">
                  <AntDesign name="google" size={18} color="white" />
                </WrapperView>
              </ButtonView>
              <ButtonView className="ascentButton flex-1">
                <WrapperView className="flex-row items-center gap-2">
                  <AntDesign name="facebook-square" size={20} color="white" />
                </WrapperView>
              </ButtonView>
            </LayoutView>
          </LayoutView>

          {/* Sign in navigation link */}
          <LayoutView>
            <ThemeText>
              Already have an account?
              <Link href="/">
                <ThemeText className="underline font-semibold cursor-pointer">Sign In</ThemeText>
              </Link>
            </ThemeText>
          </LayoutView>
        </ThemeCard>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  panelBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover', // or 'stretch', 'contain'
  },
});

export default SignUp;
