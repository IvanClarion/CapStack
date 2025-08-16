import { Text, useColorScheme } from 'react-native';
import React from 'react';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';

/**
 * ThemeText Component
 *
 * A themed text component that automatically adapts text color based on the device's color scheme.
 * Serves as a drop-in replacement for React Native's Text component with theme awareness.
 *
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Text content to display
 * @param {string} props.className - Additional CSS classes to apply
 * @param {...Object} props.otherProps - All other Text component props (style, numberOfLines, etc.)
 *
 * Features:
 * - Automatic theme detection (light/dark mode)
 * - Theme-appropriate text color (black for light mode, white for dark mode)
 * - Full compatibility with React Native Text component
 * - Customizable styling through className prop
 *
 * @example
 * <ThemeText className="text-lg font-bold">
 *   Welcome to CapStack
 * </ThemeText>
 */
const ThemeText = ({ children, className, ...props }) => {
  // Detect current device color scheme for appropriate text color
  const colorScheme = useColorScheme();

  return (
    <Text
      className={clsx('', colorScheme === 'dark' ? 'text-white' : 'text-black', className)}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ThemeText;
