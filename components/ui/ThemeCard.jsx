import { useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import clsx from "clsx";

const ThemeCard = ({ children, className, ...props }) => {
  const colorScheme = useColorScheme();

  return (
    <BlurView
      intensity={100}
      tint={colorScheme === "dark" ? "dark" : "light"}
      className={clsx("rounded-lg p-4", className)}
      {...props}
    >
      {children}
    </BlurView>
  );
};

export default ThemeCard;
