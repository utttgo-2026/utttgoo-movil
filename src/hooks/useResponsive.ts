import { Dimensions, useWindowDimensions as useNativeWindowDimensions } from 'react-native';

export function useWindowDimensions() {
  const window = useNativeWindowDimensions();
  return { ...window, isTablet: window.width >= 768, isSmallPhone: window.width < 375, isLargePhone: window.width >= 414 };
}

export function responsiveWidth(percentage: number): number { return Dimensions.get('window').width * percentage / 100; }
export function responsiveHeight(percentage: number): number { return Dimensions.get('window').height * percentage / 100; }
export function moderateScale(size: number, factor = 0.5): number { return Math.round(size + (size * Dimensions.get('window').width / 375 - size) * factor); }
export function verticalScale(size: number): number { return Math.round(size * Dimensions.get('window').height / 667); }
export function horizontalScale(size: number): number { return moderateScale(size); }
/** Legacy: Text ya aplica fontScale nativo; no usar para duplicarlo. */
export function fontScale(size: number): number { return Math.round(size * Dimensions.get('window').fontScale); }

export interface GridMetrics { columns: 1 | 2; cardWidth: number; width: number; }
export function getGridMetrics(viewportWidth: number, textScale = 1, gutter = 16, gap = 12): GridMetrics {
  const width = Math.max(1, Math.min(520, Number.isFinite(viewportWidth) ? viewportWidth : 320));
  const scale = Math.max(1, Number.isFinite(textScale) ? textScale : 1);
  const contentWidth = Math.max(1, width - gutter * 2);
  // Mínimo144dp base; crece el espacio del contenedor, no se multiplican las fuentes.
  const columns = scale < 1.6 && contentWidth >= 2 * (144 * scale) + gap ? 2 : 1;
  return { columns, cardWidth: Math.max(1, (contentWidth - gap * (columns - 1)) / columns), width };
}

export function getTabBarHeight(textScale: number, bottomInset: number): number {
  const lineHeight = Math.ceil(16 * Math.max(1, textScale));
  return Math.max(60, 24 + lineHeight * (textScale > 1.3 ? 2 : 1) + 16) + Math.max(0, bottomInset);
}

export function groupRows<T>(items: readonly T[], columns: number): T[][] {
  const rows: T[][] = [];
  const count = Math.max(1, Math.floor(columns));
  for (let index = 0; index < items.length; index += count) rows.push(items.slice(index, index + count));
  return rows;
}
