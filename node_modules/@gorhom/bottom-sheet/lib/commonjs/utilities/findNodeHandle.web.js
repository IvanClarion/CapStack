"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findNodeHandle = findNodeHandle;
var _reactNative = require("react-native");
function findNodeHandle(componentOrHandle) {
  let nodeHandle;
  try {
    nodeHandle = (0, _reactNative.findNodeHandle)(componentOrHandle);
    if (nodeHandle) {
      return nodeHandle;
    }
  } catch {}
  try {
    // @ts-ignore
    nodeHandle = componentOrHandle.getNativeScrollRef();
    if (nodeHandle) {
      return nodeHandle;
    }
  } catch {}

  // @ts-ignore https://github.com/facebook/react-native/blob/a314e34d6ee875830d36e4df1789a897c7262056/packages/virtualized-lists/Lists/VirtualizedList.js#L1252
  nodeHandle = componentOrHandle._scrollRef;
  if (nodeHandle) {
    return nodeHandle;
  }
  console.warn('could not find scrollable ref!');
  return componentOrHandle;
}
//# sourceMappingURL=findNodeHandle.web.js.map