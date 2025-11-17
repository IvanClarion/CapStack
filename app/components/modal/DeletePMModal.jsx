import React, { useEffect, useState } from 'react';
import '../../../assets/stylesheet/global.css';
import { OctagonAlert } from 'lucide-react-native';
import ButtonView from '../../../components/buttons/ButtonView';
import LayoutView from '../../../components/layout/LayoutView';
import WrapperView from '../../../components/input/WrapperView';
import InputView from '../../../components/input/InputView';
import FloatingModal from '../../../components/modal/FloatingModal';
import ThemeText from '../../../components/ui/ThemeText';

const DeletePMModal = ({ visible, onClose, onConfirm, loading = false, pm }) => {
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (!visible) {
      setPassword('');
      setTouched(false);
      setErrorText('');
    }
  }, [visible]);

  const label =
    pm && pm.type === 'card'
      ? `${pm.card_brand ?? 'Card'} •••• ${pm.card_last4 ?? '????'}`
      : pm?.type || 'payment method';

  const showError = (touched && (!password || password.trim().length === 0)) || !!errorText;
  const canSubmit = !loading && !!password && password.trim().length > 0;

  // Only collect password here and hand it to parent via onConfirm.
  // Parent (Bills.jsx) will validate the password and perform deletion.
  const handleDelete = async () => {
    if (!canSubmit) return;
    setErrorText('');
    try {
      // Await parent's deletion handler. If it throws, we catch below and display error.
      await onConfirm?.({ password });
      // Do NOT automatically close here — parent will close the modal after successful deletion.
      // This ensures the modal remains open if the parent reports an error (e.g. wrong password).
    } catch (e) {
      // If parent throws, surface a friendly message
      const msg = e?.message || String(e) || 'Failed to delete payment method.';
      setErrorText(msg);
    }
  };

  return (
    <FloatingModal visible={visible} onRequestClose={onClose}>
      <LayoutView className="self-center">
        <OctagonAlert size={40} color={'#FF6060'} className="text-RosePink" />
      </LayoutView>

      <LayoutView className="text-center">
        <WrapperView className="self-center text-center items-center gap-2">
          <ThemeText className="cardHeader">Delete this wallet?</ThemeText>
          <ThemeText>This action is not reversible.</ThemeText>
          <ThemeText className="text-xs text-gray-400 mt-1">{label}</ThemeText>
        </WrapperView>
      </LayoutView>

      <LayoutView className="gap-2 mt-2">
        <ThemeText className="text-xs text-gray-500 text-center">
          Enter your current password to confirm
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
              if (errorText) setErrorText('');
            }}
            onBlur={() => setTouched(true)}
          />
        </WrapperView>
        {showError ? (
          <ThemeText className="text-[11px] color-red-400 text-center">
            {errorText || 'Password is required'}
          </ThemeText>
        ) : null}
      </LayoutView>

      <LayoutView className="flex flex-row gap-2 mt-2">
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

export default DeletePMModal;