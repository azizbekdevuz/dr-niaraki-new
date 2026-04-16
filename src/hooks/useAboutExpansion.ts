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

  /** Collapse journey cards (e.g. when homepage journey page changes). */
  const clearJourneyExpansion = useCallback(() => {
    setExpandedJourney(null);
  }, []);

  /** Collapse award cards (e.g. when homepage awards page changes). */
  const clearAwardExpansion = useCallback(() => {
    setExpandedAward(null);
  }, []);

  /** Collapse experience cards (e.g. when homepage experience page changes). */
  const clearExperienceExpansion = useCallback(() => {
    setExpandedExperience(null);
  }, []);

  return {
    toggleJourneyExpansion,
    toggleExperienceExpansion,
    toggleAwardExpansion,

    isJourneyExpanded,
    isExperienceExpanded,
    isAwardExpanded,

    clearJourneyExpansion,
    clearAwardExpansion,
    clearExperienceExpansion,
  };
}; 