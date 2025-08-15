
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

const RootLayout = () => {
const [fontsLoaded]= useFonts({
  Inter: require("../assets/font/Inter.ttf"),
})
 if (!fontsLoaded) {
    return <View><Text>Loading...</Text></View>;
  }
  return (
  <>
      <StatusBar style="auto" />
      <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
  </>
  );
};

export default RootLayout;
