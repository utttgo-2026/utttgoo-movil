export const colors = {
  primary: '#D2030F',
  primaryDark: '#A8020C',
  primaryLight: '#E88187',
  primarySoft: '#FFF0F0',

  text: '#251E1A',
  textMuted: '#766B64',
  textSubtle: '#928E8C',
  textOnPrimary: '#FFFFFF',

  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F5F5',
  surfaceBlue: '#EDF5F7',
  surfaceGreen: '#ECF8EF',
  surfaceYellow: '#FFF7E7',

  border: '#E6E0DC',
  borderStrong: '#BAB5B1',

  success: '#008522',
  successSoft: '#ECF8EF',
  warning: '#C77700',
  warningSoft: '#FFF7E7',
  danger: '#D2030F',
  dangerSoft: '#FFF0F0',
  info: '#2F6F7E',
  infoSoft: '#EDF5F7',

  overlay: 'rgba(37, 30, 26, 0.45)',
  transparent: 'transparent',
} as const;

export type AppColor = keyof typeof colors;
