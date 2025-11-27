import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import React from "react";

// Performance: Define animation variants outside component
const overlayAnimations = {
  initial: { opacity: 0, x: "100%" },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: "100%" },
  transition: { type: "spring", stiffness: 400, damping: 25 },
} as const;

const itemAnimations = {
  whileHover: { y: -2, color: "var(--accent-primary)" },
  whileTap: { y: 0 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
} as const;

// Performance: Menu items as constant
const MENU_ITEMS = ["Experience"] as const;

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose }) => (
  <AnimatePresence mode="wait">
    {isOpen && (
      <motion.div
        {...overlayAnimations}
        className="fixed inset-0 z-modal bg-overlay-strong backdrop-blur-md gpu-accelerated"
      >
        {/* Close Button */}
        <div className="flex justify-end p-4 md:p-6">
          <motion.button 
            onClick={onClose} 
            className="p-2 md:p-3 rounded-full hover:bg-surface-hover transition-colors duration-fast text-foreground gpu-accelerated"
            whileHover={{ rotate: 90, y: -1 }}
            whileTap={{ rotate: 0 }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>

        {/* Menu Items */}
        <nav 
          className="flex flex-col items-center justify-center h-full space-y-6 md:space-y-8"
          aria-label="Main navigation"
        >
          {MENU_ITEMS.map((item) => (
            <motion.div
              key={item}
              {...itemAnimations}
            >
              <Link 
                href={`/${item.toLowerCase()}`}
                className="text-2xl md:text-3xl font-bold text-foreground hover:text-accent-primary transition-colors duration-fast gpu-accelerated"
                onClick={onClose} // Close menu on navigation
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MenuOverlay;
