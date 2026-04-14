// Animation Constants
export const ANIMATION_DURATION = {
  FAST: 0.22,
  NORMAL: 0.38,
  SLOW: 0.48,
  VERY_SLOW: 0.75,
} as const;

export const ANIMATION_EASE = {
  EASE_OUT: "easeOut",
  EASE_IN: "easeIn", 
  EASE_IN_OUT: "easeInOut",
  BACK_OUT: "backOut",
} as const;

export const ANIMATION_DELAYS = {
  NONE: 0,
  SHORT: 0.06,
  MEDIUM: 0.12,
  LONG: 0.22,
  VERY_LONG: 0.32,
} as const;

// Layout Constants
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1920,
} as const;

export const SPACING = {
  SECTION_PADDING: {
    MOBILE: 16,
    DESKTOP: 24,
  },
  CONTAINER_MAX_WIDTH: 1440,
  HEADER_HEIGHT: 96, // 6rem = 96px
} as const;

// Component Size Constants
export const COMPONENT_SIZES = {
  ICON: {
    SMALL: 16,
    MEDIUM: 20,
    LARGE: 24,
    EXTRA_LARGE: 32,
  },
  BUTTON: {
    PADDING_X: 32, // 8 * 4 = 32px
    PADDING_Y: 16, // 4 * 4 = 16px
  },
  CARD: {
    PADDING_MOBILE: 16,
    PADDING_DESKTOP: 24,
    BORDER_RADIUS: 12,
  },
} as const;

// Performance Constants
export const PERFORMANCE = {
  IMAGE_CACHE_TTL: 60 * 60 * 24 * 365, // 1 year in seconds
  LAZY_LOAD_OFFSET: "100px",
  DEBOUNCE_DELAY: 300,
} as const;

// Theme Constants
export const THEME = {
  COLORS: {
    PRIMARY: {
      400: "rgba(99, 179, 237, 1)",
      500: "rgba(99, 179, 237, 0.5)",
      600: "rgba(99, 179, 237, 0.6)",
    },
    GLASS: {
      LIGHT: "rgba(255, 255, 255, 0.05)",
      MEDIUM: "rgba(255, 255, 255, 0.1)",
      DARK: "rgba(255, 255, 255, 0.15)",
    },
  },
  BACKDROP_BLUR: "backdrop-blur-md",
} as const; 