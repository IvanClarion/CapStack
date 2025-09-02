import React, { useState } from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import { Eye } from "lucide-react-native";
import { resetPassword } from "../../../database/auth/PasswordReset";
import WrapperView from "../../../components/input/WrapperView";
import ButtonMain from "../../../components/buttons/ButtonMain";
import InputView from "../../../components/input/InputView";
import ThemeIcon from "../../../components/ui/ThemeIcon";
import ControlModal from "../../../components/modal/ControlModal";
import LayoutView from "../../../components/layout/LayoutView";
import ThemeText from "../../../components/ui/ThemeText";

const ResetPasswordModal = ({ visible, onClose, ...props }) => {
  const [passwordView, setPasswordView] = useState(false);
  const [passwordView2, setPasswordView2] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const { loading, updatePassword } = resetPassword();

  const handleReset = async () => {
    try {
      setErrorMessage("");
      setMessage("");

      if (!newPassword.trim() || !confirmPassword.trim()) {
        setErrorMessage("All fields are required");
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match!");
        return;
      }

      const { success, error } = await updatePassword(newPassword);

      if (!success) throw error;

      setMessage("Password has been reset");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong");
    }
  };

  return (
    <ControlModal visible={visible} onRequestClose={onClose} {...props}>
      <View className="flex w-full justify-start gap-5">
        <LayoutView>
          <ThemeText className="cardHeader">Reset Password</ThemeText>
        </LayoutView>

        {message ? (
          <LayoutView>
            <ThemeText className="text-lg color-green-600 font-semibold">
              {message}
            </ThemeText>
          </LayoutView>
        ) : null}

        {errorMessage ? (
          <LayoutView>
            <ThemeText className="text-lg color-RosePink text-center font-semibold">
              {errorMessage}
            </ThemeText>
          </LayoutView>
        ) : null}


        <LayoutView className="gap-2">
          <ThemeText className="cardlabel">New Password</ThemeText>
          <WrapperView className="inputWrapper">
            <InputView
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!passwordView}
            />
            <TouchableWithoutFeedback
              onPress={() => setPasswordView((prev) => !prev)}
            >
              <ThemeIcon>
                <Eye />
              </ThemeIcon>
            </TouchableWithoutFeedback>
          </WrapperView>
        </LayoutView>


        <LayoutView className="gap-2">
          <ThemeText className="cardlabel">Confirm Password</ThemeText>
          <WrapperView className="inputWrapper">
            <InputView
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!passwordView2}
            />
            <TouchableWithoutFeedback
              onPress={() => setPasswordView2((prev) => !prev)}
            >
              <ThemeIcon>
                <Eye />
              </ThemeIcon>
            </TouchableWithoutFeedback>
          </WrapperView>
        </LayoutView>

        <LayoutView>
          <ButtonMain onPress={handleReset} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </ButtonMain>
        </LayoutView>
      </View>
    </ControlModal>
  );
};

export default ResetPasswordModal;
