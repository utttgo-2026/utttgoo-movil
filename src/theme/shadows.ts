import type { ViewStyle } from 'react-native';

const base: ViewStyle = {
  shadowColor: '#251E1A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 3,
};

export const shadows = {
  none: {},
  card: {
    ...base,
    elevation: 2,
  },
  floating: {
    ...base,
    elevation: 6,
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
} as const;
