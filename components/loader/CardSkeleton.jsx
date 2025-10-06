import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import '../../assets/stylesheet/global.css';

const CardSkeleton = () => {
  // Card background is light (white/60), so use light skeleton colors to avoid dark/black bars
  const skeletonColorMode = 'dark';

  return (
    <MotiView className="bg-white/60 overflow-hidden justify-center items-center rounded-2xl w-full flex gap-2">
      <MotiView
        className="p-4 rounded-2xl bg-transparent flex flex-1 w-full gap-3"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <Skeleton colorMode={skeletonColorMode} radius="round" height={50} width={50} />
        <Skeleton colorMode={skeletonColorMode} width={300} height={20} radius="round" />
        <Skeleton colorMode={skeletonColorMode} width={120} height={16} radius="round" />
        <MotiView className="flex flex-1 w-full flex-row gap-3 mt-4">
          <Skeleton colorMode={skeletonColorMode} width={150} height={30} radius="round" />
          <Skeleton colorMode={skeletonColorMode} width={150} height={30} radius="round" />
        </MotiView>
      </MotiView>
    </MotiView>
  );
};

export default CardSkeleton;