import React, { forwardRef } from 'react';
import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import clsx from 'clsx';

const ThemeCard = forwardRef(function ThemeCard(
  { children, className, tint: tintProp, intensity = 80, ...props },
  ref
) {
  const colorScheme = useColorScheme();
  const tint = tintProp ?? (colorScheme || 'default');

  return (
    <BlurView
      ref={ref}
      intensity={intensity}
      tint={'dark'}
      className={clsx('rounded-lg overflow-hidden p-4', className)}
      {...props}
    >
      {children}
    </BlurView>
  );
});

ThemeCard.displayName = 'ThemeCard';
export default ThemeCard;