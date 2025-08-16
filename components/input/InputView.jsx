import { TextInput, useColorScheme } from 'react-native';
import React from 'react';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';
const InputView = ({ className, ...props }) => {
  const colorScheme = useColorScheme();

  return (
    <TextInput
      className={clsx(colorScheme === 'dark' ? 'text-white' : 'text-black', className)}
      placeholderTextColor={colorScheme === 'dark' ? 'gray' : 'black'}
      {...props}
    />
  );
};

export default InputView;
