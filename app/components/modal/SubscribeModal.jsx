import React from 'react';
import { Modal, View } from 'react-native';
import LayoutView from '../../../components/layout/LayoutView';
import WrapperView from '../../../components/input/WrapperView';
import ButtonView from '../../../components/buttons/ButtonView';
import ThemeText from '../../../components/ui/ThemeText';

const SubscribeModal = ({
  visible,
  onClose,
  onSubscribe,
  title = 'You are on a free tier commoner!!!',
  message = 'Subscribe to unlock this feature.',
  primaryLabel = 'Subscribe',
  secondaryLabel = 'Later',
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        <WrapperView className="w-full flex-1 items-center justify-center  max-w-md rounded-2xl bg-secondaryCard h-[150px] max-h-[200px] p-5 gap-3">
          <ThemeText className="font-semibold text-lg">{title}</ThemeText>
          <ThemeText className="text-sm text-gray-300">{message}</ThemeText>

          <LayoutView className="flex-row gap-2 mt-3">
          <WrapperView className='flex-1'>
            <ButtonView className=" bg-AscentViolet rounded-lg p-1 items-center" onPress={onSubscribe}>
              <ThemeText className="font-semibold">{primaryLabel}</ThemeText>
            </ButtonView>
            </WrapperView>
            <WrapperView className='flex-1'>
            <ButtonView className=" bg-gray-700 rounded-lg p-1 items-center" onPress={onClose}>
              <ThemeText className="font-semibold">{secondaryLabel}</ThemeText>
            </ButtonView>
            </WrapperView>
           
          </LayoutView>

        </WrapperView>
      </View>
    </Modal>
  );
};

export default SubscribeModal;