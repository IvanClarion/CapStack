import React, { forwardRef } from 'react';
import { TextInput, useColorScheme } from 'react-native';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';

const InputView = forwardRef(function InputView(
  { className, style, placeholderTextColor, ...props },
  ref
) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Allow override via prop; otherwise pick a theme-appropriate default
  const resolvedPlaceholder = placeholderTextColor ?? (isDark ? 'gray' : 'black');

  return (
    <TextInput
      ref={ref}
      className={clsx(
        'bg-none outline-none',
        isDark ? 'text-white' : 'text-black',
        className
      )}
      style={style}
      placeholderTextColor={resolvedPlaceholder}
      {...props}
    />
  );
});

InputView.displayName = 'InputView';
export default InputView;