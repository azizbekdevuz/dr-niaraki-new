import { motion } from "framer-motion";
import React, { useState } from "react";

import { useAppState } from "@/contexts/AppStateContext";
import { useHeroAnimations } from "@/hooks/useHeroAnimations";

import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";
import HeroSocialLinks from "./HeroSocialLinks";
import MenuOverlay from "./MenuOverlay";
import MobileMenu from "./MobileMenu";
import ResearchHighlights from "./ResearchHighlights";

const Hero: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Use context for shared state
  const { menuOpen, setMenuOpen } = useAppState();

  // Extract all animation logic to custom hook
  const {
    heroAnimations,
    buttonAnimations,
    socialAnimations,
    cardAnimationProps,
    getCardTransition,
    headingAnimation,
    handleExploreClick,
  } = useHeroAnimations();

  return (
    <motion.div
      {...heroAnimations.container}
      className="relative min-h-screen"
    >
      {/* Menu Components */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <MenuOverlay
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Main Hero Container */}
      <div className="container-custom pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16 py-12 md:py-16 lg:py-24">
          
          {/* Profile Image Section */}
          <HeroImage animation={heroAnimations.image} />

          {/* Main Content Section */}
          <HeroContent 
            animation={heroAnimations.content}
            onExploreClick={handleExploreClick}
            buttonAnimation={buttonAnimations}
          />
        </section>

        {/* Social Links */}
        <HeroSocialLinks 
          animation={heroAnimations.social}
          socialAnimations={socialAnimations}
        />

        {/* Research Highlights Section */}
        <ResearchHighlights 
          headingAnimation={headingAnimation}
          cardAnimationProps={cardAnimationProps}
          getCardTransition={getCardTransition}
        />
      </div>
    </motion.div>
  );
};

export default Hero;
