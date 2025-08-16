import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import clsx from 'clsx';
import '../../assets/stylesheet/global.css';

/**
 * GeneralButton Component
 *
 * A reusable button component with gradient background styling.
 * Uses LinearGradient for visual appeal and TouchableOpacity for interaction.
 *
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Button text content
 * @param {string} props.className - Additional CSS classes to apply
 * @param {...Object} props.otherProps - Additional props passed to TouchableOpacity
 *
 * @example
 * <GeneralButton className="w-full" onPress={handleSubmit}>
 *   Sign In
 * </GeneralButton>
 */
const GeneralButton = ({ children, className, ...props }) => {
  return (
    <TouchableOpacity className="generalbutton" {...props}>
      {/* Gradient background with consistent brand colors */}
      <LinearGradient
        colors={['#DF5A9A', '#4B3381']} // Pink to purple gradient
        className={clsx('p-3 android:p-5', className)} // Platform-specific padding
        start={{ x: 0, y: 0 }} // Gradient starts from left
        end={{ x: 1, y: 0 }} // Gradient ends at right (horizontal)
      >
        {/* Button text with consistent styling */}
        <Text className="text-center text-white font-semibold">{children}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GeneralButton;
