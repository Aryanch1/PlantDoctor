import { useWindowDimensions } from 'react-native';

/**
 * PlantDoctor design tokens — one consistent system for the whole app.
 * Theme: terracotta clay (#B4552D) + sage (#6F8F5E) on warm cream (#FAF5EC)
 * with deep soil ink. Flat labeled tab bar, arch-top plant tiles, a
 * typographic hero — deliberately unlike the previous apps.
 */

export const palette = {
  // Brand — one disciplined theme color: terracotta clay.
  primary: '#B4552D',
  primaryDeep: '#8A3E1F',
  primaryLight: '#D97B4F',
  primarySoft: '#F6E3D3',
  primaryPale: '#FBF1E6',
  // Sage accent — the second voice, used sparingly (healthy states, leaves).
  accent: '#6F8F5E',
  accentDeep: '#4E6B40',
  accentSoft: '#E4EBDD',
  accentPale: '#F0F4EA',
  // Neutrals (warm, soil-tinted so the whole UI feels one family).
  ink: '#2E2118',
  body: '#5C4A3A',
  muted: '#97826F',
  line: 'rgba(46, 33, 24, 0.10)',
  surface: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.62)',
  glassStrong: 'rgba(255, 255, 255, 0.78)',
  sheet: 'rgba(255, 255, 255, 0.86)',
  // Warm cream background.
  background: '#FAF5EC',
  // Aurora background stops.
  aurora: ['#FBEEDC', '#FAF5EC', '#F3E7CE'] as const,
  // Status.
  warning: '#9A6B1F',
  warningSoft: '#FDF3DC',
  error: '#B3261E',
  errorSoft: '#FCE8E6',
  success: '#6F8F5E',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  card: 30,
  sheet: 38,
  arch: 999,
  pill: 999,
  input: 24,
} as const;

/**
 * Display typeface — Bricolage Grotesque (bundled via
 * @expo-google-fonts/bricolage-grotesque, loaded in app/_layout.tsx).
 * Used for headlines, screen titles and big numbers; body text stays on
 * the system font.
 */
export const font = {
  display: 'BricolageGrotesque_800ExtraBold',
  bold: 'BricolageGrotesque_700Bold',
} as const;

export const type = {
  display: { fontFamily: font.display, fontSize: 42, lineHeight: 46, letterSpacing: -0.8 },
  displayWide: { fontFamily: font.display, fontSize: 56, lineHeight: 60, letterSpacing: -1 },
  title: { fontFamily: font.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  subtitle: { fontFamily: font.bold, fontSize: 17, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.6 },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 1.1 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#8A3E1F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  glow: {
    shadowColor: '#B4552D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  float: {
    shadowColor: '#2E2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export type Breakpoint = 'compact' | 'medium' | 'wide' | 'desktop';

export interface Responsive {
  breakpoint: Breakpoint;
  width: number;
  /** Max width for the centered content column. */
  contentMaxWidth: number;
  /** Horizontal page padding. */
  pad: number;
  /** Columns for card grids. */
  columns: number;
  /** Two-pane list + detail layout (foldable unfolded / tablet / desktop). */
  twoPane: boolean;
  display: typeof type.display | typeof type.displayWide;
}

export function useResponsive(): Responsive {
  const { width } = useWindowDimensions();
  if (width < 600) {
    return {
      breakpoint: 'compact',
      width,
      contentMaxWidth: width,
      pad: 20,
      columns: 1,
      twoPane: false,
      display: type.display,
    };
  }
  if (width < 840) {
    return {
      breakpoint: 'medium',
      width,
      contentMaxWidth: 640,
      pad: 28,
      columns: 1,
      twoPane: false,
      display: type.displayWide,
    };
  }
  if (width < 1280) {
    return {
      breakpoint: 'wide',
      width,
      contentMaxWidth: 1024,
      pad: 32,
      columns: 2,
      twoPane: true,
      display: type.displayWide,
    };
  }
  return {
    breakpoint: 'desktop',
    width,
    contentMaxWidth: 1120,
    pad: 40,
    columns: 3,
    twoPane: true,
    display: type.displayWide,
  };
}
