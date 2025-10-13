import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
import WrapperView from '../../../components/input/WrapperView';
import ThemeText from '../../../components/ui/ThemeText';
import { X, OctagonAlert } from 'lucide-react-native';

// Small horizontal inline banner that sits above the composer.
// Pass bottom = keyboardHeight + composerHeight + 12 so it floats right above the input.
const PromptBanner = ({
  visible = false,
  message = 'Prompt appears invalid or off-topic.',
  onClose = () => {},
  actionLabel = 'Read Rules',
  onAction,
  variant = 'warning', // 'warning' | 'error' | 'info'
  bottom = 120,
  autoDismissMs = 3500
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const timerRef = useRef(null);

  // Variant colors (NativeWind classes + icon tint)
  const stylesByVariant = {
    warning: {
      bg: 'bg-amber-900/95',
      border: 'border-amber-500',
      text: 'white',
      chip: 'bg-amber-500/25',
      icon: '#f59e0b',
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500',
      text: 'text-red-300',
      chip: 'bg-red-500/30',
      icon: '#ef4444',
    },
    info: {
      bg: 'bg-sky-500/20',
      border: 'border-sky-500',
      text: 'text-sky-300',
      chip: 'bg-sky-500/30',
      icon: '#38bdf8',
    },
  };
  const v = stylesByVariant[variant] || stylesByVariant.warning;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();

      // Auto-dismiss
      if (autoDismissMs > 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          // Animate out then call onClose
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 160, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 8, duration: 160, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          ]).start(() => onClose?.());
        }, autoDismissMs);
      }
    } else {
      // Immediately hide without animation when prop flips to false
      opacity.setValue(0);
      translateY.setValue(8);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, autoDismissMs, onClose, opacity, translateY]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom,
        zIndex: 50,
      }}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className='max-w-lg'
    >
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <WrapperView className={`${v.bg} ${v.border} border-2 rounded-xl p-3 shadow-lg`}>
          <WrapperView className="flex-row items-center justify-between gap-3">
            <WrapperView className="flex-row items-center gap-2 flex-1">
              <OctagonAlert color={v.icon} size={18} />
              <ThemeText className={`text-xs font-semibold ${v.text}`} numberOfLines={2}>
                {message}
              </ThemeText>
            </WrapperView>

            {/* Optional action */}
            {onAction ? (
              <TouchableOpacity onPress={onAction} className={`${v.chip} rounded-md px-2 py-1`} activeOpacity={0.8}>
                <ThemeText className="text-[10px] text-white">{actionLabel}</ThemeText>
              </TouchableOpacity>
            ) : null}

            {/* Close */}
            <TouchableOpacity onPress={onClose} className={`${v.chip} rounded-md p-1`} accessibilityLabel="Close banner">
              <X color="#f5f5f5" size={14} />
            </TouchableOpacity>
          </WrapperView>
        </WrapperView>
      </Animated.View>
    </View>
  );
};

export default PromptBanner;