"use strict";

import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheetBackground } from './BottomSheetBackground';
import { styles } from './styles';
import { jsx as _jsx } from "react/jsx-runtime";
const BottomSheetBackgroundContainerComponent = ({
  animatedIndex,
  animatedPosition,
  backgroundComponent: _providedBackgroundComponent,
  backgroundStyle: _providedBackgroundStyle
}) => {
  //#region style
  const backgroundStyle = useMemo(() => StyleSheet.flatten([styles.container, _providedBackgroundStyle]), [_providedBackgroundStyle]);
  //#endregion

  const BackgroundComponent = _providedBackgroundComponent ?? BottomSheetBackground;
  return /*#__PURE__*/_jsx(BackgroundComponent, {
    pointerEvents: "none",
    animatedIndex: animatedIndex,
    animatedPosition: animatedPosition,
    style: backgroundStyle
  });
};
export const BottomSheetBackgroundContainer = /*#__PURE__*/memo(BottomSheetBackgroundContainerComponent);
BottomSheetBackgroundContainer.displayName = 'BottomSheetBackgroundContainer';
//# sourceMappingURL=BottomSheetBackgroundContainer.js.map