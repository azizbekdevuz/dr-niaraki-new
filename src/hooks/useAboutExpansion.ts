import { useCallback, useState } from 'react';

export const useAboutExpansion = () => {
  const [expandedJourney, setExpandedJourney] = useState<number | null>(null);
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null);
  const [expandedAward, setExpandedAward] = useState<number | null>(null);

  // Journey expansion handlers
  const toggleJourneyExpansion = useCallback((index: number) => {
    setExpandedJourney(prev => prev === index ? null : index);
  }, []);

  // Experience expansion handlers
  const toggleExperienceExpansion = useCallback((index: number) => {
    setExpandedExperience(prev => prev === index ? null : index);
  }, []);

  // Award expansion handlers
  const toggleAwardExpansion = useCallback((index: number) => {
    setExpandedAward(prev => prev === index ? null : index);
  }, []);

  // Check if item is expanded
  const isJourneyExpanded = useCallback((index: number) => 
    expandedJourney === index, [expandedJourney]);

  const isExperienceExpanded = useCallback((index: number) => 
    expandedExperience === index, [expandedExperience]);

  const isAwardExpanded = useCallback((index: number) => 
    expandedAward === index, [expandedAward]);

  // Reset all expansions
  const resetAllExpansions = useCallback(() => {
    setExpandedJourney(null);
    setExpandedExperience(null);
    setExpandedAward(null);
  }, []);

  return {
    // State
    expandedJourney,
    expandedExperience,
    expandedAward,
    
    // Handlers
    toggleJourneyExpansion,
    toggleExperienceExpansion,
    toggleAwardExpansion,
    
    // Checkers
    isJourneyExpanded,
    isExperienceExpanded,
    isAwardExpanded,
    
    // Utilities
    resetAllExpansions,
  };
}; 