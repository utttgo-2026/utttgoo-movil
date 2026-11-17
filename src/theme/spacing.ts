import { Dimensions } from 'react-native';

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 667;

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const layout = {
  screenPadding: 16,
  maxContentWidth: 520,
  buttonHeight: 52,
  inputHeight: 52,
  headerHeight: 56,
  tabBarHeight: 64,
  
  // Responsive helpers (baseline iPhone 8: 375x667)
  get scale() { return Dimensions.get('window').width / guidelineBaseWidth; },
  get verticalScale() { return Dimensions.get('window').height / guidelineBaseHeight; },
  get screenWidth() { return Dimensions.get('window').width; },
  get screenHeight() { return Dimensions.get('window').height; },
  get isSmallScreen() { return Dimensions.get('window').width < 375; },
  get isLargeScreen() { return Dimensions.get('window').width > 414; },
} as const;

export function moderateScale(size: number, factor = 0.5): number {
  const newSize = size * layout.scale;
  return Math.round(size + (newSize - size) * factor);
}

export function verticalScale(size: number): number {
  return Math.round(size * layout.verticalScale);
}

export function horizontalScale(size: number): number {
  return moderateScale(size);
}

export function responsiveFontSize(size: number): number {
  const { fontScale } = Dimensions.get('window');
  return Math.round(size * fontScale);
}

export function wp(percentage: number): number {
  return (percentage / 100) * layout.screenWidth;
}

export function hp(percentage: number): number {
  return (percentage / 100) * layout.screenHeight;
}
