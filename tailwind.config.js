/** @type {import('tailwindcss').Config} */
module.exports = {
  // Performance: Optimized content paths for efficient purging
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  // Performance: Enable JIT mode optimizations
  mode: 'jit',
  
  // Performance: Minimize generated CSS
  corePlugins: {
    // Disable unused core plugins for smaller bundle
    preflight: true,
    container: false, // We use custom container classes
    accessibility: true,
    pointerEvents: true,
    visibility: true,
    position: true,
    inset: true,
    isolation: true,
    zIndex: true,
    order: true,
    gridColumn: true,
    gridColumnStart: true,
    gridColumnEnd: true,
    gridRow: true,
    gridRowStart: true,
    gridRowEnd: true,
    float: false, // Rarely used in modern layouts
    clear: false,  // Rarely used in modern layouts
  },

  theme: {
    // Performance: Use system fonts with fallbacks
    fontFamily: {
      sans: [
        'var(--font-inter)',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"'
      ],
      mono: [
        'var(--font-geist-mono)',
        'ui-monospace',
        'SFMono-Regular',
        '"SF Mono"',
        'Consolas',
        '"Liberation Mono"',
        'Menlo',
        'monospace'
      ],
    },

    extend: {
      // Performance: CSS custom properties for runtime theming efficiency
      colors: {
        // Base colors using CSS variables for theme switching
        background: "var(--background)",
        foreground: "var(--foreground)",
        
      // Note: Surface and text colors are defined as CSS variables in globals.css
      // Use utility classes: surface-primary, text-primary, etc. or CSS variables directly
        
        // Accent colors
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          tertiary: "var(--accent-tertiary)",
        },
        
        // Primary color system
        primary: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--button-primary-hover)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
        },
        
        // Secondary color system
        secondary: {
          DEFAULT: "transparent",
          hover: "var(--button-secondary-hover)",
          50: "rgba(168, 162, 255, 0.05)",
          100: "rgba(168, 162, 255, 0.1)",
          200: "rgba(168, 162, 255, 0.2)",
          300: "rgba(168, 162, 255, 0.3)",
          400: "rgba(168, 162, 255, 0.4)",
          500: "rgba(168, 162, 255, 0.5)",
          600: "rgba(168, 162, 255, 0.6)",
          700: "rgba(168, 162, 255, 0.7)",
          800: "rgba(168, 162, 255, 0.8)",
          900: "rgba(168, 162, 255, 0.9)",
        },

        // Semantic colors for better maintainability
        success: {
          DEFAULT: "#10b981",
          50: "rgba(16, 185, 129, 0.05)",
          500: "#10b981",
          600: "#059669",
        },
        warning: {
          DEFAULT: "#f59e0b",
          50: "rgba(245, 158, 11, 0.05)",
          500: "#f59e0b",
          600: "#d97706",
        },
        error: {
          DEFAULT: "#ef4444",
          50: "rgba(239, 68, 68, 0.05)",
          500: "#ef4444",
          600: "#dc2626",
        },

        // Glass morphism and overlay colors
        glass: {
          light: "rgba(255, 255, 255, 0.05)",
          medium: "rgba(255, 255, 255, 0.1)",
          strong: "rgba(255, 255, 255, 0.15)",
        },
        
        overlay: {
          light: "rgba(0, 0, 0, 0.3)",
          medium: "rgba(0, 0, 0, 0.5)",
          strong: "rgba(0, 0, 0, 0.7)",
        },
      },

      // Enhanced border system
      borderColor: {
        DEFAULT: "var(--border-primary)",
        primary: "var(--border-primary)",
        secondary: "var(--border-secondary)",
        accent: "var(--border-accent)",
        "accent-hover": "var(--border-accent-hover)",
        glass: "var(--border-primary)",
        subtle: "var(--border-secondary)",
      },

      // Background system
      backgroundColor: {
        subtle: "var(--alpha-100)",
        glass: "var(--alpha-200)",
        'surface-primary': "var(--surface-primary)",
        'surface-secondary': "var(--surface-secondary)",
        'surface-tertiary': "var(--surface-tertiary)",
        'surface-hover': "var(--surface-hover)",
      },

      // Performance: Optimized animations with hardware acceleration
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "rotate-slow": "rotateSlow 20s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },

      // Performance: GPU-accelerated keyframes
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 179, 237, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(99, 179, 237, 0.8)" },
        },
        rotateSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },

      // Performance: Optimized transitions
      transitionProperty: {
        DEFAULT: "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
        colors: "color, background-color, border-color, text-decoration-color, fill, stroke",
        opacity: "opacity",
        shadow: "box-shadow",
        transform: "transform",
        filter: "filter, backdrop-filter",
        size: "width, height",
      },

      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        slow: "300ms",
        slower: "500ms",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
        "in-out-cubic": "cubic-bezier(0.4, 0, 0.2, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      // Enhanced spacing system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      // Responsive design system
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },

      // Enhanced shadow system
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(99, 179, 237, 0.5)',
        'glow-lg': '0 0 40px rgba(99, 179, 237, 0.6)',
        'inner-glow': 'inset 0 2px 10px rgba(99, 179, 237, 0.2)',
      },

      // Enhanced backdrop blur
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },

      // Z-index system for maintainability
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        modal: '1040',
        popover: '1050',
        tooltip: '1060',
        cursor: '9999',
      },
    },
  },

  // Performance: Enable experimental features
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true,
    relativeContentPathsByDefault: true,
  },

  // Performance: Experimental features for better performance
  experimental: {
    optimizeUniversalDefaults: true,
  },

  plugins: [
    // Performance: Custom plugin for optimized utilities
    function({ addUtilities, addBase, theme }) {
      // Base optimizations
      addBase({
        // Performance: Optimize font rendering
        'html': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          'text-rendering': 'optimizeLegibility',
        },
        
        // Performance: GPU acceleration for common elements
        '*': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        
        // Performance: Optimize scrolling
        'body': {
          'overscroll-behavior': 'none',
          'scroll-behavior': 'smooth',
          '-webkit-overflow-scrolling': 'touch',
        },
      });

      // Custom utilities for performance
      addUtilities({
        // GPU acceleration utilities
        '.gpu': {
          'transform': 'translateZ(0)',
          'will-change': 'transform',
        },
        
        // Glass morphism utilities
        '.glass-effect': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'rgba(255, 255, 255, 0.05)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        
        // Container utilities
        '.container-custom': {
          'width': '100%',
          'max-width': theme('screens.2xl'),
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': theme('spacing.4'),
          'padding-right': theme('spacing.4'),
          '@screen sm': {
            'padding-left': theme('spacing.6'),
            'padding-right': theme('spacing.6'),
          },
          '@screen lg': {
            'padding-left': theme('spacing.8'),
            'padding-right': theme('spacing.8'),
          },
        },
        
        // Performance: Hide scrollbar but maintain functionality
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            'display': 'none',
          },
        },
        
        // Gradient text utility
        '.text-gradient': {
          'background': `linear-gradient(to right, ${theme('colors.primary.400')}, ${theme('colors.secondary.400')})`,
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
      });
    },
  ],
};

