export type VisualizationKind =
  | 'knowledge-hierarchy'
  | 'research-flow'
  | 'hydroponic-system'
  | 'cpu-architecture';

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export interface Project {
  slug: string;
  order: number;
  title: string;
  eyebrow: string;
  hook: string;
  summary: string;
  highlight: string;
  technologies: string[];
  visualization: {
    kind: VisualizationKind;
    accent: 'pink' | 'blue' | 'neutral';
  };
  caseStudy: {
    intro: string;
    role?: string;
    sections: { title: string; body: string }[];
  };
  images?: ProjectImage[];
  links?: { label: string; url: string }[];
}

// Approved facts from docs/SELECTED_WORK_CODEX_BRIEF.md; dates and original imagery are not yet confirmed.
export const projects: Project[] = [
  {
    slug: 'knowledge-bridge',
    order: 1,
    title: 'Knowledge Bridge',
    eyebrow: 'Human–AI',
    hook: 'Making AI-generated knowledge human-friendly.',
    summary:
      'A real-time workspace for exploring knowledge graphs, reviewing AI-generated relationships, and making human corrections.',
    highlight: '81% less loading time · 72% faster task completion',
    technologies: ['React', 'TypeScript', 'WebSockets', 'Python', 'FastAPI'],
    visualization: { kind: 'knowledge-hierarchy', accent: 'pink' },
    caseStudy: {
      intro:
        'I joined an early knowledge-graph proof of concept and refactored its architecture, performance, UX, and human–AI interactions.',
      role: 'Full-stack development, UX, performance, human–AI interaction',
      sections: [
        {
          title: 'Starting with a proof of concept',
          body: 'The graph-generation work already existed. My contribution focused on making a broken proof of concept usable, responsive, and easier to explore.',
        },
        {
          title: 'Progressive, on both sides',
          body: 'WebSocket-based progressive transmission, backend graph pagination and prioritization, and custom viewport- and zoom-dependent lazy rendering reduced the amount of information arriving and rendering at once.',
        },
        {
          title: 'Keeping people in the loop',
          body: 'People could correct AI-generated tags and relationships. Those corrections were sent back to the backend to support learning. The work achieved 81% less loading time and 72% faster task completion.',
        },
      ],
    },
  },
  {
    slug: 'trading-agent',
    order: 2,
    title: 'Trading Agent',
    eyebrow: 'Agentic AI',
    hook: 'Less market noise. More relevant research.',
    summary:
      'Context-aware investment research connecting news, company fundamentals, and portfolio context with an investment thesis and its risks.',
    highlight: 'Co-built in under a month',
    technologies: ['Python', 'LangGraph'],
    visualization: { kind: 'research-flow', accent: 'blue' },
    caseStudy: {
      intro:
        'Together with a colleague, I co-built a research application that evaluates potential opportunities in the context of a user’s portfolio.',
      role: 'Product ideation, UX, implementation; co-built with a colleague',
      sections: [
        {
          title: 'Research with context',
          body: 'LangGraph-driven workflows bring together news, forums, company data, and portfolio context to develop an investment thesis, positives, negatives, and a risk profile. Daily research typically surfaces one to three opportunities when warranted.',
        },
        {
          title: 'From discovery to conversation',
          body: 'The app tracks holdings and trades alongside geographic, sector, and currency diversification. Discovery and watchlists help follow companies; contextual real-time LLM chat supports company-specific questions.',
        },
        {
          title: 'A shared build',
          body: 'We co-built the application in less than a month, using AI extensively across ideation, UX, implementation, testing, and review.',
        },
      ],
    },
  },
  {
    slug: 'herby',
    order: 3,
    title: 'Herby',
    eyebrow: 'Hardware',
    hook: 'A smarter garden on a €100 budget.',
    summary:
      'An automated hydroponics system connecting sensor measurements with decisions and physical actions, under tight hardware constraints.',
    highlight: 'Automated hydroponics on a €100 budget',
    technologies: ['IoT', 'Embedded systems', 'Automation'],
    visualization: { kind: 'hydroponic-system', accent: 'neutral' },
    caseStudy: {
      intro:
        'For a university team project, I led software development and sensor setup and integration for a budget-constrained automated hydroponics system.',
      role: 'Software development lead, sensor setup and integration',
      sections: [
        {
          title: 'A physical feedback loop',
          body: 'The project connected measurements from sensors with software decisions and actuator responses to automate hydroponics.',
        },
        {
          title: 'Working within the budget',
          body: 'A €100 project budget shaped the team’s hardware choices and integration work. My focus was the software and the connection between the sensors and the system.',
        },
      ],
    },
  },
  {
    slug: 'custom-cpu-os',
    order: 4,
    title: 'Custom CPU & OS',
    eyebrow: 'Systems',
    hook: 'Building software from the hardware up.',
    summary:
      'Two semesters spanning a VHDL-defined processor architecture and an operating system built in C and Assembly.',
    highlight: 'One architecture. Two semesters. Hardware to OS.',
    technologies: ['VHDL', 'C', 'Assembly'],
    visualization: { kind: 'cpu-architecture', accent: 'neutral' },
    caseStudy: {
      intro:
        'Our university team modeled a processor architecture in VHDL, then built an operating system for it using C and Assembly.',
      role: 'University team project',
      sections: [
        {
          title: 'Defining the hardware',
          body: 'The first semester focused on CPU hardware defined in VHDL. The architecture took inspiration from hardware comparable to the Raspberry Pi 2B.',
        },
        {
          title: 'Building on that architecture',
          body: 'In the following semester, the team implemented an operating system in C and Assembly. Documentation and register-manual debugging were part of moving from the hardware definition to working software.',
        },
      ],
    },
  },
];

export const orderedProjects = [...projects].sort((a, b) => a.order - b.order);

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function projectPath(project: Pick<Project, 'slug'>) {
  return `/work/${project.slug}`;
}
