import React, { useEffect } from 'react';
import { View, Text, useColorScheme, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Host } from 'react-native-portalize';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../database/auth/AuthSecure';
import NavHeader from './components/NavHeader';
// Light/Dark Color Palette
const COLORS = {
  light: {
    background: "#ffffff",
    text: "#18181b",
    spinner: "#18181b",
  },
  dark: {
    background: "#18181b",
    text: "#ffffff",
    spinner: "#ffffff",
  },
};

function ProtectedStack() {
  const { session, loading } = useAuth();
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? COLORS.dark : COLORS.light;
  const router = useRouter();

  // Redirect to login if no session
  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [loading, session]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.spinner} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack
        screenOptions={({ route }) => ({
          header: () => {
            const name = route.name.toLowerCase();
            if (
              name.startsWith("signin") ||
              name.startsWith("signup") ||
              name.startsWith("emailverification") ||
              name.startsWith("resetpassword")
            ) {
              return null;
            }
            return (
                <NavHeader />
            );
          },
          headerTransparent: false,
          contentStyle: { backgroundColor: theme.background }, // 👈 ensures screen bg matches scheme
        })}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" options={{ headerShown: false }} />
        {/* add other screens here */}
      </Stack>
    </SafeAreaView>
  );
}

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/font/Inter.ttf"),
  });

  const scheme = useColorScheme();
  const theme = scheme === "dark" ? COLORS.dark : COLORS.light;

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <Text style={{ fontSize: 18, color: theme.text }}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
    <GestureHandlerRootView>
      {/* 👇 This will also switch status bar text color based on scheme */}
      <Host>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <ProtectedStack />
      </Host>
    </GestureHandlerRootView>
    </AuthProvider>
  );
};

export default RootLayout;
