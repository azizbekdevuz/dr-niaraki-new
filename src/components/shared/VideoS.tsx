'use client';

import { motion } from "framer-motion";
import { Play, Volume2, VolumeX } from "lucide-react";
import React, { memo, useCallback, useState } from "react";

import { useDevice } from "@/components/shared/DeviceProvider";
import { textVariants } from "@/styles/textSystem";

// Performance: Type definitions
interface VideoPlayerProps {
  readonly videoId?: string;
  readonly title?: string;
  readonly className?: string;
}

// Performance: Constants to prevent re-creation - FIXED: Correct video ID
const DEFAULT_VIDEO_ID = "Iqr3XIhSnUQ";
const DEFAULT_TITLE = "Meet Dr. Sadeghi-Niaraki - Research Excellence in XR & AI";

// Performance: Animation variants
const videoAnimations = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  frame: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { delay: 0.2, duration: 0.8, ease: "backOut" }
  }
} as const;

// Performance: Memoized component
const VideoPlayer: React.FC<VideoPlayerProps> = memo(({ 
  videoId = DEFAULT_VIDEO_ID,
  title = DEFAULT_TITLE
}) => {
  const { isMobile, isDesktop } = useDevice();
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Performance: Memoized handlers
  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <motion.section
      {...videoAnimations.container}
      className="flex flex-col items-center justify-center"
      aria-labelledby="video-title"
    >
      {/* Title - FIXED: Using textVariants properly */}
      <motion.h3
        id="video-title"
        className="flex items-center mb-6 md:mb-8 text-lg md:text-2xl font-bold text-foreground text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Play 
          className="text-accent-primary mr-2" 
          size={isMobile ? 20 : 24}
          aria-hidden="true" 
        />
        <span className="leading-tight">{title}</span>
      </motion.h3>

      {/* Video Container - FIXED: Better mobile responsiveness */}
      <motion.div
        {...videoAnimations.frame}
        className={`relative group w-full gpu-accelerated ${isMobile ? 'max-w-full px-2' : 'max-w-2xl'}`}
      >
        {/* Animated Background Gradient - UPDATED: Using new color scheme */}
        <div 
          className="absolute -inset-1 bg-gradient-to-r from-accent-primary/50 via-accent-secondary/50 to-accent-primary/50 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-all duration-500 gpu-accelerated"
          style={{
            background: 'linear-gradient(-45deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary), var(--accent-tertiary))',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 15s ease infinite'
          }}
          aria-hidden="true"
        />

        {/* Main Container - FIXED: Better aspect ratio handling for mobile, NO BLUR ON HOVER */}
        <div className={`relative ${isMobile ? 'p-0.5' : 'p-1'} glass rounded-xl ring-1 ring-accent-primary/20 shadow-2xl gpu-accelerated`}>
          {/* Inner Border with Glow */}
          <div className="relative rounded-lg overflow-hidden shadow-glow">
            
            {/* Aspect Ratio Container - FIXED: Proper mobile sizing */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              
              {/* Corner Accents */}
              {isDesktop && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 md:w-4 md:h-4 border-l-2 border-t-2 border-accent-primary z-10" aria-hidden="true" />
                  <div className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 border-r-2 border-t-2 border-accent-primary z-10" aria-hidden="true" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 md:w-4 md:h-4 border-l-2 border-b-2 border-accent-primary z-10" aria-hidden="true" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 border-r-2 border-b-2 border-accent-primary z-10" aria-hidden="true" />
                </>
              )}

              {/* Error State - FIXED: Using textVariants */}
              {hasError && (
                <div className="absolute inset-0 bg-surface-primary flex flex-col items-center justify-center z-20 text-center p-4 md:p-6 gpu-accelerated">
                  <Play className="w-8 h-8 md:w-12 md:h-12 text-foreground/50 mb-3 md:mb-4" />
                  <p className={`font-medium mb-2 ${textVariants.body.dark}`}>Video Currently Unavailable</p>
                  <p className={`text-xs md:text-sm ${textVariants.caption.dark}`}>
                    Please check your connection or try again later
                  </p>
                </div>
              )}

              {/* Video Player - FIXED: Simplified loading logic */}
              {!hasError && (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1${isMuted ? '&mute=1' : ''}`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onError={handleError}
                  className="absolute inset-0 w-full h-full"
                />
              )}

              {/* Controls Overlay */}
              {isDesktop && (
                <div className="absolute top-3 md:top-4 right-3 md:right-4 z-30">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 md:p-2 bg-surface-primary hover:bg-surface-hover rounded-lg transition-all duration-fast hover:scale-105 border border-accent-primary/20 hover:border-accent-primary/40 gpu-accelerated"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-3 h-3 md:w-4 md:h-4 text-foreground" />
                    ) : (
                      <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tech Lines Decoration */}
        {isDesktop && (
          <div className="absolute -bottom-4 md:-bottom-6 left-1/2 transform -translate-x-1/2" aria-hidden="true">
            <div className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent mb-2" />
            <div className="w-20 md:w-24 h-px bg-gradient-to-r from-transparent via-accent-secondary to-transparent mx-auto" />
          </div>
        )}
      </motion.div>

      {/* Video Description - FIXED: Using textVariants */}
      <motion.p
        className={`mt-4 md:mt-6 text-center max-w-md px-4 ${textVariants.body.dark}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Discover the innovative research and vision driving the future of Extended Reality and Artificial Intelligence applications in spatial technologies.
      </motion.p>
    </motion.section>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
