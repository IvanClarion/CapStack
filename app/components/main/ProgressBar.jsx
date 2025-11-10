import React from 'react';
import { View } from 'react-native';
import WrapperView from '../../../components/input/WrapperView';
import ThemeText from '../../../components/ui/ThemeText';
import LayoutView from '../../../components/layout/LayoutView';

/**
 * ProgressBar
 * Props:
 *  - current: number (0-based index)
 *  - total: number (total steps/pages)
 *  - height: number (optional height of bar)
 */
const ProgressBar = ({ current = 0, total = 1, height = 8 }) => {
  const safeTotal = Math.max(1, Number(total) || 1);
  const safeCurrent = Math.max(0, Math.min(Number(current) || 0, safeTotal - 1));
  const percent = Math.round(((safeCurrent + 1) / safeTotal) * 100);

  return (
    <WrapperView className="w-full px-2">
      <LayoutView className="flex-row items-center justify-between mb-2">
         <WrapperView className="self-end rounded-full bg-gray-700/30 px-3 py-1">
          <ThemeText className="text-[11px] text-gray-200">{`Step ${safeCurrent + 1} of ${safeTotal}`}</ThemeText>
        </WrapperView>
         <ThemeText className="text-[11px] text-gray-400">{`${percent}%`}</ThemeText>
       
      </LayoutView>

      <WrapperView className="w-full bg-gray-700/30 rounded-full overflow-hidden" style={{ height }}>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, now: percent, max: 100 }}
          style={{
            width: `${percent}%`,
            height,
            backgroundColor: '#60A5FA', // AscentBlue-like
          }}
        />
      </WrapperView>
    </WrapperView>
  );
};

export default ProgressBar;