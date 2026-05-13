import { createAnimations } from '@tamagui/animations-react-native'
import { shorthands } from '@tamagui/shorthands'
import { tokens as defaultTokens } from '@tamagui/themes'
import { createFont, createTamagui, createTokens } from 'tamagui'

const animations = createAnimations({
  fast: { type: 'spring', damping: 20, mass: 1, stiffness: 250 },
  medium: { type: 'spring', damping: 10, stiffness: 100 },
  slow: { type: 'spring', damping: 20, stiffness: 60 },
})

// --- Typography (HeroUI Style Mapping) ---

const headingFont = createFont({
  family: 'Manrope',
  size: { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64 },
  weight: { 4: '400', 6: '600', 7: '700', 8: '800' },
  face: {
    400: { normal: 'Manrope-Regular' },
    600: { normal: 'Manrope-SemiBold' },
    700: { normal: 'Manrope-Bold' },
    800: { normal: 'Manrope-ExtraBold' },
  },
})

const bodyFont = createFont({
  family: 'Plus Jakarta Sans',
  size: { 1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 24 },
  weight: { 4: '400', 5: '500', 6: '600', 7: '700' },
  face: {
    400: { normal: 'PlusJakartaSans-Regular' },
    500: { normal: 'PlusJakartaSans-Medium' },
    600: { normal: 'PlusJakartaSans-SemiBold' },
    700: { normal: 'PlusJakartaSans-Bold' },
  },
})

// --- Tokens (Using HeroUI Semantic Naming) ---

const customTokens = createTokens({
  ...defaultTokens,
  color: {
    ...defaultTokens.color,
    // Brand Palette
    primary: '#546354',
    primaryLow: '#d6e7d4',
    primaryLowDark: '#3d4b3d',
    primaryForeground: '#fbf9f6',
    secondary: '#8f4c42',
    secondaryForeground: '#ffffff',
    error: "#aa371c",
    buttonBg: '#546354',
    // Surface Palette (Hearth Editorial Cream)
    background: '#fbf9f6',
    foreground: '#313330',
    muted: '#5e5f5c',

    // Semantic Helpers
    border: '#31333015',
    card: '#f5f3f0',

  },
  radius: {
    ...defaultTokens.radius,
    full: 999999999
  }
})

// --- Config ---

const config = createTamagui({
  animations,
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens: customTokens,
  themes: {
    light: {
      background: customTokens.color.background,
      color: customTokens.color.foreground,
      colorMuted: customTokens.color.muted,
      primary: customTokens.color.primary,
      primaryLow: customTokens.color.primaryLow,
      primaryForeground: customTokens.color.primaryForeground,
      secondary: customTokens.color.secondary,
      secondaryForeground: customTokens.color.secondaryForeground,
      borderColor: customTokens.color.border,
      card: customTokens.color.card,
      error: customTokens.color.error,
      buttonBg: customTokens.color.buttonBg
    },
    dark: {
      background: '#1a1c19',
      color: '#e2e3de',
      colorMuted: '#8e9289',
      primary: '#d6e7d4',
      primaryLow: customTokens.color.primaryLowDark,
      primaryForeground: '#1a1c19',
      secondary: '#ffdad4',
      secondaryForeground: '#1d1e1b',
      borderColor: '#31333030',
      card: '#1d1e1b',
      error: customTokens.color.error,
      buttonBg: customTokens.color.buttonBg
    },
  }
})

export type AppConfig = typeof config
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig { }
}

export default config