import React, { forwardRef } from 'react';
import { View, useColorScheme, StyleSheet } from 'react-native';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';

const ThemeBody = forwardRef(function ThemeBody(
  { children, className, ...props },
  ref
) {
  useColorScheme(); // if you need to react to theme, keep this hook (currently unused)
  return (
    <View ref={ref} className={clsx('bg-secondaryCard', className)} {...props}>
      {children}
    </View>
  );
});

ThemeBody.displayName = 'ThemeBody';
export default ThemeBody;

const styles = StyleSheet.create({});