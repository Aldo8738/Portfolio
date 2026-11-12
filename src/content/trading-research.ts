export type SourceId =
  'news' | 'discussion' | 'fundamentals' | 'market' | 'portfolio';
export type EvidenceId = 'N1' | 'O1' | 'F1' | 'F2' | 'M1' | 'P1';
type Provenance = 'NEWS' | 'OPINION' | 'FACT' | 'MARKET DATA' | 'CONTEXT';

export const tradingAgentStory = {
  name: 'LOS TRADING HERMANOS',
  introduction:
    'An AI research agent connecting financial data, market news, investor discussions, and portfolio context to support smarter investment decisions.',
  contribution: 'Co-built an initial research agent in under a month',
  engineeringHeading: 'Built to connect the context.',
  engineeringIntroduction:
    'A Python/LangGraph workflow turns company research and portfolio context into a structured assessment for human decisions.',
  workflow: [
    {
      title: 'Research inputs',
      detail:
        'Company data, market news, investor discussions, portfolio context.',
    },
    {
      title: 'Python / LangGraph',
      detail: 'Evidence extraction and synthesis.',
    },
    {
      title: 'Investment assessment',
      detail: 'Thesis, counterarguments, portfolio fit.',
    },
  ],
  contributions: ['Product ideation', 'UX', 'Implementation'],
  collaboration: 'Co-built with a colleague.',
  delivery: 'Under a month',
  deliveryContext: 'To co-build the initial research agent.',
} as const;

interface ResearchEntry {
  text: string;
  reference?: EvidenceId;
  highlightPhrase?: string;
  summary?: string;
  label?: string;
  value?: string;
}
export interface ResearchSource {
  id: SourceId;
  title: string;
  provenance: Provenance;
  description: string;
  entries: readonly ResearchEntry[];
}

function measurementEntry(
  label: string,
  value: string,
  reference?: EvidenceId,
): ResearchEntry {
  return { label, value, text: `${label} ${value}`, reference };
}

const allocation = { weight: 16, low: 10, high: 20 } as const;
const sixMonthReturn = 14.2;
const measurements = {
  revenue: '+12.4% YoY',
  margin: '18.7% (+3.1 pp)',
  netIncome: '+15.9% YoY',
  return: `+${sixMonthReturn}%`,
  price: 124.36,
  rangeLow: 89.1,
  rangeHigh: 132.4,
  volume: '4.2M',
  position: `${allocation.weight}%`,
  allocationBand: `${allocation.low}–${allocation.high}%`,
  sector: 'Technology',
} as const;

// An authored illustrative path, not retrieved historical prices.
const startingPrice = measurements.price / (1 + sixMonthReturn / 100);
const priceHistory = [
  0, 0.11, 0.06, 0.29, 0.24, 0.48, 0.38, 0.59, 0.54, 0.79, 0.7, 0.91, 1,
].map((progress) => startingPrice * (1 + (sixMonthReturn / 100) * progress));

export const researchCase = {
  company: 'ACME',
  disclaimer: 'Illustrative research case · Not live market data',
  question:
    'Do improving fundamentals justify further research into ACME, considering valuation concerns and existing portfolio exposure?',
  measurements,
  allocation,
  priceHistory,
} as const;

export const researchSources: readonly ResearchSource[] = [
  {
    id: 'news',
    title: 'Market News',
    provenance: 'NEWS',
    description: 'Illustrative secondary reporting',
    entries: [
      {
        text: 'Company reports a strong quarter, citing higher revenue and improved margins.',
        reference: 'N1',
        highlightPhrase: 'strong quarter',
        summary: 'Strong quarter reported in market news',
      },
    ],
  },
  {
    id: 'discussion',
    title: 'Investor Discussion',
    provenance: 'OPINION',
    description: 'Investor views · Not verified facts',
    entries: [
      { text: 'Execution looks encouraging.' },
      { text: 'Valuation may be getting stretched.', reference: 'O1' },
    ],
  },
  {
    id: 'fundamentals',
    title: 'Company Fundamentals',
    provenance: 'FACT',
    description: 'Illustrative financial measurements',
    entries: [
      measurementEntry('Revenue', measurements.revenue, 'F1'),
      measurementEntry('Operating margin', measurements.margin, 'F2'),
      measurementEntry('Net income', measurements.netIncome),
    ],
  },
  {
    id: 'market',
    title: 'Market Data',
    provenance: 'MARKET DATA',
    description: 'Observed movement · Not a prediction',
    entries: [
      measurementEntry('6-month return', measurements.return, 'M1'),
      measurementEntry('Sample price', measurements.price.toFixed(2)),
      measurementEntry(
        '52-week range',
        `${measurements.rangeLow.toFixed(2)}–${measurements.rangeHigh.toFixed(2)}`,
      ),
      measurementEntry('Average volume', measurements.volume),
    ],
  },
  {
    id: 'portfolio',
    title: 'Portfolio Context',
    provenance: 'CONTEXT',
    description: 'Illustrative private portfolio context',
    entries: [
      {
        text: `Position weight ${measurements.position}; allocation band ${measurements.allocationBand}.`,
        reference: 'P1',
      },
      { text: `Sector: ${measurements.sector}` },
    ],
  },
];

export const selectedEvidence = ['F1', 'F2', 'O1', 'P1', 'N1', 'M1'] as const;

// Fail static generation if an edited claim loses its unique source entry.
export function getResearchEvidence(id: EvidenceId) {
  const matches = researchSources.flatMap((source) =>
    source.entries
      .filter((entry) => entry.reference === id)
      .map((entry) => ({ ...entry, source })),
  );
  if (matches.length !== 1 || !matches[0]) {
    throw new Error(`Research evidence ${id} must resolve to one source entry`);
  }
  return matches[0];
}

export const researchAssessment = {
  thesis: `${researchCase.company} shows improving operational signals worth investigating further, with valuation and position sizing as the main cautions.`,
  supportingEvidence: ['F1', 'F2', 'N1', 'M1'] satisfies EvidenceId[],
  counterpoint: 'O1' satisfies EvidenceId,
  portfolio: `Current position ${measurements.position}, within allocation band ${measurements.allocationBand}`,
  portfolioReference: 'P1' satisfies EvidenceId,
} as const;

const introductionLines = ['One question.', 'Many signals.'] as const;
export const researchBeats = [
  {
    id: 'intro',
    label: '01 / ONE QUESTION',
    title: introductionLines.join(' '),
    lines: introductionLines,
    description: 'Financial data, news, opinions, and portfolio context.',
  },
  { id: 'sources', label: '02 / THE SOURCES' },
  {
    id: 'explain',
    label: '03 / FIND THE EVIDENCE',
    title: 'Find the evidence.',
    description: 'Relevant facts emerge. Conflicting views remain.',
  },
  { id: 'evidence', label: '04 / SELECTED EVIDENCE' },
  {
    id: 'synthesis',
    label: '05 / A CLEARER PERSPECTIVE',
    title: 'A clearer perspective.',
    description: 'Research brought together into one assessment.',
  },
  { id: 'assessment', label: '06 / INVESTMENT ASSESSMENT' },
] as const;
