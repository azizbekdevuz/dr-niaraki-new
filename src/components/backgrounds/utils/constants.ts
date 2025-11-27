export type Theme = "dark" | "light";

export const maxDistance = 150;
export const shapeNodesCount = 18;
export const targetFPS = 60;

export const themeColors = {
  dark: {
    background: "#000428",
    nodeColor: (hue: number) => `hsla(${hue}, 100%, 50%, 1)`,
    lineColor: (opacity: number) => `rgba(0, 165, 224, ${opacity})`,
    gradientStart: "#0f2027",
    gradientEnd: "#203a43",
  },
  light: {
    background: "#f0f8ff",
    nodeColor: (hue: number) => `hsla(${hue}, 100%, 30%, 1)`,
    lineColor: (opacity: number) => `rgba(0, 100, 200, ${opacity})`,
    gradientStart: "#9be2fc",
    gradientEnd: "#2c3e50",
  },
} satisfies Record<Theme, {
  background: string;
  nodeColor: (hue: number) => string;
  lineColor: (opacity: number) => string;
  gradientStart: string;
  gradientEnd: string;
}>;