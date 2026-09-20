export const colors = {
  canvas: { light: "#F7F5F2", dark: "#121212" },
  surface: { light: "#FFFFFF", dark: "#1D1D1D" },
  surfaceContainer: { light: "#EFEEEB", dark: "#242424" },
  surfaceContainerHigh: { light: "#E8E6E2", dark: "#2B2B2B" },
  ink: { light: "#1D1B20", dark: "#F5F2F7" },
  mutedInk: { light: "#6F6A72", dark: "#B8B2BA" },
  line: { light: "#DED9E0", dark: "#464248" },
  primary: { light: "#7A4A2B", dark: "#E7B99A" },
  primaryContainer: { light: "#FFDBCA", dark: "#5C3925" },
  onPrimary: { light: "#FFFFFF", dark: "#442616" },
  success: { light: "#386A20", dark: "#A6D58D" },
  warning: { light: "#795900", dark: "#F4CA63" },
  danger: { light: "#BA1A1A", dark: "#FFB4AB" },
  focus: { light: "#7A4A2B", dark: "#E7B99A" },
} as const;

export const spacing = {
  1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px",
  6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px", 20: "80px",
} as const;

export const radius = {
  small: "12px", medium: "16px", large: "28px", full: "9999px",
} as const;

export const motion = {
  duration: { fast: "120ms", base: "200ms", slow: "320ms" },
  easing: {
    standard: [0.2, 0, 0, 1] as const,
    emphasized: [0.2, 0, 0, 1] as const,
  },
} as const;

export const layout = {
  maxWidth: "1280px",
  desktopRail: "248px",
  mobileBar: "80px",
} as const;
