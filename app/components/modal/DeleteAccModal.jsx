import { Alert } from 'react-native';
import { OctagonAlert } from 'lucide-react-native';
import '../../../assets/stylesheet/global.css';
import ButtonView from '../../../components/buttons/ButtonView';
import LayoutView from '../../../components/layout/LayoutView';
import WrapperView from '../../../components/input/WrapperView';
import InputView from '../../../components/input/InputView';
import React, { useState } from 'react';
import FloatingModal from '../../../components/modal/FloatingModal';
import ThemeText from '../../../components/ui/ThemeText';
import { deleteCurrentUser } from '../../../database/auth/DeleteAccount';

const DeleteAccModal = ({ visible, onClose, ...props }) => {
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const showError = touched && (!password || password.trim().length === 0);
  const canSubmit = !loading && password && password.trim().length > 0;

  const handleDelete = async () => {
    if (!password || password.trim().length === 0) {
      setTouched(true);
      return;
    }

    try {
      setLoading(true);

      const result = await deleteCurrentUser({ password });
      if (!result?.success) {
        throw new Error(result?.error || 'Could not delete account.');
      }

      Alert.alert('Account deleted', 'Your account has been deleted.');
      onClose?.();
    } catch (e) {
      Alert.alert('Delete failed', e?.message || 'Could not delete account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FloatingModal visible={visible} onRequestClose={onClose} {...props}>
      <LayoutView className="self-center">
        <OctagonAlert size={40} color={'#FF6060'} className="size-10 text-RosePink" />
      </LayoutView>

      <LayoutView className="text-center">
        <WrapperView className="self-center text-center items-center gap-2">
          <ThemeText className="cardHeader">Delete Your Account?</ThemeText>
          <ThemeText>This action is not reversible.</ThemeText>
        </WrapperView>
      </LayoutView>

      <LayoutView className="gap-2">
        <ThemeText className="text-xs text-gray-500 text-center">
          Enter your current password to confirm the deletion of your account
        </ThemeText>
        <WrapperView className="inputWrapper">
          <InputView
            className="flex-1"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (!touched) setTouched(true);
            }}
            onBlur={() => setTouched(true)}
          />
        </WrapperView>
        {showError && (
          <ThemeText className="text-[11px] color-red-400 text-center">
            Password is required
          </ThemeText>
        )}
      </LayoutView>

      <LayoutView className="flex flex-row gap-2">
        <ButtonView className="simpleButton flex-1" onPress={onClose} disabled={loading}>
          Cancel
        </ButtonView>
        <ButtonView
          className="deleteBtn2 color-RosePink flex-1"
          onPress={handleDelete}
          disabled={!canSubmit}
        >
          {loading ? 'Deleting…' : 'Delete'}
        </ButtonView>
      </LayoutView>
    </FloatingModal>
  );
};

export default DeleteAccModal;