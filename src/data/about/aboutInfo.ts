import type { LucideIcon } from "lucide-react";

// Performance: Proper type definitions for better maintainability
export interface TimelineItem {
  readonly id: string;
  readonly title: string;
  readonly institution: string;
  readonly year: string;
  readonly details: string;
  readonly icon: LucideIcon;
  readonly period?: string;
}

export interface Experience {
  readonly id: string;
  readonly position: string;
  readonly institution: string;
  readonly duration: string;
  readonly details: string;
  readonly achievements: readonly string[];
  readonly projects: readonly string[];
  readonly type: 'academic' | 'research' | 'consulting';
}

export interface Award {
  readonly id: string;
  readonly title: string;
  readonly organization: string;
  readonly year: string;
  readonly details: string;
  readonly impact: string;
  readonly category: 'research' | 'teaching' | 'service';
}

// Performance: Memoized constants to prevent re-creation
export const ACADEMIC_JOURNEY: readonly TimelineItem[] = [
  {
    id: 'phd-inha',
    title: "Ph.D. in Geo-Informatics Engineering",
    institution: "INHA University, South Korea",
    year: "2015",
    period: "2012-2015",
    details: "Specialized in advanced Geo-AI applications, spatial analysis, and the integration of artificial intelligence with geographic information systems for smart city applications.",
    icon: "GraduationCap" as unknown as LucideIcon,
  },
  {
    id: 'postdoc-melbourne',
    title: "Post-doctoral Research Fellow",
    institution: "University of Melbourne, Australia",
    year: "2016-2017",
    period: "2016-2017",
    details: "Focused on integrating Extended Reality (XR) technologies with geographical information systems, pioneering new approaches to spatial data visualization and interaction.",
    icon: "Building" as unknown as LucideIcon,
  },
  {
    id: 'msc-kntu',
    title: "M.Sc. in GIS Engineering",
    institution: "K.N. Toosi University of Technology, Iran",
    year: "2012",
    period: "2010-2012",
    details: "Comprehensive research in GIS applications for urban planning and environmental management, with thesis focusing on optimization algorithms for spatial analysis.",
    icon: "GraduationCap" as unknown as LucideIcon,
  },
  {
    id: 'bsc-kntu',
    title: "B.Sc. in Geomatics Engineering",
    institution: "K.N. Toosi University of Technology, Iran",
    year: "2010",
    period: "2006-2010",
    details: "Strong foundation in geospatial technologies, surveying, and civil engineering principles with emphasis on modern geodetic and mapping techniques.",
    icon: "GraduationCap" as unknown as LucideIcon,
  },
] as const;

export const PROFESSIONAL_EXPERIENCES: readonly Experience[] = [
  {
    id: 'assoc-prof-sejong',
    position: "Associate Professor",
    institution: "Sejong University, South Korea",
    duration: "2017 - Present",
    type: 'academic',
    details: "Leading cutting-edge research in Geo-AI, Extended Reality, and Urban Analytics while mentoring the next generation of spatial technology researchers.",
    achievements: [
      "Published 100+ high-impact research papers in top-tier journals",
      "Successfully supervised 25+ graduate students to completion",
      "Secured over $2M in competitive research funding",
      "Established international collaborations with 15+ institutions",
      "Developed innovative XR-based educational tools"
    ],
    projects: [
      "AI-Enhanced Smart City Development Platform",
      "Extended Reality Navigation and Wayfinding Systems",
      "Geo-AI for Climate Change Monitoring",
      "Digital Twin Urban Analytics Framework"
    ],
  },
  {
    id: 'research-consultant',
    position: "International Research Consultant",
    institution: "Global Technology Partners",
    duration: "2015 - Present",
    type: 'consulting',
    details: "Providing expert consultation on GIS implementation, spatial analysis, and technology integration for international development projects.",
    achievements: [
      "Led 20+ international GIS implementation projects",
      "Developed innovative solutions for developing countries",
      "Trained 500+ professionals in spatial technologies",
      "Established best practices for cross-cultural tech deployment"
    ],
    projects: [
      "Smart Urban Planning Systems for ASEAN Cities",
      "Environmental Monitoring Networks in Pacific Islands",
      "Transportation Analytics for European Smart Cities",
      "Disaster Management Systems for Southeast Asia"
    ],
  },
] as const;

export const NOTABLE_AWARDS: readonly Award[] = [
  {
    id: 'best-research-2023',
    title: "Excellence in Geo-AI Research Award",
    organization: "International Association of Geodesy",
    year: "2023",
    category: 'research',
    details: "Recognition for groundbreaking contributions to the integration of artificial intelligence with geospatial technologies and smart city development.",
    impact: "Research has been cited by 300+ international scholars and implemented in 5+ smart city projects globally.",
  },
  {
    id: 'educator-2022',
    title: "Outstanding Educator in Spatial Technologies",
    organization: "Sejong University",
    year: "2022",
    category: 'teaching',
    details: "Acknowledged for innovation in teaching methodologies, particularly in XR-based education and mentorship excellence.",
    impact: "Developed curriculum adopted by 10+ universities, improved student engagement by 60%, and mentored award-winning research teams.",
  },
  {
    id: 'innovation-2021',
    title: "Innovation in XR Applications Award",
    organization: "IEEE Virtual Reality Society",
    year: "2021",
    category: 'research',
    details: "Honored for pioneering work in Extended Reality applications for spatial data visualization and human-computer interaction.",
    impact: "Technology has been licensed to 3 companies and integrated into commercial GIS platforms used by 50,000+ users.",
  },
] as const;

// Performance: Statistics constants for quick access
export const CAREER_STATS = {
  publications: 100,
  years_experience: 15,
  projects_completed: 30,
  students_supervised: 25,
  countries_collaborated: 20,
  citations: 2500,
} as const;

// Performance: Export type for component consumption
export type AboutDataInfo = {
  academicJourney: typeof ACADEMIC_JOURNEY;
  experiences: typeof PROFESSIONAL_EXPERIENCES;
  awards: typeof NOTABLE_AWARDS;
  stats: typeof CAREER_STATS;
};