import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface WindowDimensions {
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  isTablet: boolean;
  isSmallPhone: boolean;
  isLargePhone: boolean;
}

const breakpoint = {
  phone: 0,
  smallPhone: 375,
  largePhone: 414,
  tablet: 768,
};

export function useWindowDimensions(): WindowDimensions {
  const [dimensions, setDimensions] = useState<WindowDimensions>(() => {
    const { width, height, scale, fontScale } = Dimensions.get('window');
    return {
      width,
      height,
      scale,
      fontScale,
      isTablet: width >= breakpoint.tablet,
      isSmallPhone: width < breakpoint.smallPhone,
      isLargePhone: width >= breakpoint.largePhone,
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window: windowSize }: { window: ScaledSize }) => {
      const { width, height, scale, fontScale } = windowSize;
      setDimensions({
        width,
        height,
        scale,
        fontScale,
        isTablet: width >= breakpoint.tablet,
        isSmallPhone: width < breakpoint.smallPhone,
        isLargePhone: width >= breakpoint.largePhone,
      });
    });

    return () => subscription?.remove?.();
  }, []);

  return dimensions;
}

export function responsiveWidth(percentage: number): number {
  const { width } = Dimensions.get('window');
  return (percentage / 100) * width;
}

export function responsiveHeight(percentage: number): number {
  const { height } = Dimensions.get('window');
  return (percentage / 100) * height;
}

export function moderateScale(size: number, factor = 0.5): number {
  const { width } = Dimensions.get('window');
  const guidelineBaseWidth = 375;
  const newSize = size * (width / guidelineBaseWidth);
  return Math.round(size + (newSize - size) * factor);
}

export function verticalScale(size: number): number {
  const { height } = Dimensions.get('window');
  const guidelineBaseHeight = 667;
  return Math.round(size * (height / guidelineBaseHeight));
}

export function horizontalScale(size: number): number {
  return moderateScale(size);
}

export function fontScale(size: number): number {
  const { fontScale } = Dimensions.get('window');
  return Math.round(size * fontScale);
}