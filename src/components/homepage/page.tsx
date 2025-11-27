"use client";

import React from "react";

import Divider from "@/components/shared/Divider";
import LazyComponentWrapper from "@/components/shared/LazyComponentWrapper";

// Lazy load heavy components
const About = React.lazy(() => import("./About/About"));
const Hero = React.lazy(() => import("./Hero/Hero"));

// Performance: Component now uses context instead of prop drilling
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-foreground">
      <LazyComponentWrapper
        resourceId="hero-component"
        priority="high"
      >
        <Hero />
      </LazyComponentWrapper>
      
      <Divider variant="default" />
      
      <LazyComponentWrapper
        resourceId="about-component"
        priority="medium"
      >
        <About />
      </LazyComponentWrapper>
    </div>
  );
}
