import React, { forwardRef } from 'react';
import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';

const HeaderView = forwardRef(function HeaderView(
  { children, className, ...props },
  ref
) {
  const colorTheme = useColorScheme();
  const tint = colorTheme ?? 'default';

  return (
    <BlurView
      ref={ref}
      className={clsx('', className)}
      tint={tint}
      {...props}
    >
      {children}
    </BlurView>
  );
});

HeaderView.displayName = 'HeaderView';
export default HeaderView;