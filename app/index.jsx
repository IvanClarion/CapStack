import React, { useEffect } from 'react';
import Logo from '../assets/icons/capstackLogo.svg';
import '../assets/stylesheet/global.css';
import { supabase } from '../database/lib/supabase';
import { Link } from 'expo-router';
import { Mail, Eye } from 'lucide-react-native';
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
import SectionView from '../components/layout/SectionView';
import { logError, logInfo } from '../utils/errorLogger';
/**
 * Main sign-in screen component
 * Handles user authentication and navigation to sign-up
 */
const index = ({ navigation }) => {
  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('test-table').select('*').limit(1);
        if (error) {
          logError(error, 'Supabase Connection Test', { table: 'test-table' });
        } else {
          logInfo('Supabase connection successful', 'Database Connection', {
            recordCount: data?.length || 0,
          });
        }
      } catch (error) {
        logError(error, 'Supabase Connection Test - Unexpected Error');
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
      >
        {/* Main authentication card container */}
        <ThemeCard className="authCard themeCard">
          {/* Header section with logo and welcome message */}
          <LayoutView className="flex items-center w-full text-center">
            <LayoutView className="flex justify-center items-center w-full">
              <ThemeIcon>
                <Logo />
              </ThemeIcon>
              <ThemeText className="text-center">
                Welcome to Capstack please signin to continue
              </ThemeText>
            </LayoutView>
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

          {/* Sign in button */}
          <GeneralButton className="generalbutton w-full">Sign In</GeneralButton>

          {/* Social authentication section */}
          <SectionView className="w-full">
            {/* Divider with "or Sign In with" text */}
            <LayoutView className="flex-row items-center w-full my-4">
              <View className="flex-1 h-[1px] bg-gray-300" />
              <ThemeText className="px-3">or Sign In with</ThemeText>
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
          </SectionView>

          {/* Sign up navigation link */}
          <LayoutView>
            <ThemeText>
              Don't have account yet?
              <Link href="SignUp">
                <ThemeText className="underline font-semibold cursor-pointer">Sign Up</ThemeText>
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

export default index;
