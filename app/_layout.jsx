import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import NavHeader from './components/NavHeader';

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/font/Inter.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <SafeAreaView className="flex-1 bg-transparent">
       <Stack
  screenOptions={({ route }) => ({
    header: () => {
      if (
        route.name.toLowerCase().startsWith("signin") ||
        route.name.toLowerCase().startsWith("signup")
      ) {
        return null;
      }
      return (
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "transparent" }}>
          <NavHeader />
        </SafeAreaView>
      );
    },
    headerStyle: {
      backgroundColor: "transparent", // make native header transparent
    },
    headerTransparent: true, // <-- this removes the default white/gray bg
  })}
>

          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            options={{ headerShown: false }}
          />
        </Stack>
      </SafeAreaView>
    </>
  );
};

export default RootLayout;
