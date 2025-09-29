import { View } from "react-native";
import React from "react";
import clsx from "clsx";

const LayoutView = React.forwardRef(({children, className, ...props}, ref) => (
  <View ref={ref} className={clsx("", className)} {...props}>
    {children}
  </View>
));

export default LayoutView;