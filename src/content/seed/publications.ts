import { EXTERNAL_URLS } from './urls';

export const publicationsSeed = {
  heroIntro:
    'Over 200 peer-reviewed publications in top-tier international journals and conferences, contributing to the advancement of Geo-AI, XR, and spatial computing.',
  scholarUrl: EXTERNAL_URLS.googleScholar,
  stats: {
    total: 200,
    journals: 120,
    conferences: 60,
    books: 5,
    phdAdvised: 6,
  },
  items: [
    {
      id: '1',
      title:
        'Cutting-Edge Strategies for Absence Data Identification in Natural Hazards: Leveraging Voronoi-Entropy in Flood Susceptibility Mapping with Advanced AI Techniques',
      authors: 'Razavi-Termeh, S. V., Sadeghi-Niaraki, A., et al.',
      journal: 'Journal of Hydrology',
      year: 2024,
      type: 'journal' as const,
      impactFactor: '5.9',
      quartile: 'Q1',
    },
    {
      id: '2',
      title:
        'Spatio-Temporal Modeling of Asthma-Prone Areas: Exploring the Influence of Urban Climate Factors with Explainable Artificial Intelligence (XAI)',
      authors: 'Razavi-Termeh, S. V., Sadeghi-Niaraki, A., et al.',
      journal: 'Sustainable Cities and Society',
      year: 2024,
      type: 'journal' as const,
      impactFactor: '10.5',
      quartile: 'Q1',
    },
    {
      id: '3',
      title:
        'Assessment of Noise Pollution-Prone Areas using an Explainable Geospatial Artificial Intelligence Approach',
      authors: 'Razavi-Termeh, S. V., Sadeghi-Niaraki, A., et al.',
      journal: 'Journal of Environmental Management',
      year: 2024,
      type: 'journal' as const,
      impactFactor: '8.0',
      quartile: 'Q1',
    },
    {
      id: '4',
      title: 'Internet of Thing (IoT) review of review: Bibliometric overview since its foundation',
      authors: 'Sadeghi-Niaraki, A.',
      journal: 'Future Generation Computer Systems',
      year: 2023,
      type: 'journal' as const,
      impactFactor: '7.3',
      quartile: 'Q1',
    },
    {
      id: '5',
      title: 'AR Search Engine: Semantic Information Retrieval for Augmented Reality Domain',
      authors: 'Shakeri, M., Sadeghi-Niaraki, A., et al.',
      journal: 'Sustainability',
      year: 2022,
      type: 'journal' as const,
      impactFactor: '3.9',
      quartile: 'Q2',
      doi: '10.3390/su142315681',
    },
    {
      id: '6',
      title:
        'Ontology-based and User-centric Spatial Modeling in GIS: Basics, Concepts, Methods, Applications',
      authors: 'Sadeghi-Niaraki, A.',
      journal: 'VDM Publishing',
      year: 2009,
      type: 'book' as const,
    },
    {
      id: '7',
      title: 'Python Programming for Engineering especially for GIS Engineering',
      authors: 'Sadeghi-Niaraki, A., Shakeri, M.',
      journal: 'K.N.Toosi University Publication',
      year: 2015,
      type: 'book' as const,
    },
    {
      id: '8',
      title: 'Spatial Analysis Programming using Python',
      authors: 'Sadeghi-Niaraki, A., Shakeri, M.',
      journal: 'K.N.Toosi University Publication',
      year: 2016,
      type: 'book' as const,
    },
  ],
} as const;
