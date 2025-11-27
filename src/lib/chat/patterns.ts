import type { SemanticPattern } from './types';

export const SEMANTIC_PATTERNS: SemanticPattern[] = [
  {
    category: 'education',
    patterns: [
      /(education|degree|university|phd|study|qualification)/i,
      /(where|which|what).*(study|graduate|degree)/i,
      /(background|qualification)/i
    ],
    response: "Dr. Niaraki holds a Ph.D. in Geo-Informatics Engineering from INHA University (2005-2008), an M.Sc. in GIS Engineering from K.N. Toosi University of Technology (2000-2002), and a B.Sc. in Geomatics-Civil Engineering from KNTU (1995-1999). He also completed post-doctoral fellowships at the University of Melbourne (2012) and INHA University (2008-2009).",
    followUp: "Would you like to know about his research work during his studies or his post-doctoral experiences?"
  },
  {
    category: 'experience',
    patterns: [
      /(experience|work|position|job|career)/i,
      /(where|which).*(work|employed|position)/i,
      /(current|present).*(position|role)/i
    ],
    response: "Dr. Niaraki is currently an Associate Professor in the Department of Computer Science & Engineering at Sejong University (2017-present) and a Research Professor at the XR Metaverse Research Center (2022-2030). Previously, he was an Assistant Professor at INHA University (2009-2017) and has held positions at various institutions including the University of Melbourne and KSIC. He has over 15 years of academic experience.",
    followUp: "Would you like to know about his specific research projects or teaching experience?"
  },
  {
    category: 'research',
    patterns: [
      /(research|project|investigation)/i,
      /(what|which).*(research|study|investigate)/i,
      /(focus|area|specialization)/i
    ],
    response: "Dr. Niaraki's research focuses on Geo-AI, GIS, HCI, IoT, and Metaverse technologies. He has led major projects including the Super-Realistic XR Technology Research Center (2022-2030) and Mobile Virtual Reality Research Center (2017-2021). His research has been supported by the Korean Ministry of Science and ICT, with projects totaling over $9.3M in funding.",
    followUp: "Would you like to know about his specific research achievements or publications?"
  },
  {
    category: 'publications',
    patterns: [
      /(publication|paper|journal|article)/i,
      /(how many|number of).*(paper|publication)/i,
      /(publish|author)/i
    ],
    response: "Dr. Niaraki has published over 200 peer-reviewed papers in top-tier journals and international conferences. He has also published two books on Python programming for GIS applications. His research focuses on Geo-AI, XR technologies, and spatial computing.",
    followUp: "Would you like to know about his most cited works or recent publications?"
  },
  {
    category: 'patents',
    patterns: [
      /(patent|invention|innovation)/i,
      /(how many|number of).*(patent)/i,
      /(invent|develop)/i
    ],
    response: "Dr. Niaraki has secured 22+ patents in spatial analysis and XR technologies, including both US and Korean patents. These patents demonstrate his significant contributions to technological innovation in the field.",
    followUp: "Would you like to know about specific patents or his innovation process?"
  },
  {
    category: 'contact',
    patterns: [
      /(contact|email|phone|reach|address)/i,
      /(how|where).*(contact|reach|email)/i,
      /(website|linkedin|social)/i
    ],
    response: "You can reach Dr. Niaraki at his official email: a.sadeghi@sejong.ac.kr or personal email: a.sadeqi313@gmail.com. His office is located at Sejong University, 209- Gwangjin-gu, Gunja-dong, Neungdong-ro, Seoul, Republic of Korea. Phone: +82 2-3408-2981, Cell: +82 10 4253-5-313. You can also visit his website: www.abolghasemsadeghi-n.com or find him on LinkedIn and Google Scholar.",
    followUp: "Would you like to know about his office location or preferred contact method?"
  },
  {
    category: 'teaching',
    patterns: [
      /(teaching|course|class|lecture|student)/i,
      /(teach|supervise|mentor)/i,
      /(student|graduate|phd)/i
    ],
    response: "Dr. Niaraki has supervised 40+ Master's and 6+ Ph.D. students during his 15 years of academic experience. He teaches courses in Artificial Intelligence and Big Data, Human-Computer Interaction (HCI), Advanced XR Technologies, and IoT and Biometrics Applications at Sejong University.",
    followUp: "Would you like to know about specific courses or his teaching philosophy?"
  },
  {
    category: 'awards',
    patterns: [
      /(award|honor|recognition|achievement)/i,
      /(receive|win|earn).*(award|recognition)/i,
      /(prestigious|notable)/i
    ],
    response: "Dr. Niaraki has received several prestigious awards including the Australian Endeavour Fellowship Award in 2012. He is recognized as one of the top 2% scientists in the Stanford-Elsevier dataset for 2024 and was honored as one of the top 100 international distinguished researchers by the Australian Government. He is also a Fellow at Harvard's Spatial Data Lab (SDL) and a member of the American Association of Geographers (AAG).",
    followUp: "Would you like to know about specific awards or his research impact?"
  },
  {
    category: 'skills',
    patterns: [
      /(skill|expertise|ability|technology)/i,
      /(what|which).*(technology|tool|software)/i,
      /(proficient|expert|specialist)/i
    ],
    response: "Dr. Niaraki is an expert in Geo-AI, GIS, HCI, IoT, and Metaverse technologies. He is skilled in TensorFlow, Hugging Face, LangChain, and big data technologies including Apache Spark, PySpark, and Hadoop. He has published two books on Python programming for GIS applications and is proficient in web development, XR technologies, and bioinformatics sensors.",
    followUp: "Would you like to know about his specific technical skills or research methodologies?"
  }
];

