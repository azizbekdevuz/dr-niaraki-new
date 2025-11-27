// Animation type definitions for better TypeScript support
import type { TargetAndTransition, VariantLabels, Transition } from 'framer-motion';

// Framer Motion compatible types
export interface MotionVariant {
  initial?: TargetAndTransition | VariantLabels;
  animate?: TargetAndTransition | VariantLabels;
  exit?: TargetAndTransition | VariantLabels;
  whileHover?: TargetAndTransition | VariantLabels;
  whileTap?: TargetAndTransition | VariantLabels;
  whileInView?: TargetAndTransition | VariantLabels;
  viewport?: {
    once?: boolean;
    margin?: string;
    amount?: number;
  };
  transition?: Transition;
}

export interface AnimationProps {
  initial?: TargetAndTransition | VariantLabels;
  animate?: TargetAndTransition | VariantLabels;
  exit?: TargetAndTransition | VariantLabels;
  transition?: Transition;
}

export interface HoverAnimations {
  hover: TargetAndTransition;
  tap: TargetAndTransition;
}

export interface ButtonAnimations extends HoverAnimations {
  transition: Transition;
}

export interface SocialAnimations {
  hover: (isMobile: boolean) => TargetAndTransition;
  tap: TargetAndTransition;
}

export interface CardAnimationProps {
  initial: TargetAndTransition | VariantLabels;
  animate?: TargetAndTransition | VariantLabels;
  exit?: TargetAndTransition | VariantLabels;
  whileInView?: TargetAndTransition | VariantLabels;
  viewport?: {
    once: boolean;
    margin: string;
  };
}

export type TransitionFunction = (index: number) => Transition; 