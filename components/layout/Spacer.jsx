import { View } from "react-native";
import clsx from "clsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import "../../assets/stylesheet/global.css";

const Spacer = ({ children, className, ...props }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={clsx("my-1", className)}
      style={{ paddingTop: insets.top }} // ✅ pushes content below status bar / header
      {...props}
    >
      {children}
    </View>
  );
};

export default Spacer;
