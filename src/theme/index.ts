import { colors } from './colors';
import { layout, radii, spacing } from './spacing';
import { shadows } from './shadows';
import { fontFamily, fontSize, fontWeight, lineHeight } from './typography';

export const theme = {
  colors,
  spacing,
  radii,
  layout,
  shadows,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
} as const;

export { colors, layout, radii, shadows, spacing, fontFamily, fontSize, fontWeight, lineHeight };
export type AppTheme = typeof theme;
