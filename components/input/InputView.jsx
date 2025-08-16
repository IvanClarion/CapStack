import { TextInput, useColorScheme } from 'react-native';
import React from 'react';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';

/**
 * InputView Component
 *
 * A themed text input component that automatically adapts to the device's color scheme.
 * Provides consistent text color and placeholder styling across light and dark themes.
 *
 * @param {Object} props - Component properties
 * @param {string} props.className - Additional CSS classes to apply
 * @param {...Object} props.otherProps - All other TextInput props (placeholder, value, onChangeText, etc.)
 *
 * Features:
 * - Automatic theme detection and color adaptation
 * - Consistent placeholder text color based on theme
 * - Inherits all native TextInput functionality
 *
 * @example
 * <InputView
 *   placeholder="Enter email"
 *   className="generalInput"
 *   value={email}
 *   onChangeText={setEmail}
 * />
 */
const InputView = ({ className, ...props }) => {
  // Detect current device color scheme for theme-appropriate styling
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
