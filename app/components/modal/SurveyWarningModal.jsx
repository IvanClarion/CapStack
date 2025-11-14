import React from 'react';
import { CircleAlert } from 'lucide-react-native';
import GeneralButton from '../../../components/buttons/GeneralButton';
import WrapperView from '../../../components/input/WrapperView';
import ThemeText from '../../../components/ui/ThemeText';
import LayoutView from '../../../components/layout/LayoutView';
import FloatingModal from '../../../components/modal/FloatingModal';

const SurveyWarningModal = ({ visible, onClose, ...props }) => {
  return (
    <FloatingModal visible={visible} onRequestClose={onClose} {...props}>
      <LayoutView className="w-full max-w-md rounded-2xl bg-secondaryCard p-5 gap-4 items-center">
        <WrapperView className="items-center gap-2">
          <CircleAlert color={'#FF6060'} size={40} />
          <ThemeText className="text-xl font-bold text-GeneralButton">OOPSSIESS!!</ThemeText>
          <ThemeText className="font-semibold">Selection Is Required</ThemeText>
        </WrapperView>
        <WrapperView className="w-full flex">
          <GeneralButton className='flex-1' onPress={onClose}>
            Ok! Got It
          </GeneralButton>
        </WrapperView>
      </LayoutView>
    </FloatingModal>
  );
};

export default SurveyWarningModal;