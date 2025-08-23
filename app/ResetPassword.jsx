import React, { useState, useEffect } from "react";
import { Alert, ImageBackground, Linking } from "react-native";
import { useRouter } from "expo-router"// ✅ useRouter hook
import { Eye } from "lucide-react-native";
import ThemeText from "../components/ui/ThemeText";
import LayoutView from "../components/layout/LayoutView";
import ThemeCard from "../components/ui/ThemeCard";
import WrapperView from "../components/input/WrapperView";
import SectionView from "../components/layout/SectionView";
import InputView from "../components/input/InputView";
import ThemeIcon from "../components/ui/ThemeIcon";
import GeneralButton from "../components/buttons/GeneralButton";
import { resetPassword} from "../database/auth/PasswordReset";
import "../assets/stylesheet/global.css";

const ResetPassword = () => {
  const { loading, updatePassword } = resetPassword();
  const router = useRouter(); // ✅ correct usage
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [token, setToken] = useState(null);

  // Handle deep links
  useEffect(() => {
    const extractToken = (url) => {
      try {
        const tokenMatch = url.match(/access_token=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) setToken(tokenMatch[1]);
      } catch (e) {
        console.log("Failed to extract token", e);
      }
    };

    // Cold start
    Linking.getInitialURL().then((url) => url && extractToken(url));

    // Running app
    const subscription = Linking.addEventListener("url", (event) => extractToken(event.url));

    return () => subscription.remove(); // cleanup
  }, []);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!token) {
      Alert.alert("Error", "Invalid or expired reset link");
      return;
    }

    const { success, error } = await updatePassword(password, token);
    if (!success) {
      Alert.alert("Error", error?.message || "Failed to update password");
      return;
    }

    Alert.alert("Success", "Password reset successfully!");
    router.push("/"); // ✅ navigate to main screen
  };

  return (
    <ImageBackground
      source={require("../assets/images/PanelBG.png")}
      className="flex-1 object-cover overflow-hidden items-center justify-center"
    >
      <SectionView>
        <ThemeCard className="authCard w-[360px]">
          <LayoutView className="flex justify-center items-center mb-4">
            <ThemeText className="font-bold text-xl">Reset Password</ThemeText>
            <ThemeText>Please enter your new password</ThemeText>
          </LayoutView>

          {/* New Password */}
          <LayoutView className="w-full gap-2 mb-3">
            <ThemeText className="font-semibold">New Password</ThemeText>
            <WrapperView className="inputWrapper w-full gap-2">
              <InputView
                placeholder="New Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <ThemeIcon><Eye /></ThemeIcon>
            </WrapperView>
            <ThemeText className="color-gray-400">Minimum of 8 characters</ThemeText>
          </LayoutView>

          {/* Confirm Password */}
          <LayoutView className="w-full gap-2 mb-3">
            <ThemeText className="font-semibold">Confirm Password</ThemeText>
            <WrapperView className="inputWrapper w-full gap-2">
              <InputView
                placeholder="Confirm Password"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />
              <ThemeIcon><Eye /></ThemeIcon>
            </WrapperView>
          </LayoutView>

          {/* Submit Button */}
          <GeneralButton
            className="generalbutton w-full"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Reset Password"}
          </GeneralButton>
        </ThemeCard>
      </SectionView>
    </ImageBackground>
  );
};

export default ResetPassword;
