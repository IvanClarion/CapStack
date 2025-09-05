import React, { useEffect } from "react";
import { View, ActivityIndicator, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Host } from "react-native-portalize";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../database/auth/AuthSecure";
import NavHeader from "./components/NavHeader";
import MenuBar from '../components/navBar/MenuBar'
// Screens where the navbar/header should be hidden
const AUTH_ROUTES = ["signin", "signup", "emailverification", "resetpassword"];

function ProtectedStack() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if no session
  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [loading, session]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={({ route }) => {
          const hideHeader = AUTH_ROUTES.some((r) =>
            route.name.toLowerCase().startsWith(r)
          );
          return {
            header: hideHeader ? () => null : () => <NavHeader />,
          };
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <AuthProvider>
      <Host>
        <StatusBar style={scheme === "dark" ? "dark" : "light"} />
        <ProtectedStack />
      </Host>
    </AuthProvider>
  );
}
