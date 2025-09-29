import React, { forwardRef } from 'react';
import { Text, useColorScheme } from 'react-native';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';

const ThemeText = forwardRef(function ThemeText(
  { children, className, ...props },
  ref
) {
  useColorScheme(); // keep if you later vary classes by theme
  return (
    <Text ref={ref} className={clsx('text-white', className)} {...props}>
      {children}
    </Text>
  );
});

ThemeText.displayName = 'ThemeText';
export default ThemeText;