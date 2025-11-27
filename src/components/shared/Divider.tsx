import { memo } from 'react';

import { MotionDiv } from '@/lib/motion';

interface DividerProps {
  /** Optional className for additional styling */
  className?: string;
  /** Variant of the divider */
  variant?: 'default' | 'glow' | 'gradient';
}

/**
 * Section Divider Component
 * 
 * A horizontal divider component designed to visually separate page sections.
 * Features a subtle glow effect and animation to ensure visibility while
 * maintaining elegance.
 */
const Divider = memo<DividerProps>(({ 
  className = '', 
  variant = 'default' 
}) => {
  const baseClasses = 'w-full my-12 md:my-16 lg:my-24 flex justify-center';
  
  const variantClasses = {
    default: 'h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent ring-1 ring-accent-primary/40 shadow-[0_2px_8px_var(--shadow-secondary)]',
    glow: 'h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent ring-1 ring-accent-primary/50 shadow-[0_0_15px_var(--shadow-glow),0_2px_8px_var(--shadow-primary)]',
    gradient: 'h-0.5 bg-gradient-to-r from-accent-primary/20 via-accent-primary to-accent-secondary/20 ring-1 ring-accent-primary/40 shadow-[0_3px_10px_var(--shadow-primary)]'
  };

  return (
    <div className={`${baseClasses} ${className}`} role="separator" aria-hidden="true">
      <MotionDiv
        className={`w-full max-w-4xl ${variantClasses[variant]}`}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ 
          duration: 0.8, 
          ease: 'easeOut',
          opacity: { duration: 0.4 }
        }}
        style={{ originX: 0.5 }}
      />
    </div>
  );
});

Divider.displayName = 'Divider';

export default Divider;
