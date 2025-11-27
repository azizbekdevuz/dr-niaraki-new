import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import React from "react";

// Performance: Define animation variants outside component
const mobileMenuAnimations = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
} as const;

// Performance: Menu items as constant
const MENU_ITEMS = ["Experience"] as const;

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => (
  <AnimatePresence mode="wait">
    {isOpen && (
      <motion.div
        {...mobileMenuAnimations}
        className="fixed inset-x-0 top-16 z-dropdown glass shadow-lg mx-4 rounded-xl gpu-accelerated"
      >
        {/* Menu Items */}
        <nav className="flex flex-col p-4" aria-label="Mobile navigation">
          {MENU_ITEMS.map((item) => (
            <Link 
              key={item} 
              href={`/${item.toLowerCase()}`}
              className="block py-3 px-2 text-base md:text-lg font-semibold text-foreground hover:text-accent-primary hover:bg-surface-hover rounded-lg transition-all duration-fast gpu-accelerated"
              onClick={onClose} // Close menu on navigation
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-surface-hover transition-colors duration-fast text-foreground gpu-accelerated"
          whileHover={{ rotate: 90, y: -1 }}
          whileTap={{ rotate: 0 }}
          aria-label="Close mobile menu"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MobileMenu;
