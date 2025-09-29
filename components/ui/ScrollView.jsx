import React, { forwardRef } from 'react';
import { ScrollView } from 'react-native';
import clsx from 'clsx';

const ScrollViews = forwardRef(function ScrollViews(
  { children, className, ...props },
  ref
) {
  return (
    <ScrollView
      ref={ref}
      className={clsx('bg-none', className)}
      {...props}
    >
      {children}
    </ScrollView>
  );
});

ScrollViews.displayName = 'ScrollViews';
export default ScrollViews;