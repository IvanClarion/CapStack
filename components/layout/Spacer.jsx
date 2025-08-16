import { View } from 'react-native';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';
import React from 'react';

const Spacer = ({ children, className, ...props }) => {
  return (
    <View className={clsx('my-1', className)} {...props}>
      {children}
    </View>
  );
};

export default Spacer;
