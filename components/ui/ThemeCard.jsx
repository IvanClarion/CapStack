import { useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import clsx from "clsx";

const ThemeCard = ({ children, className, ...props }) => {
  const colorScheme = useColorScheme();

  return (
    <BlurView
      intensity={80}
      tint={'dark'}
      className={clsx("rounded-lg overflow-hidden p-4", className)}
      {...props}
    >
      {children}
    </BlurView>
  );
};

export default ThemeCard;
