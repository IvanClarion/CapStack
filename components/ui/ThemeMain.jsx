import React, { forwardRef } from 'react';
import { ImageBackground } from 'expo-image';
import clsx from 'clsx';

// Forward the ref to ImageBackground so animated styles/className can attach if needed.
const ThemeMain = forwardRef(function ThemeMain(
  { children, className, style, ...props },
  ref
) {
  return (
    <ImageBackground
      ref={ref}
      className={clsx(className)}
      style={[{ flex: 1, width: '100%', height: '100%' }, style]}
      contentFit="cover"
      source={require('../../assets/images/mainBg.png')}
      {...props}
    >
      {children}
    </ImageBackground>
  );
});

ThemeMain.displayName = 'ThemeMain';
export default ThemeMain;