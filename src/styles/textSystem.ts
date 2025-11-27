export interface TextSystem {
  dark: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    muted: string;
    gradient: string;
    heading: string;
    body: string;
    caption: string;
    interactive: string;
    interactiveHover: string;
  };
  light: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    muted: string;
    gradient: string;
    heading: string;
    body: string;
    caption: string;
    interactive: string;
    interactiveHover: string;
  };
}

const textSystem: TextSystem = {
  dark: {
    // Primary text hierarchy
    primary: "text-white",
    secondary: "text-gray-100",
    tertiary: "text-blue-200",
    accent: "text-primary-400",
    muted: "text-gray-300",
    
    // Semantic text styles
    heading: "text-white font-bold",
    body: "text-gray-100",
    caption: "text-gray-300 text-sm",
    
    // Interactive states
    interactive: "text-primary-400 hover:text-primary-300 transition-colors",
    interactiveHover: "text-primary-300",
    
    // Gradient text
    gradient: "from-primary-400 via-blue-400 to-secondary-400",
  },
  light: {
    // Primary text hierarchy
    primary: "text-gray-900",
    secondary: "text-blue-800",
    tertiary: "text-blue-700",
    accent: "text-blue-600",
    muted: "text-gray-600",
    
    // Semantic text styles
    heading: "text-gray-900 font-bold",
    body: "text-gray-800",
    caption: "text-gray-600 text-sm",
    
    // Interactive states
    interactive: "text-blue-600 hover:text-blue-700 transition-colors",
    interactiveHover: "text-blue-700",
    
    // Gradient text
    gradient: "from-blue-600 via-blue-700 to-purple-700",
  },
};

// Utility functions for consistent text styling
export const getTextVariant = (variant: keyof TextSystem['dark'], theme: 'dark' | 'light' = 'dark') => {
  return textSystem[theme][variant];
};

// Pre-defined text combinations for common use cases
export const textVariants = {
  hero: {
    dark: "text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-400 to-secondary-400",
    light: "text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700",
  },
  subtitle: {
    dark: "text-xl md:text-2xl lg:text-3xl text-gray-100",
    light: "text-xl md:text-2xl lg:text-3xl text-blue-800",
  },
  body: {
    dark: "text-base md:text-lg lg:text-xl text-gray-100",
    light: "text-base md:text-lg lg:text-xl text-gray-800",
  },
  caption: {
    dark: "text-sm text-gray-300",
    light: "text-sm text-gray-600",
  },
  link: {
    dark: "text-primary-400 hover:text-primary-300 transition-colors duration-200",
    light: "text-blue-600 hover:text-blue-700 transition-colors duration-200",
  },
} as const;

export default textSystem;