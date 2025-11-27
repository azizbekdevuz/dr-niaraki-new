'use client';

import React from 'react';

import LazyComponentWrapper from '@/components/shared/LazyComponentWrapper';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useAppLoading } from '@/hooks/useAppLoading';

// Lazy imports for heavy components
const BackgroundSelector = React.lazy(() => import('@/components/layout/BackgroundSelector'));
const AtomCursorClientWrapper = React.lazy(() => import('@/components/shared/AtomCursorClientWrapper'));
const Header = React.lazy(() => import('@/components/layout/Header'));
const Footer = React.lazy(() => import('@/components/layout/Footer'));
const ChatbotWrapper = React.lazy(() => import('@/components/shared/ChatbotWrapper'));

interface AppLayoutContentProps {
  children: React.ReactNode;
}

const AppLayoutContent: React.FC<AppLayoutContentProps> = ({ children }) => {
  const { isInitialLoading, progress, message, handleComponentLoad } = useAppLoading();

  // Show loading screen during initial load
  if (isInitialLoading) {
    return (
      <LoadingScreen 
        isLoading={true} 
        progress={progress}
        message={message}
      />
    );
  }

  return (
    <>
      {/* Background and cursor - loaded with medium priority */}
      <LazyComponentWrapper
        resourceId="atom-cursor"
        priority="medium"
        onLoad={() => handleComponentLoad('atom-cursor')}
      >
        <AtomCursorClientWrapper />
      </LazyComponentWrapper>

      <LazyComponentWrapper
        resourceId="background-selector"
        priority="medium"
        onLoad={() => handleComponentLoad('background-selector')}
      >
        <BackgroundSelector />
      </LazyComponentWrapper>

      {/* Main layout structure */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <LazyComponentWrapper
          resourceId="header-component"
          priority="high"
          onLoad={() => handleComponentLoad('header-component')}
        >
          <Header />
        </LazyComponentWrapper>
        
        <main className="flex-grow relative z-10">
          {children}
        </main>
        
        <LazyComponentWrapper
          resourceId="footer-component"
          priority="low"
          onLoad={() => handleComponentLoad('footer-component')}
        >
          <Footer />
        </LazyComponentWrapper>

        <LazyComponentWrapper
          resourceId="chatbot-component"
          priority="low"
          onLoad={() => handleComponentLoad('chatbot-component')}
        >
          <ChatbotWrapper />
        </LazyComponentWrapper>
      </div>
    </>
  );
};

export default React.memo(AppLayoutContent);
