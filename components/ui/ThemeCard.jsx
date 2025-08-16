import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import clsx from 'clsx';

/**
 * ThemeCard Component
 *
 * A themed card component that adapts to the device's color scheme.
 * Uses BlurView to create a glass-morphism effect with appropriate tinting.
 *
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Content to render inside the card
 * @param {string} props.className - Additional CSS classes to apply
 * @param {...Object} props.otherProps - Additional props passed to BlurView
 *
 * Features:
 * - Automatic theme detection (light/dark mode)
 * - Blur effect with theme-appropriate tinting
 * - Customizable styling through className prop
 *
 * @example
 * <ThemeCard className="authCard">
 *   <Text>Card content</Text>
 * </ThemeCard>
 */
const ThemeCard = ({ children, className, ...props }) => {
  // Detect current device color scheme (light/dark)
  const colorScheme = useColorScheme();

  return (
    <BlurView
      intensity={100} // Blur intensity (0-100)
      tint={colorScheme === 'dark' ? 'dark' : 'light'} // Theme-appropriate tint
      className={clsx('rounded-lg p-4', className)} // Base styling + custom classes
      {...props}
    >
      {children}
    </BlurView>
  );
};

export default ThemeCard;
