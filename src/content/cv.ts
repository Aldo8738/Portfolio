import { getProject } from './portfolio';

export const skillGroups = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend & APIs' },
  { id: 'ai-data', label: 'AI & Data' },
  { id: 'quality-design', label: 'Quality & Design' },
  { id: 'systems', label: 'Systems' },
] as const;
export type SkillCategory = (typeof skillGroups)[number]['id'];
export interface Skill {
  id: string;
  label: string;
  category: SkillCategory;
  order: number;
}
interface CareerBase {
  id: string;
  kind: 'employment' | 'education';
  order: number;
  organization: string;
  displayName: string;
  websiteUrl: string;
  role: string;
  start: string;
  location: string;
  summary: string;
  details: string[];
  skillIds: string[];
  relatedProjectId?: string;
  highlight?: string;
}
export type CareerEntry = CareerBase &
  ({ end: null; current: true } | { end: string; current?: false });
export interface CvContent {
  eyebrow: string;
  headline: string;
  intro: string;
  educationIntro: string;
  toolboxIntro: string;
  experience: CareerEntry[];
  education: CareerEntry[];
  languages: { label: string; level: string }[];
  certifications: { title: string; issuer: string; year: number }[];
  download: { url: string; format: 'PDF' | 'DOCX' } | null;
}

export const skills: Skill[] = [
  { id: 'typescript', label: 'TypeScript', category: 'frontend', order: 1 },
  { id: 'javascript', label: 'JavaScript', category: 'frontend', order: 2 },
  { id: 'angular', label: 'Angular', category: 'frontend', order: 3 },
  { id: 'react', label: 'React', category: 'frontend', order: 4 },
  { id: 'vue', label: 'Vue', category: 'frontend', order: 5 },
  { id: 'tailwind', label: 'Tailwind', category: 'frontend', order: 6 },
  { id: 'scss', label: 'SCSS', category: 'frontend', order: 7 },
  { id: 'mui', label: 'MUI', category: 'frontend', order: 8 },
  { id: 'node', label: 'Node.js', category: 'backend', order: 1 },
  { id: 'express', label: 'Express', category: 'backend', order: 2 },
  { id: 'python', label: 'Python', category: 'backend', order: 3 },
  { id: 'fastapi', label: 'FastAPI', category: 'backend', order: 4 },
  { id: 'graphql', label: 'GraphQL', category: 'backend', order: 5 },
  { id: 'rest', label: 'REST', category: 'backend', order: 6 },
  { id: 'postgresql', label: 'PostgreSQL', category: 'backend', order: 7 },
  { id: 'd3', label: 'D3', category: 'ai-data', order: 1 },
  {
    id: 'agent-testing',
    label: 'AI-agent testing',
    category: 'ai-data',
    order: 2,
  },
  { id: 'langgraph', label: 'LangGraph', category: 'ai-data', order: 3 },
  { id: 'langchain', label: 'LangChain', category: 'ai-data', order: 4 },
  {
    id: 'execution-tracing',
    label: 'Execution tracing',
    category: 'ai-data',
    order: 5,
  },
  {
    id: 'knowledge-graphs',
    label: 'Knowledge graphs',
    category: 'ai-data',
    order: 6,
  },
  {
    id: 'data-visualization',
    label: 'Data visualization',
    category: 'ai-data',
    order: 7,
  },
  {
    id: 'playwright',
    label: 'Playwright',
    category: 'quality-design',
    order: 1,
  },
  { id: 'jest', label: 'Jest', category: 'quality-design', order: 2 },
  {
    id: 'react-testing-library',
    label: 'React Testing Library',
    category: 'quality-design',
    order: 3,
  },
  { id: 'figma', label: 'Figma', category: 'quality-design', order: 4 },
  { id: 'c', label: 'C', category: 'systems', order: 1 },
  { id: 'assembly', label: 'Assembly', category: 'systems', order: 2 },
  { id: 'vhdl', label: 'VHDL', category: 'systems', order: 3 },
];

// Source: docs/CV_CODEX_IMPLEMENTATION_BRIEF.md. No public résumé asset was supplied.
export const cv: CvContent = {
  eyebrow: '02 / Experience',
  headline: 'The road so far.',
  intro: 'From editorial tools to AI agents.',
  educationIntro: 'Study alongside professional work.',
  toolboxIntro: 'Tools across roles and projects.',
  experience: [
    {
      id: 'sap',
      kind: 'employment',
      order: 1,
      organization: 'SAP',
      displayName: 'SAP',
      websiteUrl: 'https://www.sap.com/products/artificial-intelligence.html',
      role: 'Software Engineer',
      location: 'Berlin',
      start: '2025-03',
      end: null,
      current: true,
      summary:
        'Building tools to create, test, and debug AI agents in Joule Studio.',
      details: [
        'Leading improvements to the agent testing experience: execution-trace visualization, trace filtering, tool-error detection, and debugging UX.',
        'Collaborating across product, design, and engineering, primarily with Angular and TypeScript, with backend contributions in Node.js and Express.',
      ],
      skillIds: [
        'angular',
        'typescript',
        'd3',
        'node',
        'express',
        'jest',
        'playwright',
        'agent-testing',
        'execution-tracing',
      ],
    },
    {
      id: 'koppla',
      kind: 'employment',
      order: 2,
      organization: 'koppla',
      displayName: 'koppla',
      websiteUrl: 'https://www.koppla.de/',
      role: 'Frontend Engineer · Working Student',
      location: 'Berlin',
      start: '2023-06',
      end: '2024-08',
      summary:
        'Building analytics, scheduling, and data-heavy interfaces for construction management.',
      details: [
        'Developed data-visualization dashboards, scheduling workflows, and reusable components.',
        'Worked on GraphQL integration and improvements to testing and quality assurance.',
      ],
      skillIds: [
        'vue',
        'typescript',
        'tailwind',
        'graphql',
        'playwright',
        'figma',
      ],
    },
    {
      id: 'axel-springer',
      kind: 'employment',
      order: 3,
      organization: 'Axel Springer National Media and Tech',
      displayName: 'Axel Springer',
      websiteUrl: 'https://www.axelspringer.com/en/brands',
      role: 'Frontend Developer · Working Student',
      location: 'Berlin',
      start: '2022-03',
      end: '2023-02',
      summary:
        'Improving editorial workflows and internal content management tools.',
      details: [
        'Built and refactored React components for editorial tools at Axel Springer National Media and Tech.',
        'Contributed to editorial UX improvements, frontend testing, and quality assurance.',
      ],
      skillIds: [
        'react',
        'typescript',
        'mui',
        'graphql',
        'jest',
        'playwright',
        'figma',
      ],
    },
  ],
  education: [
    {
      id: 'tu-berlin',
      kind: 'education',
      order: 1,
      organization: 'Technische Universität Berlin',
      displayName: 'TU Berlin',
      websiteUrl:
        'https://www.tu.berlin/en/eecs/academics-teaching/organizing-your-studies/during-your-studies/bsc-computer-engineering',
      role: 'B.Sc. Computer Engineering',
      location: 'Berlin',
      start: '2020-10',
      end: '2024-08',
      summary:
        'Knowledge Bridge: An Interface for Real-Time Human–AI Collaboration on Knowledge Graphs',
      details: [],
      skillIds: [],
      highlight: 'Thesis grade: 1.0',
      relatedProjectId: 'knowledge-bridge',
    },
  ],
  languages: [
    { label: 'Spanish', level: 'Native' },
    { label: 'English', level: 'C1 · Fluent' },
    { label: 'German', level: 'C1 · DSH-2' },
  ],
  certifications: [],
  download: null,
};

export function formatCareerMonth(value: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))
    throw new Error(`Invalid CV month: ${value}`);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}-01T00:00:00Z`));
}

export function assertCvContent(content: CvContent, catalog: readonly Skill[]) {
  const skillIds = new Set(catalog.map((skill) => skill.id));
  if (skillIds.size !== catalog.length)
    throw new Error('CV skill IDs must be unique');
  for (const skill of catalog) {
    if (!skillGroups.some((group) => group.id === skill.category))
      throw new Error(`Unknown CV skill category: ${skill.category}`);
  }
  const entries = [...content.experience, ...content.education];
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length)
    throw new Error('CV career IDs must be unique');
  for (const group of [content.experience, content.education]) {
    if (new Set(group.map((entry) => entry.order)).size !== group.length)
      throw new Error(
        'CV career display orders must be unique within each section',
      );
  }
  for (const entry of entries) {
    formatCareerMonth(entry.start);
    if ((entry.end === null) !== Boolean(entry.current))
      throw new Error(`CV current flag disagrees with dates: ${entry.id}`);
    if (entry.end !== null) {
      formatCareerMonth(entry.end);
      if (entry.end < entry.start)
        throw new Error(`CV end precedes start: ${entry.id}`);
    }
    if (!content.experience.includes(entry) && entry.kind !== 'education')
      throw new Error(`CV education kind mismatch: ${entry.id}`);
    if (content.experience.includes(entry) && entry.kind !== 'employment')
      throw new Error(`CV employment kind mismatch: ${entry.id}`);
    for (const id of entry.skillIds)
      if (!skillIds.has(id))
        throw new Error(`Unknown CV skill reference: ${id}`);
    if (entry.relatedProjectId && !getProject(entry.relatedProjectId))
      throw new Error(
        `Unknown CV project reference: ${entry.relatedProjectId}`,
      );
  }
}

assertCvContent(cv, skills);
export const experience = [...cv.experience].sort((a, b) => a.order - b.order);
export const education = [...cv.education].sort((a, b) => a.order - b.order);

export function getSkill(id: string) {
  const skill = skills.find((skill) => skill.id === id);
  if (!skill) throw new Error(`Unknown CV skill: ${id}`);
  return skill;
}
