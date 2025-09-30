import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { Link, useNavigation } from 'expo-router';
import Logo from '../assets/icons/capstackLogo.svg';
import '../assets/stylesheet/global.css';
import { Mail, Eye } from 'lucide-react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';

import ThemeCard from '../components/ui/ThemeCard';
import ThemeText from '../components/ui/ThemeText';
import LayoutView from '../components/layout/LayoutView';
import InputView from '../components/input/InputView';
import WrapperView from '../components/input/WrapperView';
import ThemeIcon from '../components/ui/ThemeIcon';
import ButtonView from '../components/buttons/ButtonView';
import GeneralButton from '../components/buttons/GeneralButton';
import SectionView from '../components/layout/SectionView';

import { signIn } from '../database/auth/SignIn';
import { googleOAuth } from '../database/auth/GoogleSignUp';
import { faceBookOAuth } from '../database/auth/FaceBookSignUp';

const EXTERNAL_LANDING = 'https://capstackhome.netlify.app/';

export default function Index() {
  // WEB: redirect root to external marketing/landing page
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // use replace to keep browser history clean
      window.location.replace(EXTERNAL_LANDING);
    }
  }, []);

  // While the browser is navigating, show a light placeholder (web only)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.redirectWrap}>
        <ActivityIndicator />
        <Text style={styles.redirectText}>Redirecting to our home page…</Text>
      </View>
    );
  }

  // Native (iOS/Android) — render your sign-in screen
  return <MobileSignIn />;
}

function MobileSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage('All fields are required!');
      return;
    }
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setMessage(error.message || 'Sign In failed');
        return;
      }
      navigation.navigate('Main');
    } catch (error) {
      setMessage(error?.message || 'Sign In failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await googleOAuth();
      if (user) {
        navigation.navigate('Main');
      } else {
        setMessage('Google sign-in failed');
      }
    } catch (e) {
      setMessage(e?.message || 'Google sign-in failed');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/PanelBG.png')}
      style={styles.panelBg}
      blurRadius={2}
    >
      <ThemeCard className="authCard themeCard">
        <LayoutView className="flex items-center w-full  text-center">
          <LayoutView className="flex justify-center items-center w-full">
            <ThemeIcon>
              <Logo />
            </ThemeIcon>
            <ThemeText className="text-center">
              Welcome to Capstack, please sign in to continue
            </ThemeText>
          </LayoutView>
        </LayoutView>

        {message ? <Text className="font-semibold color-RosePink">{message}</Text> : null}

        <LayoutView className="w-full grid gap-2">
          <ThemeText className="cardlabel">Email</ThemeText>
          <WrapperView className="inputWrapper">
            <InputView
              placeholder="Email"
              className="generalInput"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (message) setMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ThemeIcon>
              <Mail />
            </ThemeIcon>
          </WrapperView>
        </LayoutView>

        <LayoutView className="w-full grid gap-2">
          <WrapperView className="flex flex-row items-center justify-between">
            <ThemeText className="cardlabel">Password</ThemeText>
            <Link href="EmailVerification">
              <ThemeText>Forgot Password?</ThemeText>
            </Link>
          </WrapperView>

          <WrapperView className="inputWrapper">
            <InputView
              placeholder="Password"
              className="generalInput"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (message) setMessage('');
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
              <ThemeIcon>
                <Eye />
              </ThemeIcon>
            </TouchableOpacity>
          </WrapperView>
        </LayoutView>

        <GeneralButton className="generalbutton w-full flex-1" onPress={handleSignIn}>
          Sign In
        </GeneralButton>

        <SectionView className="w-full">
          <LayoutView className="flex-row items-center w-full my-4">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <ThemeText className="px-3">or Sign In with</ThemeText>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </LayoutView>

          <LayoutView className="flex-row w-full gap-1 ">
            <ButtonView className="ascentButton android:p-2 flex-1" onPress={handleGoogleSignIn}>
              <WrapperView className="flex-row items-center gap-2">
                <AntDesign name="google" size={18} color="white" />
              </WrapperView>
            </ButtonView>

            <ButtonView className="ascentButton flex-1" onPress={faceBookOAuth}>
              <WrapperView className="flex-row items-center gap-2">
                <Entypo name="facebook" size={20} color="white" />
              </WrapperView>
            </ButtonView>
          </LayoutView>
        </SectionView>

        <LayoutView className="flex flex-row ">
          <ThemeText>Don't have an account yet? </ThemeText>
          <Link href="SignUp">
            <ThemeText className="underline font-semibold cursor-pointer">Sign Up</ThemeText>
          </Link>
        </LayoutView>
      </ThemeCard>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  panelBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  redirectWrap: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  redirectText: {
    color: '#ccc',
    marginTop: 8,
  },
});