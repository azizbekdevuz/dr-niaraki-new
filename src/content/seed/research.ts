export const researchSeed = {
  heroIntro:
    'Advancing the frontiers of Geo-AI, Extended Reality, and Human-Computer Interaction through innovative research and international collaboration.',
  collaborationHeading: 'Interested in Research Collaboration?',
  collaborationBody:
    "I'm always looking for talented researchers and students to collaborate on cutting-edge projects in Geo-AI, XR, and spatial computing.",
  interests: [
    {
      id: 'geo-ai',
      name: 'Geo-AI & Spatial Computing',
      description:
        'Integration of artificial intelligence with geographic information systems for smart city applications, spatial analysis, and decision support systems.',
      keywords: ['Machine Learning', 'Deep Learning', 'Spatial Analysis', 'GIS', 'Smart Cities'],
      iconName: 'Lightbulb' as const,
    },
    {
      id: 'xr',
      name: 'Extended Reality (XR)',
      description:
        'Research in Virtual Reality (VR), Augmented Reality (AR), and Mixed Reality (MR) applications for education, navigation, and human-computer interaction.',
      keywords: ['VR', 'AR', 'MR', 'Metaverse', 'HCI'],
      iconName: 'Microscope' as const,
    },
    {
      id: 'iot',
      name: 'IoT & Ubiquitous Computing',
      description:
        'Development of sensor networks, ubiquitous systems, and context-aware computing solutions for environmental monitoring and smart environments.',
      keywords: ['Sensors', 'Ubiquitous GIS', 'Context-Aware', 'Smart Environment'],
      iconName: 'FolderGit2' as const,
    },
    {
      id: 'nlp',
      name: 'NLP & Language Models',
      description:
        'Natural Language Processing applications including semantic analysis, information retrieval, and integration with geospatial systems.',
      keywords: ['NLP', 'LLM', 'Semantic Web', 'Information Retrieval'],
      iconName: 'Lightbulb' as const,
    },
  ],
  projects: [
    {
      id: 'xr-metaverse',
      title: 'Super-Realistic XR Technology Research Center',
      description:
        'Research in Real-Virtual Interconnected Metaverse, developing cutting-edge XR technologies for immersive experiences.',
      period: '2022 - 2030',
      funding: 'IITP, Ministry of Science and ICT',
      amount: '~$750,000/year',
      status: 'ongoing' as const,
      role: 'Key Research Member',
    },
    {
      id: 'mvr-rc',
      title: 'Mobile Virtual Reality Research Center (MVR-RC)',
      description:
        'International mega research project collaborating with 14 universities across 8 countries and 11 industrial companies.',
      period: '2017 - 2021',
      funding: 'Korean Ministry of Science and ICT',
      amount: '~$660,000/year',
      status: 'completed' as const,
      role: 'Key Research Member',
    },
    {
      id: 'ksp',
      title: 'Knowledge Sharing Project (KSP)',
      description: 'Industry/Trade Policy Consulting with ETRI and Iranian Vice Presidency for Science and Technology.',
      period: '2016 - 2017',
      funding: 'Ministry of Strategy and Finance',
      amount: '$300,000',
      status: 'completed' as const,
      role: 'Strategic Consultant',
    },
    {
      id: 'malaria',
      title: 'Malaria Susceptibility Mapping',
      description:
        'Development of GIS-based decision-making application for healthcare mapping and disease susceptibility analysis.',
      period: 'Sept 2013 - Sept 2015',
      funding: 'Korean National Research Foundation',
      amount: '$30,000',
      status: 'completed' as const,
      role: 'Principal Investigator',
    },
  ],
} as const;
