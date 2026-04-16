export type Theme = 'dark' | 'light';

/** Theme tokens for CSS spatial backgrounds and XR canvas accent. */
export const themeColors = {
  dark: {
    gradientStart: '#0f2027',
    gradientMid: '#152d36',
    gradientEnd: '#203a43',
    gradientDeep: '#040814',
    accentHex: '#22d3ee',
  },
  light: {
    gradientStart: '#e8f6ff',
    gradientMid: '#c4e8f5',
    gradientEnd: '#8ec4dc',
    gradientDeep: '#e2eef6',
    accentHex: '#0891b2',
  },
} satisfies Record<
  Theme,
  {
    gradientStart: string;
    gradientMid: string;
    gradientEnd: string;
    gradientDeep: string;
    accentHex: string;
  }
>;
