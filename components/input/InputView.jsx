import React, { forwardRef } from 'react';
import { TextInput } from 'react-native';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';

const InputView = forwardRef(function InputView(
  { className, style, placeholderTextColor, ...props },
  ref
) {
  // Dark theme removed: always use light styles
  const resolvedPlaceholder = placeholderTextColor ?? 'gray';

  return (
    <TextInput
      ref={ref}
      className={clsx('bg-none outline-none text-white', className)}
      style={style}
      placeholderTextColor={resolvedPlaceholder}
      {...props}
    />
  );
});

InputView.displayName = 'InputView';
export default InputView;