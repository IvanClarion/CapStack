import React, { useMemo } from 'react';
import { Modal, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { Share2, Trash } from 'lucide-react-native';

import LayoutView from '../../../components/layout/LayoutView';
import WrapperView from '../../../components/input/WrapperView';

import ThemeText from '../../../components/ui/ThemeText';
import '../../../assets/stylesheet/global.css';

const MENU_WIDTH = 220;

const ArchiveModal = ({
  visible = false,
  anchor = { x: 0, y: 0 },
  item = null,
  onClose = () => {},
  onShare = () => {},
  onDelete = () => {}
}) => {
  const title =
    item?.structured_payload?.title ||
    item?.structured_payload?.Title ||
    '';

  const { width: screenW, height: screenH } = Dimensions.get('window');

  const position = useMemo(() => {
    const margin = 8;
    const top = Math.min(Math.max(anchor.y + margin, margin), screenH - 160);
    let left = anchor.x - MENU_WIDTH; // default open to the left
    if (left < margin) left = Math.min(anchor.x + margin, screenW - MENU_WIDTH - margin);
    return { top, left };
  }, [anchor, screenW, screenH]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
      />

      {/* Anchored menu */}
      <WrapperView
        className="absolute"
        style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
        pointerEvents="box-none"
      >
        <LayoutView className="overflow-hidden p-2 bg-secondaryCard rounded-2xl">
          <LayoutView className="py-1">
            {!!title && (
              <WrapperView className="px-3 py-2">
                <ThemeText className="opacity-70 text-xs" numberOfLines={1}>
                  {title}
                </ThemeText>
              </WrapperView>
            )}

            <TouchableOpacity onPress={onShare} activeOpacity={0.8}>
              <WrapperView className="px-3 py-2 flex-row items-center gap-2">
                <Share2 color="white" size={18} />
                <ThemeText className="font-semibold">Share</ThemeText>
              </WrapperView>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDelete} activeOpacity={0.8}>
              <WrapperView className="px-3 py-2 flex-row items-center gap-2">
                <Trash color="#FF6060" size={18} />
                <ThemeText className="color-RosePink font-semibold">Delete</ThemeText>
              </WrapperView>
            </TouchableOpacity>
          </LayoutView>
        </LayoutView>
      </WrapperView>
    </Modal>
  );
};

export default ArchiveModal;